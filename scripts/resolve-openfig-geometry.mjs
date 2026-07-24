import { existsSync } from 'node:fs';
import { readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const CHECK = process.argv.includes('--check');
const REAPPLY_RESOLVED_SUMMARY = process.argv.includes('--reapply-resolved-summary') || process.env.OPENFIG_REAPPLY_RESOLVED_SUMMARY === '1';
const FIG_PATH = process.env.OPENFIG_FILE || 'tools/design-import/fixtures/untitled.fig';
const OPENFIG_DECK = 'tools/design-import/node_modules/openfig-cli/lib/core/fig-deck.mjs';
const OPENFIG_HELPERS = 'tools/design-import/node_modules/openfig-cli/lib/core/node-helpers.mjs';
const VECTOR_TYPES = new Set(['VECTOR', 'LINE', 'REGULAR_POLYGON', 'STAR', 'BOOLEAN_OPERATION']);
const TYPE_MAP = new Map([
  ['ROUNDED_RECTANGLE', 'RECTANGLE'],
  ['RECTANGLE', 'RECTANGLE'],
  ['ELLIPSE', 'ELLIPSE'],
  ['FRAME', 'FRAME'],
  ['GROUP', 'GROUP'],
  ['VECTOR', 'VECTOR'],
  ['LINE', 'LINE'],
  ['REGULAR_POLYGON', 'REGULAR_POLYGON'],
  ['TEXT', 'TEXT'],
  ['INSTANCE', 'INSTANCE'],
  ['SYMBOL', 'COMPONENT'],
]);
const BBOX_TOLERANCE = Number(process.env.OPENFIG_BBOX_TOLERANCE || 0.75);
const FRAME_TOLERANCE = Number(process.env.OPENFIG_FRAME_TOLERANCE || 2);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const readJson = async (file) => JSON.parse(await readFile(file, 'utf8'));
const jsonText = (data) => `${JSON.stringify(data, null, 2)}\n`;
const writeJson = async (file, data) => writeFile(file, jsonText(data), 'utf8');
const writeMinJson = async (file, data) => writeFile(file, JSON.stringify(data), 'utf8');

async function writeTextOrCheck(file, nextText) {
  if (!CHECK) {
    await writeFile(file, nextText, 'utf8');
    return;
  }
  const currentText = await readFile(file, 'utf8');
  if (currentText !== nextText) {
    console.error(`${file} is stale. Run npm run figma:openfig:resolve.`);
    process.exitCode = 1;
  }
}

async function writeJsonOrCheck(file, data) {
  await writeTextOrCheck(file, jsonText(data));
}

function requireOpenFigDependency() {
  const deckPath = path.join(repoRoot, OPENFIG_DECK);
  const helperPath = path.join(repoRoot, OPENFIG_HELPERS);
  if (!existsSync(deckPath) || !existsSync(helperPath)) {
    throw new Error('OpenFig dependency is missing. Run: cd tools/design-import && npm ci');
  }
}

function transformIdentity() {
  return { m00: 1, m01: 0, m02: 0, m10: 0, m11: 1, m12: 0 };
}

function multiplyTransform(a, b) {
  return {
    m00: a.m00 * b.m00 + a.m01 * b.m10,
    m01: a.m00 * b.m01 + a.m01 * b.m11,
    m02: a.m00 * b.m02 + a.m01 * b.m12 + a.m02,
    m10: a.m10 * b.m00 + a.m11 * b.m10,
    m11: a.m10 * b.m01 + a.m11 * b.m11,
    m12: a.m10 * b.m02 + a.m11 * b.m12 + a.m12,
  };
}

function invertTransform(matrix) {
  const determinant = matrix.m00 * matrix.m11 - matrix.m01 * matrix.m10;
  if (Math.abs(determinant) < 0.000001) return null;
  const inv00 = matrix.m11 / determinant;
  const inv01 = -matrix.m01 / determinant;
  const inv10 = -matrix.m10 / determinant;
  const inv11 = matrix.m00 / determinant;
  return {
    m00: inv00,
    m01: inv01,
    m02: -(inv00 * matrix.m02 + inv01 * matrix.m12),
    m10: inv10,
    m11: inv11,
    m12: -(inv10 * matrix.m02 + inv11 * matrix.m12),
  };
}

function localTransformFromAbsolute(parentAbsolute, childAbsolute) {
  const inverseParent = invertTransform(parentAbsolute);
  if (!inverseParent) return null;
  return multiplyTransform(inverseParent, childAbsolute);
}

function figmaLocalMatrix(node) {
  if (Array.isArray(node.relativeTransform) && node.relativeTransform.length === 2 && node.size) {
    const [[m00, m01, m02], [m10, m11, m12]] = node.relativeTransform;
    if ([m00, m01, m02, m10, m11, m12].every(Number.isFinite)) return { m00, m01, m02, m10, m11, m12 };
  }
  const box = node.absoluteBoundingBox;
  return box ? { m00: 1, m01: 0, m02: box.x, m10: 0, m11: 1, m12: box.y } : transformIdentity();
}

function buildFigmaContext(root) {
  const rootBox = root.absoluteBoundingBox || { x: 0, y: 0 };
  const rootMatrix = { m00: 1, m01: 0, m02: rootBox.x, m10: 0, m11: 1, m12: rootBox.y };
  const parentById = new Map();
  const absoluteMatrixById = new Map();
  function walk(node, parent, parentAbsolute) {
    const absoluteMatrix = parent ? multiplyTransform(parentAbsolute, figmaLocalMatrix(node)) : rootMatrix;
    parentById.set(node.id, parent);
    absoluteMatrixById.set(node.id, absoluteMatrix);
    for (const child of node.children || []) walk(child, node, absoluteMatrix);
  }
  walk(root, null, rootMatrix);
  return { parentById, absoluteMatrixById, rootMatrix };
}

function bboxFromNodeAndMatrix(node, matrix) {
  if (!node.size) return null;
  const { x: width, y: height } = node.size;
  if (![width, height].every(Number.isFinite)) return null;
  const corners = [
    [0, 0],
    [width, 0],
    [0, height],
    [width, height],
  ].map(([x, y]) => ({
    x: matrix.m00 * x + matrix.m01 * y + matrix.m02,
    y: matrix.m10 * x + matrix.m11 * y + matrix.m12,
  }));
  const xs = corners.map((corner) => corner.x);
  const ys = corners.map((corner) => corner.y);
  return {
    x: Math.min(...xs),
    y: Math.min(...ys),
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys),
  };
}

