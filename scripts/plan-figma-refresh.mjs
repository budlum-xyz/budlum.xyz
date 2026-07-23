import { readFile, writeFile } from 'node:fs/promises';

const readJson = async (file) => JSON.parse(await readFile(file, 'utf8'));
const writeJson = async (file, data) => writeFile(file, JSON.stringify(data, null, 2), 'utf8');

const missing = await readJson('figma-audit/missing-exact-assets.json');
const manifest = await readJson('figma-nodes/manifest.json');
const manifestById = new Map(manifest.map((frame) => [frame.id, frame]));

const grouped = new Map();
for (const entry of missing) {
  const item = grouped.get(entry.rootFrameId) || {
    frameId: entry.rootFrameId,
    frameName: manifestById.get(entry.rootFrameId)?.name || entry.rootFrameId,
    frameFile: manifestById.get(entry.rootFrameId)?.file || null,
    missingExactAssetCount: 0,
    nodeTypes: {},
    examples: [],
  };
  item.missingExactAssetCount += 1;
  item.nodeTypes[entry.type] = (item.nodeTypes[entry.type] || 0) + 1;
  if (item.examples.length < 5) {
    item.examples.push({ id: entry.id, name: entry.name, type: entry.type, reason: entry.reason });
  }
  grouped.set(entry.rootFrameId, item);
}

const frames = [...grouped.values()].sort((a, b) => a.missingExactAssetCount - b.missingExactAssetCount || a.frameId.localeCompare(b.frameId));
const smallFirstIds = frames.map((frame) => frame.frameId);
const suggestedBatches = [];
for (let index = 0; index < smallFirstIds.length; index += 4) {
  suggestedBatches.push(smallFirstIds.slice(index, index + 4));
}

const report = {
  generatedFrom: 'figma-audit/missing-exact-assets.json',
  strategy: 'Refresh smallest missing-exact-asset frames first, with FIGMA_CHUNK_SIZE=1 and long Retry-After capped by FIGMA_MAX_WAIT_MS.',
  totalMissingExactAssets: missing.length,
  totalFramesWithMissingExactAssets: frames.length,
  frames,
  suggestedBatches,
  safeCommandTemplate: 'FIGMA_TOKEN=<figma-token> FIGMA_CHUNK_SIZE=1 FIGMA_MAX_RETRIES=2 FIGMA_RETRY_WAIT_MS=600000 FIGMA_MAX_WAIT_MS=900000 FIGMA_SKIP_RATE_LIMITED=1 npm run figma:refresh -- --ids=<comma-separated-frame-ids>',
};

await writeJson('figma-audit/remaining-exact-assets-plan.json', report);

const lines = [
  '# Remaining Exact Figma Geometry Plan',
  '',
  'Generated from `figma-audit/missing-exact-assets.json`.',
  '',
  `- Total missing exact assets: \`${report.totalMissingExactAssets}\``,
  `- Frames with missing exact assets: \`${report.totalFramesWithMissingExactAssets}\``,
  '',
  '## Safe command template',
  '',
  '```bash',
  report.safeCommandTemplate,
  '```',
  '',
  '## Suggested batches',
  '',
];

suggestedBatches.forEach((batch, index) => {
  lines.push(`### Batch ${index + 1}`);
  lines.push('');
  lines.push('```bash');
  lines.push(`FIGMA_TOKEN=<figma-token> \\\nFIGMA_CHUNK_SIZE=1 \\\nFIGMA_MAX_RETRIES=2 \\\nFIGMA_RETRY_WAIT_MS=600000 \\\nFIGMA_MAX_WAIT_MS=900000 \\\nFIGMA_SKIP_RATE_LIMITED=1 \\\nnpm run figma:refresh -- --ids=${batch.join(',')}`);
  lines.push('```');
  lines.push('');
});

lines.push('## Frame order');
lines.push('');
lines.push('| Frame ID | Missing exact assets | Frame name |');
lines.push('|---|---:|---|');
for (const frame of frames) {
  lines.push(`| \`${frame.frameId}\` | ${frame.missingExactAssetCount} | ${frame.frameName} |`);
}
lines.push('');
lines.push('Do not approximate vector nodes. If Figma still returns 429, leave these entries in audit and retry later.');

await writeFile('figma-audit/remaining-exact-assets-plan.md', `${lines.join('\n')}\n`, 'utf8');
console.log(`Planned ${frames.length} frame(s), ${missing.length} missing exact asset record(s).`);
