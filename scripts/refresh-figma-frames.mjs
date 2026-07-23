import { readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const FILE_KEY = process.env.FIGMA_FILE_KEY || 'RiA8nK980GGodTdKpD24hh';
const TOKEN = process.env.FIGMA_TOKEN;
const TARGET_ARG = process.argv.find((arg) => arg.startsWith('--ids='));
const CHUNK_SIZE = Number(process.env.FIGMA_CHUNK_SIZE || 3);
const WAIT_MS = Number(process.env.FIGMA_RETRY_WAIT_MS || 65000);

if (!TOKEN) {
  console.error('FIGMA_TOKEN env variable is required. Token is read from env only and is never written to repo files.');
  process.exit(1);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const readJson = async (file) => JSON.parse(await readFile(file, 'utf8'));
const writeJson = async (file, data) => writeFile(file, JSON.stringify(data, null, 2), 'utf8');
const writeMinJson = async (file, data) => writeFile(file, JSON.stringify(data), 'utf8');

async function frameFilesById(dir) {
  const out = new Map();
  for (const name of await readdir(dir)) {
    if (!name.endsWith('.json')) continue;
    const file = path.join(dir, name);
    try {
      const data = await readJson(file);
      if (data?.id) out.set(data.id, file);
    } catch {
      // ignore non-frame JSON files
    }
  }
  return out;
}

async function figmaFetch(ids) {
  const params = new URLSearchParams({ ids: ids.join(','), geometry: 'paths' });
  const url = `https://api.figma.com/v1/files/${FILE_KEY}/nodes?${params}`;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    const response = await fetch(url, { headers: { 'X-Figma-Token': TOKEN } });
    if (response.status === 429 && attempt < 4) {
      console.warn(`Figma rate limit for ${ids.join(', ')}; waiting ${WAIT_MS}ms before retry ${attempt + 1}.`);
      await sleep(WAIT_MS);
      continue;
    }
    if (!response.ok) throw new Error(`Figma API ${response.status}: ${await response.text()}`);
    return response.json();
  }
}

function walk(node, visitor, parentId = null, depth = 0) {
  visitor(node, parentId, depth);
  for (const child of node.children || []) walk(child, visitor, node.id, depth + 1);
}

function countFrame(document, resolvedMissingCount = 0) {
  const counts = {};
  const imageRefs = new Set();
  let geometryNodeCount = 0;
  let exactVectorGeometryNodeCount = 0;
  let prototypeInteractionCount = 0;
  let variantRecordCount = 0;
  walk(document, (node) => {
    counts[node.type] = (counts[node.type] || 0) + 1;
    if (node.fillGeometry || node.strokeGeometry) geometryNodeCount += 1;
    if (['VECTOR', 'STAR', 'BOOLEAN_OPERATION', 'LINE', 'REGULAR_POLYGON'].includes(node.type) && (node.fillGeometry || node.strokeGeometry)) exactVectorGeometryNodeCount += 1;
    if (node.interactions?.length) prototypeInteractionCount += 1;
    if (node.type === 'COMPONENT_SET' || node.componentPropertyDefinitions || node.variantProperties) variantRecordCount += 1;
    for (const paint of [...(node.fills || []), ...(node.background || [])]) {
      if (paint.type === 'IMAGE' && paint.imageRef) imageRefs.add(paint.imageRef);
    }
  });
  return {
    frameId: document.id,
    frameName: document.name,
    totalNodes: Object.values(counts).reduce((a, b) => a + b, 0),
    nodeCountsByType: counts,
    geometryNodeCount,
    exactVectorGeometryNodeCount,
    imageFillRefCount: imageRefs.size,
    prototypeInteractionCount,
    variantRecordCount,
    resolvedMissingExactAssetEntries: resolvedMissingCount,
  };
}

function resolvedVectorNodes(document) {
  const nodes = [];
  walk(document, (node, parentId, depth) => {
    if (['VECTOR', 'STAR', 'BOOLEAN_OPERATION', 'LINE', 'REGULAR_POLYGON'].includes(node.type) && (node.fillGeometry || node.strokeGeometry)) {
      nodes.push({
        rootFrameId: document.id,
        id: node.id,
        name: node.name,
        type: node.type,
        parentId,
        depth,
        fillGeometryCount: node.fillGeometry?.length || 0,
        strokeGeometryCount: node.strokeGeometry?.length || 0,
        bbox: node.absoluteBoundingBox,
      });
    }
  });
  return nodes;
}

const manifest = await readJson('figma-nodes/manifest.json');
const targetIds = TARGET_ARG
  ? TARGET_ARG.slice('--ids='.length).split(',').map((id) => id.trim()).filter(Boolean)
  : manifest.map((frame) => frame.id);

const sourceFiles = await frameFilesById('figma-nodes');
const runtimeFiles = await frameFilesById('public/figma-frames');
const missingFile = 'figma-audit/missing-exact-assets.json';
let missing = await readJson(missingFile);
const allResolved = [];
const summaries = [];

for (let i = 0; i < targetIds.length; i += CHUNK_SIZE) {
  const ids = targetIds.slice(i, i + CHUNK_SIZE);
  const payload = await figmaFetch(ids);
  for (const id of ids) {
    const document = payload.nodes?.[id]?.document;
    if (!document) throw new Error(`Figma response did not include document for ${id}`);
    const src = sourceFiles.get(id);
    const run = runtimeFiles.get(id);
    if (!src || !run) throw new Error(`Missing local frame JSON path for ${id}`);
    await writeMinJson(src, document);
    await writeMinJson(run, document);
    const resolvedMissing = missing.filter((entry) => entry.rootFrameId === id);
    missing = missing.filter((entry) => entry.rootFrameId !== id);
    const resolvedNodes = resolvedVectorNodes(document);
    allResolved.push(...resolvedNodes);
    summaries.push(countFrame(document, resolvedMissing.length));
    console.log(`${id}: refreshed, resolved audit entries ${resolvedMissing.length}, exact vector geometry nodes ${resolvedNodes.length}`);
  }
}

await writeJson(missingFile, missing);
await writeJson('figma-audit/live-geometry-refresh-summary.json', {
  scope: TARGET_ARG ? 'selected frames' : 'all manifest frames',
  figmaFileKey: FILE_KEY,
  geometry: 'paths',
  refreshedFrameIds: targetIds,
  frames: summaries,
  aggregate: {
    totalFrames: summaries.length,
    totalNodes: summaries.reduce((sum, item) => sum + item.totalNodes, 0),
    totalGeometryNodes: summaries.reduce((sum, item) => sum + item.geometryNodeCount, 0),
    totalExactVectorGeometryNodes: summaries.reduce((sum, item) => sum + item.exactVectorGeometryNodeCount, 0),
    totalResolvedMissingExactAssetEntries: summaries.reduce((sum, item) => sum + item.resolvedMissingExactAssetEntries, 0),
    remainingMissingExactAssetEntries: missing.length,
  },
});
await writeJson('figma-audit/live-geometry-resolved-vector-nodes.json', allResolved);
console.log(`Done. Remaining missing exact asset audit entries: ${missing.length}`);