function nodeIdFromGuid(guid) {
  return `${guid.sessionID}:${guid.localID}`;
}

function closeEnough(a, b, tolerance) {
  return Math.abs(a - b) <= tolerance;
}

function sameSize(a, b, tolerance = 0.75) {
  return a && b && closeEnough(a.width, b.width, tolerance) && closeEnough(a.height, b.height, tolerance);
}

function relativeBox(box, rootBox) {
  return {
    x: box.x - rootBox.x,
    y: box.y - rootBox.y,
    width: box.width,
    height: box.height,
  };
}

function bboxDistance(a, b) {
  return Math.max(
    Math.abs(a.x - b.x),
    Math.abs(a.y - b.y),
    Math.abs(a.width - b.width),
    Math.abs(a.height - b.height),
  );
}

function bboxMatches(a, b, tolerance = BBOX_TOLERANCE) {
  return bboxDistance(a, b) <= tolerance;
}

function normalizedName(value) {
  return String(value || '').normalize('NFC').trim();
}

function namesCompatible(openName, figmaName) {
  const open = normalizedName(openName);
  const figma = normalizedName(figmaName);
  return open === figma || open.endsWith(figma) || figma.endsWith(open);
}

function typeOfOpenNode(node) {
  return TYPE_MAP.get(node.type) || node.type;
}

