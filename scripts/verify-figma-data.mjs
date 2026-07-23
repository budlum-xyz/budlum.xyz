import fs from 'node:fs';
import path from 'node:path';

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const fail = (message) => { console.error(`FIGMA VERIFY: ${message}`); process.exitCode = 1; };
const manifestPath = 'figma-nodes/manifest.json';
if (!fs.existsSync(manifestPath)) fail('Missing figma-nodes/manifest.json');
else {
  const manifest = readJson(manifestPath);
  if (!Array.isArray(manifest) || manifest.length !== 39) fail(`Expected 39 top-level frame records, got ${manifest?.length ?? 0}`);
  for (const frame of manifest) {
    if (!frame.id || !frame.name || !frame.file) fail(`Invalid manifest record: ${JSON.stringify(frame)}`);
    const source = path.join('figma-nodes', frame.file);
    const runtime = path.join('public/figma-frames', frame.file);
    if (!fs.existsSync(source)) fail(`Missing source node JSON: ${source}`);
    if (!fs.existsSync(runtime)) fail(`Missing runtime node JSON: ${runtime}`);
    if (fs.existsSync(source) && readJson(source).id !== frame.id) fail(`Source node ID mismatch: ${source}`);
  }
}
for (const name of ['nested-frames.json', 'prototype-interactions.json', 'missing-exact-assets.json', 'variants.json']) {
  const file = path.join('figma-audit', name);
  if (!fs.existsSync(file)) fail(`Missing audit file: ${file}`);
}
if (!process.exitCode) console.log('FIGMA VERIFY: node manifest and audit structure are valid.');
