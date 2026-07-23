import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const CHECK = process.argv.includes('--check');
const VECTOR_TYPES = new Set(['VECTOR', 'STAR', 'BOOLEAN_OPERATION', 'LINE', 'REGULAR_POLYGON']);
const EXACT_LEAF_GEOMETRY_TYPES = new Set(['RECTANGLE', 'ELLIPSE']);
const readText = async (file) => readFile(file, 'utf8');
const readJson = async (file) => JSON.parse(await readText(file));
const jsonText = (data) => `${JSON.stringify(data, null, 2)}\n`;

async function writeOrCheck(file, nextText) {
  if (!CHECK) {
    await writeFile(file, nextText, 'utf8');
    return;
  }
  const currentText = await readText(file);
  if (currentText !== nextText) {
    console.error(`${file} is stale. Run npm run figma:coverage.`);
    process.exitCode = 1;
  }
}

function walk(node, visitor, parentId = null, depth = 0) {
  visitor(node, parentId, depth);
  for (const child of node.children || []) walk(child, visitor, node.id, depth + 1);
}

function visiblePaints(node, type) {
  return [...(node.fills || []), ...(node.background || [])].filter((paint) => paint.visible !== false && (!type || paint.type === type));
}

function hasExactGeometry(node) {
  return Boolean(node.fillGeometry || node.strokeGeometry);
}

function shouldRenderExactLeafGeometry(node) {
  if (!EXACT_LEAF_GEOMETRY_TYPES.has(node.type)) return false;
  if (!hasExactGeometry(node)) return false;
  if ((node.children || []).length > 0) return false;
  return visiblePaints(node, 'IMAGE').length === 0;
}

function hasRelativeTransform(node) {
  return Array.isArray(node.relativeTransform) && node.relativeTransform.length === 2 && Boolean(node.size);
}

function isRotated(node) {
  return Number.isFinite(node.rotation) && Math.abs(node.rotation) > 0.000001;
}

function canInferRotationTransform(node) {
  if (!isRotated(node) || !node.absoluteBoundingBox) return false;
  const angle = node.rotation;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const absCos = Math.abs(cos);
  const absSin = Math.abs(sin);
  const denominator = absCos * absCos - absSin * absSin;
  const box = node.absoluteBoundingBox;
  let width;
  let height;
  if (Math.abs(denominator) < 0.000001) {
    const ratio = node.targetAspectRatio?.x && node.targetAspectRatio?.y
      ? node.targetAspectRatio.x / node.targetAspectRatio.y
      : null;
    if (!Number.isFinite(ratio) || ratio <= 0) return false;
    const heightFromBoxWidth = box.width / (absCos * ratio + absSin);
    const heightFromBoxHeight = box.height / (absSin * ratio + absCos);
    height = (heightFromBoxWidth + heightFromBoxHeight) / 2;
    width = ratio * height;
  } else {
    width = (absCos * box.width - absSin * box.height) / denominator;
    height = (-absSin * box.width + absCos * box.height) / denominator;
  }
  return [width, height].every(Number.isFinite) && width > 0 && height > 0;
}

function hasMatrixTransformCoverage(node) {
  return hasRelativeTransform(node) || canInferRotationTransform(node);
}

function classify(node) {
  if (node.visible === false) return 'hidden';
  if (VECTOR_TYPES.has(node.type)) return hasExactGeometry(node) ? 'exactVectorGeometry' : 'skippedMissingGeometry';
  if (shouldRenderExactLeafGeometry(node)) return 'exactLeafGeometry';
  if (node.type === 'TEXT') return 'text';
  if (visiblePaints(node, 'IMAGE').length > 0) return 'imageFill';
  if (node.type === 'FRAME' || node.type === 'GROUP' || node.type === 'COMPONENT' || node.type === 'INSTANCE') return 'container';
  return 'cssShape';
}

const manifest = await readJson('figma-nodes/manifest.json');
const missing = await readJson('figma-audit/missing-exact-assets.json');
const missingByFrame = new Map();
for (const item of missing) {
  missingByFrame.set(item.rootFrameId, (missingByFrame.get(item.rootFrameId) || 0) + 1);
}

const frames = [];
const aggregate = {
  frames: 0,
  totalNodes: 0,
  hidden: 0,
  exactVectorGeometry: 0,
  exactLeafGeometry: 0,
  skippedMissingGeometry: 0,
  text: 0,
  imageFill: 0,
  container: 0,
  cssShape: 0,
  missingExactAssetAuditEntries: missing.length,
  relativeTransformNodes: 0,
  rotationFallbackTransformNodes: 0,
  rotatedTransformNodes: 0,
  unsupportedRotatedTransformNodes: 0,
};