function typesCompatible(entryType, openType) {
  const mapped = TYPE_MAP.get(openType) || openType;
  if (mapped === entryType) return true;
  if (entryType === 'VECTOR' && ['VECTOR', 'RECTANGLE', 'ELLIPSE', 'LINE', 'REGULAR_POLYGON'].includes(mapped)) return true;
  return false;
}

function decodeCmdBlob(blobs, blobIndex) {
  if (blobIndex == null || !blobs?.[blobIndex]) return null;
  const raw = blobs[blobIndex].bytes ?? blobs[blobIndex];
  if (!raw) return null;
  const buf = Buffer.from(raw);
  const commands = [];
  let offset = 0;
  const fmt = (value) => Number(value.toFixed(4)).toString();
  while (offset < buf.length) {
    const command = buf[offset++];
    if (command === 0x01) {
      if (offset + 8 > buf.length) break;
      const x = buf.readFloatLE(offset); offset += 4;
      const y = buf.readFloatLE(offset); offset += 4;
      commands.push(`M${fmt(x)} ${fmt(y)}`);
    } else if (command === 0x02) {
      if (offset + 8 > buf.length) break;
      const x = buf.readFloatLE(offset); offset += 4;
      const y = buf.readFloatLE(offset); offset += 4;
      commands.push(`L${fmt(x)} ${fmt(y)}`);
    } else if (command === 0x04) {
      if (offset + 24 > buf.length) break;
      const c1x = buf.readFloatLE(offset); offset += 4;
      const c1y = buf.readFloatLE(offset); offset += 4;
      const c2x = buf.readFloatLE(offset); offset += 4;
      const c2y = buf.readFloatLE(offset); offset += 4;
      const x = buf.readFloatLE(offset); offset += 4;
      const y = buf.readFloatLE(offset); offset += 4;
      commands.push(`C${fmt(c1x)} ${fmt(c1y)} ${fmt(c2x)} ${fmt(c2y)} ${fmt(x)} ${fmt(y)}`);
    } else if (command === 0x00) {
      commands.push('Z');
    } else {
      return null;
    }
  }
  return commands.length ? commands.join(' ') : null;
}

function decodeGeometryRefs(blobs, refs = []) {
  const out = [];
  for (const ref of refs || []) {
    const path = decodeCmdBlob(blobs, ref.commandsBlob);
    if (!path) continue;
    out.push({
      path,
      windingRule: ref.windingRule || 'NONZERO',
    });
  }
  return out;
}

function geometrySignature(blobs, record) {
  const fillGeometry = decodeGeometryRefs(blobs, record.node.fillGeometry);
  const strokeGeometry = decodeGeometryRefs(blobs, record.node.strokeGeometry);
  if (!fillGeometry.length && !strokeGeometry.length) return null;
  return JSON.stringify({
    type: record.node.type,
    size: record.node.size || null,
    fillGeometry,
    strokeGeometry,
  });
}

function walkFigma(node, visitor) {
  visitor(node);
  for (const child of node.children || []) walkFigma(child, visitor);
}

function findFigmaNode(root, id) {
  let found = null;
  walkFigma(root, (node) => {
    if (!found && node.id === id) found = node;
  });
  return found;
}

function hasVisibleImageFill(node) {
  return [...(node?.fills || []), ...(node?.background || [])]
    .some((paint) => paint.visible !== false && paint.type === 'IMAGE');
}

async function frameFilesById(dir) {
  const out = new Map();
  for (const fileName of await readdir(dir)) {
    if (!fileName.endsWith('.json')) continue;
    const filePath = path.join(dir, fileName);
    try {
      const data = await readJson(filePath);
      if (data?.id) out.set(data.id, filePath);
    } catch {
      // ignore non-frame JSON files
    }
  }
  return out;
}

