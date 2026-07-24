import { readFile, writeFile } from 'node:fs/promises';

const CHECK = process.argv.includes('--check');
const readText = async (file) => readFile(file, 'utf8');
const readJson = async (file) => JSON.parse(await readText(file));
const jsonText = (data) => `${JSON.stringify(data, null, 2)}\n`;

async function writeOrCheck(file, nextText) {
  if (!CHECK) {
    await writeFile(file, nextText, 'utf8');
    return;
  }
  const current = await readText(file);
  if (current !== nextText) {
    console.error(`${file} is stale. Run npm run figma:image-filters.`);
    process.exitCode = 1;
  }
}

function stableJson(value) {
  if (value == null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(',')}}`;
}

const unsupported = await readJson('figma-audit/unsupported-render-features.json');
const features = (unsupported.features || []).filter((feature) => feature.kind === 'imageFiltersNotRendered');

const byFilter = new Map();
for (const feature of features) {
  const key = stableJson(feature.detail?.filters || {});
  if (!byFilter.has(key)) byFilter.set(key, { filters: feature.detail?.filters || {}, count: 0, frames: new Map() });
  const item = byFilter.get(key);
  item.count += 1;
  const frame = item.frames.get(feature.rootFrameId) || { frameName: feature.frameName, count: 0 };
  frame.count += 1;
  item.frames.set(feature.rootFrameId, frame);
}

const uniqueFilterSets = [...byFilter.values()].map((item) => ({
  filters: item.filters,
  count: item.count,
  frames: Object.fromEntries([...item.frames.entries()].sort((a, b) => a[0].localeCompare(b[0]))),
}));

const report = {
  generatedFrom: ['figma-audit/unsupported-render-features.json', 'public/figma-frames/*.json'],
  officialReference: 'https://developers.figma.com/docs/plugins/api/Paint/#imagefilters',
  status: 'not-rendered-exactness-blocked',
  rationale: [
    'Figma exposes ImagePaint.filters values and range through the API.',
    'The committed API/OpenFig data does not include a documented pixel-equivalent transfer function for exposure, contrast, saturation, temperature, tint, highlights, or shadows.',
    'CSS filter mappings such as brightness(), contrast(), or saturate() are not accepted because they are approximations unless Figma-equivalent pixel math is proven and audited.',
  ],
  rendererPolicy: {
    renderApproximationAllowed: false,
    currentRendererBehavior: 'Ignore ImagePaint.filters and keep affected nodes visible in unsupported-render-features audit.',
    ciGuard: 'scripts/verify-figma-data.mjs fails if src/FigmaNode.jsx processes image filters while imageFiltersNotRendered remains in unsupported audit.',
  },
  aggregate: {
    unsupportedImageFilterRecords: features.length,
    uniqueFilterSets: uniqueFilterSets.length,
    affectedFrames: new Set(features.map((feature) => feature.rootFrameId)).size,
  },
  uniqueFilterSets,
  affectedNodes: features.map((feature) => ({
    rootFrameId: feature.rootFrameId,
    frameName: feature.frameName,
    id: feature.id,
    name: feature.name,
    type: feature.type,
    parentId: feature.parentId,
    depth: feature.depth,
    bbox: feature.bbox,
    filters: feature.detail?.filters || {},
  })),
};

const lines = [
  '# Figma Image Filter Exactness Review',
  '',
  'Generated from `figma-audit/unsupported-render-features.json` without calling the Figma API.',
  '',
  `- Status: \`${report.status}\``,
  `- Unsupported image filter records: \`${report.aggregate.unsupportedImageFilterRecords}\``,
  `- Unique filter sets: \`${report.aggregate.uniqueFilterSets}\``,
  `- Affected frames: \`${report.aggregate.affectedFrames}\``,
  `- Official API reference: ${report.officialReference}`,
  '',
  '## Exactness decision',
  '',
  'Figma exposes `ImagePaint.filters` values, but the committed Figma/OpenFig data does not provide a documented pixel-equivalent transfer function. CSS `brightness()`, `contrast()`, `saturate()`, or similar mappings are therefore treated as approximations and are forbidden until proven exact.',
  '',
  'Current renderer behavior: ignore these filters and keep the affected nodes visible in `unsupported-render-features` audit. `scripts/verify-figma-data.mjs` enforces this by failing if renderer code starts processing image filters while this unsupported audit is still populated.',
  '',
  '## Unique filter sets',
  '',
  '| Count | Filters | Frames |',
  '|---:|---|---|',
];
for (const item of uniqueFilterSets) {
  const frames = Object.entries(item.frames).map(([id, frame]) => `\`${id}\` (${frame.count})`).join(', ');
  lines.push(`| ${item.count} | \`${stableJson(item.filters)}\` | ${frames} |`);
}
lines.push('', '## Affected nodes', '', '| Frame ID | Node ID | Type | Name | Filters |', '|---|---|---|---|---|');
for (const node of report.affectedNodes) {
  lines.push(`| \`${node.rootFrameId}\` | \`${node.id}\` | \`${node.type}\` | ${node.name} | \`${stableJson(node.filters)}\` |`);
}

await writeOrCheck('figma-audit/image-filter-exactness-review.json', jsonText(report));
await writeOrCheck('figma-audit/image-filter-exactness-review.md', `${lines.join('\n')}\n`);

if (process.exitCode) process.exit(process.exitCode);
console.log(CHECK
  ? `Image filter exactness review is current: ${features.length} unsupported record(s).`
  : `Image filter exactness review: ${features.length} unsupported record(s).`);
