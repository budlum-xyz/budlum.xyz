import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const CHECK = process.argv.includes('--check');
const readJson = async (file) => JSON.parse(await readFile(file, 'utf8'));
const readText = async (file) => readFile(file, 'utf8');
const jsonText = (data) => `${JSON.stringify(data, null, 2)}\n`;

async function writeOrCheck(file, nextText) {
  if (!CHECK) {
    await writeFile(file, nextText, 'utf8');
    return;
  }
  const current = await readText(file);
  if (current !== nextText) {
    console.error(`${file} is stale. Run npm run figma:paint-stacks.`);
    process.exitCode = 1;
  }
}

function visiblePaints(paints = []) {
  return paints.filter((paint) => paint.visible !== false);
}

function stableJson(value) {
  if (value == null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(',')}}`;
}

function walk(node, visitor, parentId = null, depth = 0) {
  visitor(node, parentId, depth);
  for (const child of node.children || []) walk(child, visitor, node.id, depth + 1);
}

const manifest = await readJson('figma-nodes/manifest.json');
const imageMapPayload = await readJson('public/figma-image-fills.json');
const imageMap = imageMapPayload.meta?.images || imageMapPayload.images || {};
const records = [];
const byPattern = new Map();
let multiBackgroundRecords = 0;
let multiStrokeRecords = 0;
let nodesWithBothFillsAndBackground = 0;
let emptyFillsWithVisibleBackground = 0;

for (const frame of manifest) {
  const document = await readJson(path.join('public/figma-frames', frame.file));
  walk(document, (node, parentId, depth) => {
    const fills = visiblePaints(node.fills || []);
    const background = visiblePaints(node.background || []);
    const strokes = visiblePaints(node.strokes || []);
    if (background.length > 1) multiBackgroundRecords += 1;
    if (strokes.length > 1) multiStrokeRecords += 1;
    if (fills.length && background.length) nodesWithBothFillsAndBackground += 1;
    if ((node.fills || []).length === 0 && background.length) emptyFillsWithVisibleBackground += 1;
    if (fills.length <= 1) return;

    const pattern = fills.map((paint) => paint.type).join('+');
    const entry = byPattern.get(pattern) || { count: 0, frames: new Map() };
    entry.count += 1;
    const frameEntry = entry.frames.get(frame.id) || { frameName: frame.name, count: 0 };
    frameEntry.count += 1;
    entry.frames.set(frame.id, frameEntry);
    byPattern.set(pattern, entry);

    records.push({
      rootFrameId: frame.id,
      frameName: frame.name,
      id: node.id,
      name: node.name,
      type: node.type,
      parentId,
      depth,
      bbox: node.absoluteBoundingBox || null,
      fillPattern: pattern,
      fills: fills.map((paint, index) => ({
        index,
        type: paint.type,
        blendMode: paint.blendMode || null,
        opacity: paint.opacity ?? null,
        color: paint.color || null,
        imageRef: paint.imageRef || null,
        localAssetPath: paint.imageRef ? imageMap[paint.imageRef] || `/figma-assets/${paint.imageRef}.png` : null,
        scaleMode: paint.scaleMode || null,
        imageTransform: paint.imageTransform || null,
        filters: paint.filters || null,
      })),
    });
  });
}

const report = {
  generatedFrom: ['figma-nodes/manifest.json', 'public/figma-frames/*.json', 'public/figma-image-fills.json'],
  purpose: 'Tracks Figma nodes with more than one visible fill paint so renderer exactness is not silently assumed.',
  rendererPolicy: {
    currentRenderer: 'Renderer supports one solid fill plus one image fill path for common nodes, but full arbitrary Figma paint-stack compositing is not claimed exact.',
    exactnessRule: 'Do not add more complex paint stacks without either exact renderer support or explicit unsupported audit coverage.',
    supportedPaintTypesObserved: [...new Set(records.flatMap((record) => record.fills.map((paint) => paint.type)))].sort(),
  },
  aggregate: {
    multiFillRecords: records.length,
    multiBackgroundRecords,
    multiStrokeRecords,
    nodesWithBothFillsAndBackground,
    emptyFillsWithVisibleBackground,
    uniqueFillPatterns: byPattern.size,
    affectedFrames: new Set(records.map((record) => record.rootFrameId)).size,
  },
  byPattern: Object.fromEntries([...byPattern.entries()].sort((a, b) => b[1].count - a[1].count || a[0].localeCompare(b[0])).map(([pattern, item]) => [pattern, {
    count: item.count,
    frames: Object.fromEntries([...item.frames.entries()].sort((a, b) => a[0].localeCompare(b[0]))),
  }])),
  records,
};

const lines = [
  '# Figma Paint Stack Review',
  '',
  'Generated from committed Figma runtime JSON without calling the Figma API.',
  '',
  `- Multi-fill nodes: \`${report.aggregate.multiFillRecords}\``,
  `- Unique fill patterns: \`${report.aggregate.uniqueFillPatterns}\``,
  `- Affected frames: \`${report.aggregate.affectedFrames}\``,
  `- Multi-background nodes: \`${report.aggregate.multiBackgroundRecords}\``,
  `- Multi-stroke nodes: \`${report.aggregate.multiStrokeRecords}\``,
  `- Nodes with both fills and background entries: \`${report.aggregate.nodesWithBothFillsAndBackground}\``,
  `- Nodes with empty fills but visible background: \`${report.aggregate.emptyFillsWithVisibleBackground}\``,
  '',
  '## Renderer policy',
  '',
  report.rendererPolicy.currentRenderer,
  '',
  'Full arbitrary Figma paint-stack compositing is not claimed exact. This audit keeps existing multi-fill nodes visible so future renderer work can either prove exact support or keep the limitation explicit.',
  '',
  '## Patterns',
  '',
  '| Pattern | Count | Frames |',
  '|---|---:|---|',
];
for (const [pattern, item] of Object.entries(report.byPattern)) {
  const frames = Object.entries(item.frames).map(([id, frame]) => `\`${id}\` (${frame.count})`).join(', ');
  lines.push(`| \`${pattern}\` | ${item.count} | ${frames} |`);
}
lines.push('', '## Nodes', '', '| Frame ID | Node ID | Type | Name | Pattern | Paint details |', '|---|---|---|---|---|---|');
for (const record of records) {
  const details = record.fills.map((paint) => stableJson({ index: paint.index, type: paint.type, imageRef: paint.imageRef, localAssetPath: paint.localAssetPath, color: paint.color, opacity: paint.opacity, scaleMode: paint.scaleMode })).join('<br>');
  lines.push(`| \`${record.rootFrameId}\` | \`${record.id}\` | \`${record.type}\` | ${record.name} | \`${record.fillPattern}\` | ${details} |`);
}

await writeOrCheck('figma-audit/paint-stack-review.json', jsonText(report));
await writeOrCheck('figma-audit/paint-stack-review.md', `${lines.join('\n')}\n`);

if (process.exitCode) process.exit(process.exitCode);
console.log(CHECK
  ? `Paint stack review is current: ${records.length} multi-fill node(s).`
  : `Paint stack review: ${records.length} multi-fill node(s).`);