function buildOpenFigRecords(deck, nid) {
  const children = new Map();
  for (const node of deck.message.nodeChanges) {
    const id = nid(node);
    const parentId = node.parentIndex?.guid ? nodeIdFromGuid(node.parentIndex.guid) : null;
    if (parentId) {
      if (!children.has(parentId)) children.set(parentId, []);
      children.get(parentId).push(node);
    }
  }

  const roots = deck.message.nodeChanges.filter((node) => !node.parentIndex?.guid);
  const records = [];
  const byId = new Map();
  function walk(node, matrix, depth, parentId) {
    const id = nid(node);
    const ownMatrix = node.transform || transformIdentity();
    const absoluteMatrix = multiplyTransform(matrix, ownMatrix);
    const bbox = bboxFromNodeAndMatrix(node, absoluteMatrix);
    const record = { id, node, parentId, depth, bbox, absoluteMatrix, mappedType: typeOfOpenNode(node), children: [] };
    records.push(record);
    byId.set(id, record);
    if (parentId && byId.has(parentId)) byId.get(parentId).children.push(record);
    for (const child of children.get(id) || []) walk(child, absoluteMatrix, depth + 1, id);
  }
  for (const root of roots) walk(root, transformIdentity(), 0, null);
  return { records, byId };
}

function chooseDominantOffset(manifest, frameDocs, openFrameRecords) {
  const offsetCounts = new Map();
  const pairs = [];
  for (const frame of manifest) {
    const figmaBox = frameDocs.get(frame.id)?.absoluteBoundingBox;
    if (!figmaBox) continue;
    for (const openFrame of openFrameRecords) {
      if (openFrame.mappedType !== 'FRAME') continue;
      if (!openFrame.bbox || !openFrame.node.size) continue;
      if (!namesCompatible(openFrame.node.name, frame.name)) continue;
      if (!closeEnough(openFrame.node.size.x, frame.width, 0.75) || !closeEnough(openFrame.node.size.y, frame.height, 0.75)) continue;
      const dx = figmaBox.x - openFrame.bbox.x;
      const dy = figmaBox.y - openFrame.bbox.y;
      const key = `${Math.round(dx)}:${Math.round(dy)}`;
      offsetCounts.set(key, (offsetCounts.get(key) || 0) + 1);
      pairs.push({ frameId: frame.id, openFrameId: openFrame.id, dx, dy, key });
    }
  }
  const [bestKey, count] = [...offsetCounts.entries()].sort((a, b) => b[1] - a[1])[0] || [];
  if (!bestKey) throw new Error('Could not infer a dominant Figma↔OpenFig coordinate offset.');
  const [dx, dy] = bestKey.split(':').map(Number);
  return { dx, dy, count, candidatePairs: pairs.filter((pair) => pair.key === bestKey) };
}

function mapFrames(manifest, frameDocs, openFrameRecords, dominantOffset) {
  const mapped = new Map();
  const candidatesByFrame = [];
  for (const frame of manifest) {
    const figmaBox = frameDocs.get(frame.id)?.absoluteBoundingBox;
    if (!figmaBox) continue;
    const candidates = openFrameRecords
      .filter((openFrame) => {
        if (openFrame.mappedType !== 'FRAME') return false;
        if (!openFrame.bbox || !openFrame.node.size) return false;
        if (!namesCompatible(openFrame.node.name, frame.name)) return false;
        if (!closeEnough(openFrame.node.size.x, frame.width, 0.75) || !closeEnough(openFrame.node.size.y, frame.height, 0.75)) return false;
        const dx = figmaBox.x - openFrame.bbox.x;
        const dy = figmaBox.y - openFrame.bbox.y;
        return Math.abs(dx - dominantOffset.dx) <= FRAME_TOLERANCE && Math.abs(dy - dominantOffset.dy) <= FRAME_TOLERANCE;
      })
      .map((openFrame) => {
        const dx = figmaBox.x - openFrame.bbox.x;
        const dy = figmaBox.y - openFrame.bbox.y;
        return {
          openFrameId: openFrame.id,
          openFrameName: openFrame.node.name,
          openFrameBbox: openFrame.bbox,
          figmaFrameId: frame.id,
          figmaFrameName: frame.name,
          figmaFrameBbox: figmaBox,
          delta: { dx, dy },
          score: Math.abs(dx - dominantOffset.dx) + Math.abs(dy - dominantOffset.dy),
          record: openFrame,
        };
      })
      .sort((a, b) => a.score - b.score);
    candidatesByFrame.push({ frameId: frame.id, frameName: frame.name, candidates: candidates.map(({ record, ...rest }) => rest) });
    if (candidates.length === 1 || (candidates.length > 1 && candidates[0].score + 0.01 < candidates[1].score)) {
      mapped.set(frame.id, candidates[0].record);
    }
  }
  return { mapped, candidatesByFrame };
}

