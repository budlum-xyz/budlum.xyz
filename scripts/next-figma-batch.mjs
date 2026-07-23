import { readFile } from 'node:fs/promises';

const readJson = async (file) => JSON.parse(await readFile(file, 'utf8'));
const batchArg = process.argv.find((arg) => arg.startsWith('--batch='));
const batchIndex = batchArg ? Math.max(Number(batchArg.slice('--batch='.length)) - 1, 0) : 0;

const plan = await readJson('figma-audit/remaining-exact-assets-plan.json');
const batch = plan.suggestedBatches?.[batchIndex];

if (!batch) {
  console.error(`No batch ${batchIndex + 1}. Plan has ${plan.suggestedBatches?.length || 0} batch(es).`);
  process.exit(1);
}

const framesById = new Map(plan.frames.map((frame) => [frame.frameId, frame]));
console.log(`Figma exact-geometry refresh batch ${batchIndex + 1}/${plan.suggestedBatches.length}`);
console.log('');
console.log('| Frame ID | Missing exact assets | Frame name |');
console.log('|---|---:|---|');
for (const id of batch) {
  const frame = framesById.get(id);
  console.log(`| ${id} | ${frame?.missingExactAssetCount ?? '?'} | ${frame?.frameName ?? ''} |`);
}
console.log('');
console.log('Safe command:');
console.log('');
console.log('```bash');
console.log(`FIGMA_TOKEN=<figma-token> \\
FIGMA_CHUNK_SIZE=1 \\
FIGMA_MAX_RETRIES=2 \\
FIGMA_RETRY_WAIT_MS=600000 \\
FIGMA_MAX_WAIT_MS=900000 \\
FIGMA_SKIP_RATE_LIMITED=1 \\
npm run figma:refresh -- --ids=${batch.join(',')}`);
console.log('```');
