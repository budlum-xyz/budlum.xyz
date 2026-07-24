import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

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
    console.error(`${file} is stale. Run npm run figma:unsupported.`);
    process.exitCode = 1;
  }
}

function walk(node, visitor, parentId = null, depth = 0) {
  visitor(node, parentId, depth);
  for (const child of node.children || []) walk(child, visitor, node.id, depth + 1);
}

function isSupportedImageTransform(transform) {
  if (!Array.isArray(transform) || transform.length !== 2) return true;
  const [[, skewX], [skewY]] = transform;
  return Math.abs(skewX || 0) < 0.000001 && Math.abs(skewY || 0) < 0.000001;
}

function visibleStrokes(node) {
  return (node.strokes || []).filter((stroke) => stroke.visible !== false);
}

function hasExactStrokeGeometry(node) {
  return Array.isArray(node.strokeGeometry) && node.strokeGeometry.length > 0;
}

function stableJson(value) {
  if (value == null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(',')}}`;
}

const featureKeys = new Set();

function pushFeature(features, kind, frame, node, parentId, depth, detail) {
  const key = [kind, frame.id, node.id, stableJson(detail)].join('|');
  if (featureKeys.has(key)) return;
  featureKeys.add(key);
  features.push({
    kind,
    rootFrameId: frame.id,
    frameName: frame.name,
    id: node.id,
    name: node.name,
    type: node.type,
    parentId,
    depth,
    bbox: node.absoluteBoundingBox || null,
    detail,
  });
}

const manifest = await readJson('figma-nodes/manifest.json');
const features = [];

for (const frame of manifest) {
  const document = await readJson(path.join('public/figma-frames', frame.file));
  walk(document, (node, parentId, depth) => {
    for (const paint of [...(node.fills || []), ...(node.background || [])]) {
      if (paint.visible === false) continue;
      if (!['SOLID', 'IMAGE'].includes(paint.type)) {
        pushFeature(features, 'unsupportedPaintType', frame, node, parentId, depth, { paintType: paint.type });
      }
      if (paint.type === 'IMAGE' && paint.filters) {
        pushFeature(features, 'imageFiltersNotRendered', frame, node, parentId, depth, { filters: paint.filters });
      }
      if (paint.type === 'IMAGE' && !isSupportedImageTransform(paint.imageTransform)) {
        pushFeature(features, 'nonDiagonalImageTransform', frame, node, parentId, depth, { imageTransform: paint.imageTransform });
      }
    }
    const strokes = visibleStrokes(node);
    for (const stroke of strokes) {
      if (stroke.type !== 'SOLID') {
        pushFeature(features, 'unsupportedStrokeType', frame, node, parentId, depth, { strokeType: stroke.type });
      }
    }
    if (node.type === 'TEXT' && strokes.length) {
      pushFeature(features, 'textStrokeNotRendered', frame, node, parentId, depth, {
        strokeAlign: node.strokeAlign || null,
        strokeWeight: node.strokeWeight || 0,
        strokeTypes: strokes.map((stroke) => stroke.type),
      });
    }
    if (node.type !== 'TEXT' && strokes.length && node.strokeAlign && node.strokeAlign !== 'INSIDE' && !hasExactStrokeGeometry(node)) {
      pushFeature(features, 'nonInsideStrokeAlignNotRenderedExactly', frame, node, parentId, depth, {
        strokeAlign: node.strokeAlign,
        strokeWeight: node.strokeWeight || 0,
        strokeTypes: strokes.map((stroke) => stroke.type),
      });
    }
    for (const effect of node.effects || []) {
      if (effect.visible === false) continue;
      if (effect.type !== 'DROP_SHADOW') {
        pushFeature(features, 'unsupportedEffectType', frame, node, parentId, depth, { effectType: effect.type });
      }
    }
  });
}

const byKind = features.reduce((acc, feature) => {
  acc[feature.kind] = (acc[feature.kind] || 0) + 1;
  return acc;
}, {});
const byFrame = features.reduce((acc, feature) => {
  acc[feature.rootFrameId] = acc[feature.rootFrameId] || { frameName: feature.frameName, count: 0, kinds: {} };
  acc[feature.rootFrameId].count += 1;
  acc[feature.rootFrameId].kinds[feature.kind] = (acc[feature.rootFrameId].kinds[feature.kind] || 0) + 1;
  return acc;
}, {});

const report = {
  generatedFrom: ['figma-nodes/manifest.json', 'public/figma-frames/*.json'],
  purpose: 'Documents Figma REST features that are intentionally not rendered until an exact implementation exists. Do not approximate these silently.',
  totalUnsupportedFeatureRecords: features.length,
  byKind,
  byFrame,
  features,
};

const lines = [
  '# Unsupported Figma Render Features',
  '',
  'Generated without calling the Figma API. These are committed Figma features that the renderer does not yet render exactly.',
  '',
  `- Total unsupported feature records: \`${features.length}\``,
  '',
  '## By kind',
  '',
  '| Kind | Count |',
  '|---|---:|',
];
for (const [kind, count] of Object.entries(byKind).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))) {
  lines.push(`| \`${kind}\` | ${count} |`);
}
lines.push('', '## By frame', '', '| Frame ID | Count | Frame name |', '|---|---:|---|');
for (const [frameId, item] of Object.entries(byFrame).sort((a, b) => b[1].count - a[1].count || a[0].localeCompare(b[0]))) {
  lines.push(`| \`${frameId}\` | ${item.count} | ${item.frameName} |`);
}
lines.push('', '## Renderer contract', '');
lines.push('- These records are intentionally unsupported until an exact renderer exists.');
lines.push('- CSS filter approximations are not acceptable for Figma image filters.');
lines.push('- If exact support is implemented, remove the corresponding records from this audit in the same change.');
lines.push('', 'Do not silently approximate these features. Implement exact support or keep them visible in this audit.');

await writeOrCheck('figma-audit/unsupported-render-features.json', jsonText(report));
await writeOrCheck('figma-audit/unsupported-render-features.md', `${lines.join('\n')}\n`);

if (process.exitCode) process.exit(process.exitCode);
console.log(CHECK
  ? `Unsupported feature audit is current: ${features.length} record(s).`
  : `Unsupported feature audit: ${features.length} record(s).`);