function collectDescendants(openFrame) {
  const out = [];
  const stack = [...openFrame.children];
  while (stack.length) {
    const item = stack.shift();
    out.push(item);
    stack.push(...item.children);
  }
  return out;
}

function patchNodeGeometryAndTransform(targetNode, figmaContext, openRecord, dominantOffset, fillGeometry, strokeGeometry) {
  if (fillGeometry.length) targetNode.fillGeometry = fillGeometry;
  if (strokeGeometry.length) targetNode.strokeGeometry = strokeGeometry;
  if (openRecord?.node?.size && Number.isFinite(openRecord.node.size.x) && Number.isFinite(openRecord.node.size.y)) {
    targetNode.size = { x: openRecord.node.size.x, y: openRecord.node.size.y };
    targetNode.targetAspectRatio = { x: openRecord.node.size.x, y: openRecord.node.size.y };
  }
  if (!openRecord?.absoluteMatrix) return;
  const parent = figmaContext.parentById.get(targetNode.id);
  const parentAbsolute = parent ? figmaContext.absoluteMatrixById.get(parent.id) : figmaContext.rootMatrix;
  if (!parentAbsolute) return;
  const desiredAbsolute = {
    ...openRecord.absoluteMatrix,
    m02: openRecord.absoluteMatrix.m02 + dominantOffset.dx,
    m12: openRecord.absoluteMatrix.m12 + dominantOffset.dy,
  };
  const local = localTransformFromAbsolute(parentAbsolute, desiredAbsolute);
  if (!local) return;
  targetNode.relativeTransform = [
    [local.m00, local.m01, local.m02],
    [local.m10, local.m11, local.m12],
  ];
}

requireOpenFigDependency();
const [{ FigDeck }, { nid }] = await Promise.all([
  import(pathToFileURL(path.join(repoRoot, OPENFIG_DECK)).href),
  import(pathToFileURL(path.join(repoRoot, OPENFIG_HELPERS)).href),
]);
const figFilePath = path.join(repoRoot, FIG_PATH);
const deck = await FigDeck.fromFile(figFilePath);
const open = buildOpenFigRecords(deck, nid);
const openFrameRecords = open.records.filter((record) => record.mappedType === 'FRAME' && record.bbox && record.node.size);

const manifest = await readJson('figma-nodes/manifest.json');
const sourceFiles = await frameFilesById('figma-nodes');
const runtimeFiles = await frameFilesById('public/figma-frames');
const frameDocs = new Map();
for (const frame of manifest) frameDocs.set(frame.id, await readJson(path.join('public/figma-frames', frame.file)));

const dominantOffset = chooseDominantOffset(manifest, frameDocs, openFrameRecords);
const frameMap = mapFrames(manifest, frameDocs, openFrameRecords, dominantOffset);
const missing = await readJson('figma-audit/missing-exact-assets.json');
const previousSummary = REAPPLY_RESOLVED_SUMMARY && existsSync('figma-audit/openfig-geometry-resolve-summary.json')
  ? await readJson('figma-audit/openfig-geometry-resolve-summary.json')
  : null;
const missingWorkItems = missing.map((entry) => ({ entry, fromMissingAudit: true }));
const unsupported = existsSync('figma-audit/unsupported-render-features.json')
  ? await readJson('figma-audit/unsupported-render-features.json')
  : { features: [] };
const strokeWorkItems = (unsupported.features || [])
  .filter((entry) => entry.kind === 'nonInsideStrokeAlignNotRenderedExactly')
  .filter((entry) => !missing.some((missingEntry) => missingEntry.rootFrameId === entry.rootFrameId && missingEntry.id === entry.id))
  .map((entry) => ({ entry, fromMissingAudit: false, fromStrokeAudit: true }));
