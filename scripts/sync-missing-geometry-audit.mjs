import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const CHECK = process.argv.includes('--check');
const VECTOR_TYPES = new Set(['VECTOR', 'STAR', 'BOOLEAN_OPERATION', 'LINE', 'REGULAR_POLYGON']);
const readText = async (file) => readFile(file, 'utf8');
const readJson = async (file) => JSON.parse(await readText(file));
const jsonText = (data) => `${JSON.stringify(data, null, 2)}\n`;

function walk(node, visitor, parentId = null, depth = 0) {
  visitor(node, parentId, depth);
  for (const child of node.children || []) walk(child, visitor, node.id, depth + 1);
}

const manifest = await readJson('figma-nodes/manifest.json');
const missingFile = 'figma-audit/missing-exact-assets.json';
const existingText = await readText(missingFile);
const existing = JSON.parse(existingText);
const byId = new Map(existing.map((entry) => [entry.id, entry]));
let added = 0;

for (const frame of manifest) {
  const document = await readJson(path.join('public/figma-frames', frame.file));
  walk(document, (node, parentId, depth) => {
    if (node.visible === false) return;
    if (!VECTOR_TYPES.has(node.type)) return;
    if (node.fillGeometry || node.strokeGeometry) return;
    if (byId.has(node.id)) return;
    byId.set(node.id, {
      rootFrameId: frame.id,
      id: node.id,
      name: node.name,
      type: node.type,
      parentId,
      depth,
      visible: node.visible !== false,
      bbox: node.absoluteBoundingBox || null,
      reason: 'Exact SVG/path geometry is not present in committed Figma node JSON; refresh this frame with geometry=paths before rendering.',
    });
    added += 1;
  });
}

const merged = [...byId.values()].sort((a, b) =>
  String(a.rootFrameId).localeCompare(String(b.rootFrameId)) ||
  String(a.depth ?? 0).localeCompare(String(b.depth ?? 0)) ||
  String(a.id).localeCompare(String(b.id))
);
const nextText = jsonText(merged);

if (CHECK) {
  if (existingText !== nextText) {
    console.error(`Missing geometry audit is stale: ${merged.length} expected entries, ${added} untracked entries would be added. Run npm run figma:sync-missing.`);
    process.exit(1);
  }
  console.log(`Missing geometry audit is current: ${merged.length} entries.`);
} else {
  await writeFile(missingFile, nextText, 'utf8');
  console.log(`Missing geometry audit synced: ${merged.length} total, ${added} added.`);
}
