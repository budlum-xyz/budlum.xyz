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
    console.error(`${file} is stale. Run npm run figma:text-strokes.`);
    process.exitCode = 1;
  }
}

function stableJson(value) {
  if (value == null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(',')}}`;
}

function walk(node, visitor) {
  visitor(node);
  for (const child of node.children || []) walk(child, visitor);
}

function findNode(root, id) {
  let found = null;
  walk(root, (node) => {
    if (!found && node.id === id) found = node;
  });
  return found;
}

const unsupported = await readJson('figma-audit/unsupported-render-features.json');
const features = (unsupported.features || []).filter((feature) => feature.kind === 'textStrokeNotRendered');
const manifest = await readJson('figma-nodes/manifest.json');
const frameFileById = new Map(manifest.map((frame) => [frame.id, frame.file]));
const frameCache = new Map();

async function frameDocument(frameId) {
  if (!frameCache.has(frameId)) {
    const file = frameFileById.get(frameId);
    frameCache.set(frameId, file ? await readJson(path.join('public/figma-frames', file)) : null);
  }
  return frameCache.get(frameId);
}

const records = [];
const bySpec = new Map();
for (const feature of features) {
  const node = findNode(await frameDocument(feature.rootFrameId), feature.id);
  const strokes = (node?.strokes || []).filter((stroke) => stroke.visible !== false);
  const fills = (node?.fills || []).filter((fill) => fill.visible !== false);
  const spec = {
    strokeAlign: node?.strokeAlign || feature.detail?.strokeAlign || null,
    strokeWeight: node?.strokeWeight || feature.detail?.strokeWeight || 0,
    strokePaints: strokes,
    fontFamily: node?.style?.fontFamily || null,
    fontSize: node?.style?.fontSize || null,
  };
  const key = stableJson(spec);
  if (!bySpec.has(key)) bySpec.set(key, { spec, count: 0, frames: new Map() });
  const item = bySpec.get(key);
  item.count += 1;
  const frame = item.frames.get(feature.rootFrameId) || { frameName: feature.frameName, count: 0 };
  frame.count += 1;
  item.frames.set(feature.rootFrameId, frame);
  records.push({
    rootFrameId: feature.rootFrameId,
    frameName: feature.frameName,
    id: feature.id,
    name: feature.name,
    type: feature.type,
    parentId: feature.parentId,
    depth: feature.depth,
    bbox: feature.bbox,
    characters: node?.characters || null,
    style: node?.style || null,
    fills,
    strokes,
    strokeAlign: spec.strokeAlign,
    strokeWeight: spec.strokeWeight,
  });
}

const report = {
  generatedFrom: ['figma-audit/unsupported-render-features.json', 'public/figma-frames/*.json'],
  status: 'not-rendered-exactness-blocked',
  rationale: [
    'Figma text stroke uses strokeAlign values such as OUTSIDE.',
    'CSS -webkit-text-stroke does not expose Figma-equivalent OUTSIDE stroke alignment and is therefore treated as an approximation.',
    'OpenFig binary does not contain text stroke geometry for these nodes (0 TEXT nodes with strokeGeometry in .fig file, confirmed 2026-07-24).',
    'Exact support requires text-to-path/vector outline data from Figma API live data or a proven pixel-equivalent renderer for the specific font/stroke stack.',
  ],
  rendererPolicy: {
    renderApproximationAllowed: false,
    currentRendererBehavior: 'Ignore text strokes and keep affected TEXT nodes visible in unsupported-render-features audit.',
    ciGuard: 'scripts/verify-figma-data.mjs fails if src/FigmaNode.jsx starts using CSS text-stroke while textStrokeNotRendered remains in unsupported audit.',
  },
  openfigInvestigation: {
    date: '2026-07-24',
    method: 'Parsed OpenFig .fig binary via FigDeck; searched all TEXT node records for strokeGeometry blobs.',
    result: {
      totalTextNodesWithStrokes: 0,
      totalTextNodesWithStrokeGeometry: 0,
      totalTextNodesWithFillGeometry: 0,
    },
    conclusion: 'OpenFig binary does not export text-to-vector outline paths. Text stroke geometry unavailable via OpenFig. Resolution requires Figma API live data or a proven pixel-equivalent renderer.',
  },
  aggregate: {
    textStrokeRecords: records.length,
    affectedFrames: new Set(records.map((record) => record.rootFrameId)).size,
    uniqueSpecs: bySpec.size,
  },
  bySpec: Object.fromEntries([...bySpec.entries()].map(([key, item]) => [key, {
    count: item.count,
    spec: item.spec,
    frames: Object.fromEntries([...item.frames.entries()].sort((a, b) => a[0].localeCompare(b[0]))),
  }])),
  records,
};

const lines = [
  '# Figma Text Stroke Exactness Review',
  '',
  'Generated from `figma-audit/unsupported-render-features.json` without calling the Figma API.',
  '',
  `- Status: \`${report.status}\``,
  `- Text stroke records: \`${report.aggregate.textStrokeRecords}\``,
  `- Affected frames: \`${report.aggregate.affectedFrames}\``,
  `- Unique stroke/font specs: \`${report.aggregate.uniqueSpecs}\``,
  '',
  '## Exactness decision',
  '',
  'CSS `-webkit-text-stroke` is not accepted as an exact Figma `OUTSIDE` text-stroke renderer. These nodes remain unrendered as strokes until exact text outline/vector data or a proven pixel-equivalent renderer exists.',
  '',
  '## OpenFig investigation (2026-07-24)',
  '',
  'Parsed OpenFig `.fig` binary via `FigDeck`. Searched all TEXT node records for `strokeGeometry` blobs.',
  '',
  '| Metric | Value |',
  '|---|---|',
  '| TEXT nodes with strokes | `0` |',
  '| TEXT nodes with strokeGeometry | `0` |',
  '| TEXT nodes with fillGeometry | `0` |',
  '',
  '**Conclusion**: OpenFig binary does **not** export text-to-vector outline paths. Text stroke geometry unavailable via OpenFig. Resolution requires Figma API live data (currently rate-limited at ~4.2 days) or a proven pixel-equivalent text-to-vector renderer.',
  '',
  '## Specs',
  '',
  '| Count | Spec | Frames |',
  '|---:|---|---|',
];
for (const item of Object.values(report.bySpec)) {
  const frames = Object.entries(item.frames).map(([id, frame]) => `\`${id}\` (${frame.count})`).join(', ');
  lines.push(`| ${item.count} | \`${stableJson(item.spec)}\` | ${frames} |`);
}
lines.push('', '## Affected text nodes', '', '| Frame ID | Node ID | Name | Characters | Stroke | Font |', '|---|---|---|---|---|---|');
for (const record of records) {
  const stroke = stableJson({ strokeAlign: record.strokeAlign, strokeWeight: record.strokeWeight, strokes: record.strokes });
  const font = stableJson({ fontFamily: record.style?.fontFamily, fontSize: record.style?.fontSize, fontWeight: record.style?.fontWeight });
  lines.push(`| \`${record.rootFrameId}\` | \`${record.id}\` | ${record.name} | \`${record.characters || ''}\` | \`${stroke}\` | \`${font}\` |`);
}

await writeOrCheck('figma-audit/text-stroke-exactness-review.json', jsonText(report));
await writeOrCheck('figma-audit/text-stroke-exactness-review.md', `${lines.join('\n')}\n`);

if (process.exitCode) process.exit(process.exitCode);
console.log(CHECK
  ? `Text stroke exactness review is current: ${records.length} unsupported record(s).`
  : `Text stroke exactness review: ${records.length} unsupported record(s).`);