const reapplyWorkItems = (previousSummary?.resolved || [])
  .filter((entry) => entry.openFigNodeId)
  .filter((entry) => !missing.some((missingEntry) => missingEntry.rootFrameId === entry.rootFrameId && missingEntry.id === entry.id))
  .map((entry) => ({ entry, fromMissingAudit: false, reapplyOnly: true }));
const workItems = [...missingWorkItems, ...strokeWorkItems, ...reapplyWorkItems];
const unresolved = [];
const resolved = [];
const resolvedStrokeAudit = [];
const unresolvedStrokeAudit = [];
const reapplied = [];
const frameDocMutations = new Map();
const openDescendantsByFrame = new Map();

for (const workItem of workItems) {
  const entry = workItem.entry;
  const figmaFrame = frameDocs.get(entry.rootFrameId);
  const openFrame = frameMap.mapped.get(entry.rootFrameId);
  if (!figmaFrame || !openFrame) {
    unresolved.push({ ...entry, reason: 'No unique OpenFig frame mapping.' });
    continue;
  }
  if (!openDescendantsByFrame.has(entry.rootFrameId)) openDescendantsByFrame.set(entry.rootFrameId, collectDescendants(openFrame));
  const descendants = openDescendantsByFrame.get(entry.rootFrameId);
  const wantedRelative = entry.bbox ? relativeBox(entry.bbox, figmaFrame.absoluteBoundingBox) : null;
  let candidates;
  if (entry.openFigNodeId) {
    const record = open.byId.get(entry.openFigNodeId);
    candidates = record ? [{ record, rel: record.bbox ? relativeBox(record.bbox, openFrame.bbox) : null, distance: 0, exactType: true }] : [];
  } else {
    candidates = descendants
      .filter((record) => record.bbox)
      .filter((record) => typesCompatible(entry.type, record.node.type))
      .filter((record) => normalizedName(record.node.name) === normalizedName(entry.name))
      .map((record) => {
        const rel = relativeBox(record.bbox, openFrame.bbox);
        return { record, rel, distance: bboxDistance(rel, wantedRelative), exactType: (TYPE_MAP.get(record.node.type) || record.node.type) === entry.type };
      })
      .filter((candidate) => candidate.distance <= BBOX_TOLERANCE)
      .sort((a, b) => a.distance - b.distance || Number(b.exactType) - Number(a.exactType));
  }

  if (candidates.length > 1) {
    const signatures = new Map();
    for (const candidate of candidates) {
      const signature = geometrySignature(deck.message.blobs, candidate.record);
      if (!signature) continue;
      if (!signatures.has(signature)) signatures.set(signature, []);
      signatures.get(signature).push(candidate);
    }
    if (signatures.size === 1) candidates = [[...signatures.values()][0][0]];
  }

  if (candidates.length !== 1) {
    if (workItem.fromMissingAudit) {
      unresolved.push({
        ...entry,
        reason: candidates.length === 0 ? 'No OpenFig node matched name/type/relative bbox.' : 'Multiple OpenFig nodes matched name/type/relative bbox.',
        candidateCount: candidates.length,
        candidateIds: candidates.slice(0, 8).map((candidate) => candidate.record.id),
      });
    }
    continue;
  }

  const openNode = candidates[0].record.node;
  const fillGeometry = decodeGeometryRefs(deck.message.blobs, openNode.fillGeometry);
  const strokeGeometry = decodeGeometryRefs(deck.message.blobs, openNode.strokeGeometry);
  if (!fillGeometry.length && !strokeGeometry.length) {
    if (workItem.fromMissingAudit) unresolved.push({ ...entry, reason: 'OpenFig node matched but had no decodable geometry.' });
    continue;
  }

  const sourceDoc = frameDocMutations.get(entry.rootFrameId)?.sourceDoc || await readJson(sourceFiles.get(entry.rootFrameId));
  const runtimeDoc = frameDocMutations.get(entry.rootFrameId)?.runtimeDoc || await readJson(runtimeFiles.get(entry.rootFrameId));
  const sourceNode = findFigmaNode(sourceDoc, entry.id);
  const runtimeNode = findFigmaNode(runtimeDoc, entry.id);
  if (!sourceNode || !runtimeNode) {
    if (workItem.fromMissingAudit) unresolved.push({ ...entry, reason: 'Matched OpenFig node but target Figma node was not found in source/runtime JSON.' });
    if (workItem.fromStrokeAudit) unresolvedStrokeAudit.push({ ...entry, reason: 'Matched OpenFig node but target Figma node was not found in source/runtime JSON.' });
    continue;
  }
  if (workItem.fromStrokeAudit && (hasVisibleImageFill(sourceNode) || hasVisibleImageFill(runtimeNode))) {
    unresolvedStrokeAudit.push({ ...entry, reason: 'Target node has an image fill; current renderer does not consume exact strokeGeometry for image-fill nodes.' });
    continue;
  }
  const sourceContext = buildFigmaContext(sourceDoc);
  const runtimeContext = buildFigmaContext(runtimeDoc);
  patchNodeGeometryAndTransform(sourceNode, sourceContext, candidates[0].record, dominantOffset, fillGeometry, strokeGeometry);
  patchNodeGeometryAndTransform(runtimeNode, runtimeContext, candidates[0].record, dominantOffset, fillGeometry, strokeGeometry);
  frameDocMutations.set(entry.rootFrameId, { sourceDoc, runtimeDoc });
  const record = {
    rootFrameId: entry.rootFrameId,
    id: entry.id,
    name: entry.name,
    type: entry.type,
    openFigNodeId: candidates[0].record.id,
    openFigType: openNode.type,
    bboxDistance: candidates[0].distance,
    fillGeometryCount: fillGeometry.length,
    strokeGeometryCount: strokeGeometry.length,
  };
  if (workItem.fromMissingAudit) resolved.push(record);
  else if (workItem.fromStrokeAudit) resolvedStrokeAudit.push(record);
  else reapplied.push(record);
}