for (const frame of manifest) {
  const document = await readJson(path.join('public/figma-frames', frame.file));
  const counts = {
    totalNodes: 0,
    hidden: 0,
    exactVectorGeometry: 0,
    exactLeafGeometry: 0,
    skippedMissingGeometry: 0,
    text: 0,
    imageFill: 0,
    container: 0,
    cssShape: 0,
    relativeTransformNodes: 0,
    rotationFallbackTransformNodes: 0,
    rotatedTransformNodes: 0,
    unsupportedRotatedTransformNodes: 0,
  };
  const skippedExamples = [];
  walk(document, (node) => {
    const bucket = classify(node);
    counts.totalNodes += 1;
    counts[bucket] += 1;
    if (hasRelativeTransform(node)) counts.relativeTransformNodes += 1;
    if (!hasRelativeTransform(node) && canInferRotationTransform(node)) counts.rotationFallbackTransformNodes += 1;
    if (isRotated(node) && hasMatrixTransformCoverage(node)) counts.rotatedTransformNodes += 1;
    if (isRotated(node) && !hasMatrixTransformCoverage(node) && bucket !== 'skippedMissingGeometry' && bucket !== 'hidden') counts.unsupportedRotatedTransformNodes += 1;
    if (bucket === 'skippedMissingGeometry' && skippedExamples.length < 8) {
      skippedExamples.push({ id: node.id, name: node.name, type: node.type });
    }
  });
  for (const [key, value] of Object.entries(counts)) aggregate[key] += value;
  aggregate.frames += 1;
  frames.push({
    frameId: frame.id,
    frameName: frame.name,
    file: frame.file,
    counts,
    missingExactAssetAuditEntries: missingByFrame.get(frame.id) || 0,
    skippedExamples,
  });
}

const report = {
  generatedFrom: ['figma-nodes/manifest.json', 'public/figma-frames/*.json', 'figma-audit/missing-exact-assets.json'],
  rendererContract: {
    exactVectorGeometry: 'VECTOR-like nodes with Figma fillGeometry/strokeGeometry are rendered as SVG paths.',
    exactLeafGeometry: 'Solid RECTANGLE/ELLIPSE leaf nodes with Figma fillGeometry/strokeGeometry are rendered as SVG paths instead of approximate CSS borders.',
    skippedMissingGeometry: 'VECTOR-like nodes without exact Figma geometry are intentionally not rendered; they must stay in audit.',
    cssShape: 'Non-vector Figma primitives without exact leaf geometry are rendered from REST numeric values such as bounding box, fill, stroke and radius.',
    relativeTransform: 'Nodes carrying Figma relativeTransform + size are positioned with the exact affine CSS matrix in parent coordinates.',
    rotationFallbackTransform: 'Rotated nodes without relativeTransform are matrix-positioned from Figma rotation + absolute bounding box when dimensions can be solved exactly.',
  },
  aggregate,
  frames,
};

const lines = [
  '# Figma Render Coverage Summary',
  '',
  'Generated without calling the Figma API. It audits committed frame JSON against the renderer contract.',
  '',
  '## Aggregate',
  '',
  `- Frames: \`${aggregate.frames}\``,
  `- Total nodes: \`${aggregate.totalNodes}\``,
  `- Exact VECTOR geometry nodes rendered from Figma paths: \`${aggregate.exactVectorGeometry}\``,
  `- Exact RECTANGLE/ELLIPSE leaf geometry nodes rendered from Figma paths: \`${aggregate.exactLeafGeometry}\``,
  `- VECTOR-like nodes skipped because exact geometry is missing: \`${aggregate.skippedMissingGeometry}\``,
  `- Missing exact asset audit entries: \`${aggregate.missingExactAssetAuditEntries}\``,
  `- Nodes positioned with Figma relativeTransform matrices: \`${aggregate.relativeTransformNodes}\``,
  `- Rotated nodes positioned from Figma rotation fallback: \`${aggregate.rotationFallbackTransformNodes}\``,
  `- Rotated transform nodes covered by matrix positioning: \`${aggregate.rotatedTransformNodes}\``,
  `- Rotated transform nodes still unsupported: \`${aggregate.unsupportedRotatedTransformNodes}\``,
  `- Text nodes: \`${aggregate.text}\``,
  `- Image-fill nodes: \`${aggregate.imageFill}\``,
  `- CSS primitive/container nodes: \`${aggregate.cssShape + aggregate.container}\``,
  '',
  '## Frames with missing exact geometry',
  '',
  '| Frame ID | Missing audit entries | Skipped geometry nodes | Frame name |',
  '|---|---:|---:|---|',
];

for (const frame of frames.filter((item) => item.missingExactAssetAuditEntries || item.counts.skippedMissingGeometry)) {
  lines.push(`| \`${frame.frameId}\` | ${frame.missingExactAssetAuditEntries} | ${frame.counts.skippedMissingGeometry} | ${frame.frameName} |`);
}

lines.push('');
lines.push('Do not approximate skipped geometry nodes. Refresh those frames with `npm run figma:refresh` after Figma rate limits cool down.');

await writeOrCheck('figma-audit/render-coverage-summary.json', jsonText(report));
await writeOrCheck('figma-audit/render-coverage-summary.md', `${lines.join('\n')}\n`);

if (process.exitCode) process.exit(process.exitCode);
console.log(CHECK
  ? `Render coverage is current: ${aggregate.frames} frames, ${aggregate.totalNodes} nodes, ${aggregate.skippedMissingGeometry} skipped missing geometry nodes.`
  : `Render coverage: ${aggregate.frames} frames, ${aggregate.totalNodes} nodes, ${aggregate.skippedMissingGeometry} skipped missing geometry nodes.`);