if (!CHECK) {
  for (const [frameId, docs] of frameDocMutations) {
    await writeJson(sourceFiles.get(frameId), docs.sourceDoc);
    await writeMinJson(runtimeFiles.get(frameId), docs.runtimeDoc);
  }
  const unresolvedKeys = new Set(unresolved.map((entry) => `${entry.rootFrameId}|${entry.id}`));
  const remainingMissing = missing.filter((entry) => unresolvedKeys.has(`${entry.rootFrameId}|${entry.id}`));
  await writeJson('figma-audit/missing-exact-assets.json', remainingMissing);
}

const summary = {
  generatedFrom: [FIG_PATH, 'figma-audit/missing-exact-assets.json', 'figma-nodes/manifest.json'],
  mode: 'current-state',
  matchingPolicy: {
    frameMapping: 'OpenFig frame matched by compatible name, exact width/height, and dominant global coordinate offset.',
    nodeMapping: 'Node matched within the mapped frame by compatible type, exact layer name, and relative bbox tolerance.',
    bboxTolerance: BBOX_TOLERANCE,
    frameTolerance: FRAME_TOLERANCE,
  },
  dominantOffset: { dx: dominantOffset.dx, dy: dominantOffset.dy, support: dominantOffset.count },
  aggregate: {
    openFigNodes: open.records.length,
    openFigBlobs: deck.message.blobs?.length || 0,
    manifestFrames: manifest.length,
    mappedFrames: frameMap.mapped.size,
    inputMissingExactAssets: missing.length,
    strokeAuditInput: strokeWorkItems.length,
    reapplyResolvedSummaryInput: reapplyWorkItems.length,
    resolvedExactAssets: resolved.length,
    resolvedStrokeAuditRecords: resolvedStrokeAudit.length,
    unresolvedStrokeAuditRecords: unresolvedStrokeAudit.length,
    unresolvedExactAssets: unresolved.length,
    reappliedPreviouslyResolvedAssets: reapplied.length,
    mutatedFrames: frameDocMutations.size,
  },
  frameMappings: [...frameMap.mapped.entries()].map(([frameId, record]) => ({
    frameId,
    frameName: manifest.find((frame) => frame.id === frameId)?.name,
    openFigFrameId: record.id,
    openFigFrameName: record.node.name,
    openFigFrameBbox: record.bbox,
    figmaFrameBbox: frameDocs.get(frameId)?.absoluteBoundingBox,
  })),
  resolved,
  resolvedStrokeAudit,
  unresolvedStrokeAudit,
  reapplied,
  unresolved,
};

const lines = [
  '# OpenFig Exact Geometry Resolve Summary',
  '',
  'Generated from the checked-in OpenFig `.fig` file and committed Figma JSON snapshots.',
  '',
  `- Mode: \`${summary.mode}\``,
  `- Dominant Figma↔OpenFig coordinate offset: \`dx=${dominantOffset.dx}, dy=${dominantOffset.dy}\` (support: \`${dominantOffset.count}\`)`,
  `- OpenFig nodes parsed: \`${summary.aggregate.openFigNodes}\``,
  `- OpenFig blobs parsed: \`${summary.aggregate.openFigBlobs}\``,
  `- Manifest frames: \`${summary.aggregate.manifestFrames}\``,
  `- Mapped frames: \`${summary.aggregate.mappedFrames}\``,
  `- Input missing exact geometry records: \`${summary.aggregate.inputMissingExactAssets}\``,
  `- Stroke audit records considered: \`${summary.aggregate.strokeAuditInput}\``,
  `- Stroke audit records resolved: \`${summary.aggregate.resolvedStrokeAuditRecords}\``,
  `- Stroke audit records still unsupported: \`${summary.aggregate.unresolvedStrokeAuditRecords}\``,
  `- Previously resolved records re-applied for transform metadata: \`${summary.aggregate.reappliedPreviouslyResolvedAssets}\``,
  `- Resolved exact geometry records: \`${summary.aggregate.resolvedExactAssets}\``,
  `- Unresolved exact geometry records: \`${summary.aggregate.unresolvedExactAssets}\``,
  `- Mutated frames: \`${summary.aggregate.mutatedFrames}\``,
  '',
  '## Matching policy',
  '',
  '- Frame mapping: compatible frame name, exact width/height, and dominant global coordinate offset.',
  '- Node mapping: compatible type, exact layer name, and relative bbox match within tolerance.',
  '- No geometry is guessed; ambiguous or unmatched nodes remain in `missing-exact-assets.json`.',
];
if (unresolved.length) {
  lines.push('', '## Unresolved examples', '', '| Frame ID | Node ID | Type | Name | Reason |', '|---|---|---|---|---|');
  for (const item of unresolved.slice(0, 30)) {
    lines.push(`| \`${item.rootFrameId}\` | \`${item.id}\` | \`${item.type}\` | ${item.name} | ${item.reason} |`);
  }
}

await writeJson('figma-audit/openfig-geometry-resolve-summary.json', summary);
await writeFile('figma-audit/openfig-geometry-resolve-summary.md', `${lines.join('\n')}\n`, 'utf8');
await writeJson('figma-audit/openfig-figma-crosswalk-candidates.json', {
  generatedFrom: [FIG_PATH, 'figma-nodes/manifest.json'],
  dominantOffset: { dx: dominantOffset.dx, dy: dominantOffset.dy, support: dominantOffset.count },
  frameCandidates: frameMap.candidatesByFrame,
});

if (CHECK) {
  if (resolved.length || unresolved.length !== missing.length) {
    console.error('OpenFig geometry check found pending writeable changes. Run npm run figma:openfig:resolve.');
    process.exit(1);
  }
}

console.log(`OpenFig geometry resolve: ${resolved.length} resolved, ${unresolved.length} unresolved, ${frameDocMutations.size} frame(s) mutated.`);
