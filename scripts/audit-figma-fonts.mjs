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
    console.error(`${file} is stale. Run npm run figma:fonts.`);
    process.exitCode = 1;
  }
}

function walk(node, visitor) {
  visitor(node);
  for (const child of node.children || []) walk(child, visitor);
}

function fontsourcePackageFor(fontFamily) {
  return `@fontsource/${String(fontFamily).toLowerCase().replace(/\s+/g, '-')}`;
}

const manifest = await readJson('figma-nodes/manifest.json');
const packageJson = await readJson('package.json');
const mainSource = await readText('src/main.jsx');
const byFont = new Map();

for (const frame of manifest) {
  const document = await readJson(path.join('public/figma-frames', frame.file));
  walk(document, (node) => {
    if (node.type !== 'TEXT') return;
    const fontFamily = node.style?.fontFamily || null;
    const fontWeight = node.style?.fontWeight || null;
    const fontStyle = node.style?.fontStyle || null;
    const key = `${fontFamily}|${fontWeight}|${fontStyle}`;
    const item = byFont.get(key) || { fontFamily, fontWeight, fontStyle, count: 0, frames: new Map(), examples: [] };
    item.count += 1;
    const frameItem = item.frames.get(frame.id) || { frameName: frame.name, count: 0 };
    frameItem.count += 1;
    item.frames.set(frame.id, frameItem);
    if (item.examples.length < 8) item.examples.push({ rootFrameId: frame.id, id: node.id, name: node.name, characters: node.characters });
    byFont.set(key, item);
  });
}

const fonts = [...byFont.values()].sort((a, b) => b.count - a.count || String(a.fontFamily).localeCompare(String(b.fontFamily))).map((item) => {
  const pkg = fontsourcePackageFor(item.fontFamily);
  const expectedImport = `${pkg}/${item.fontWeight || 400}.css`;
  return {
    fontFamily: item.fontFamily,
    fontWeight: item.fontWeight,
    fontStyle: item.fontStyle,
    textNodeCount: item.count,
    frames: Object.fromEntries([...item.frames.entries()].sort((a, b) => a[0].localeCompare(b[0]))),
    fontsourcePackage: pkg,
    packageDependencyPresent: Boolean(packageJson.dependencies?.[pkg] || packageJson.devDependencies?.[pkg]),
    cssImportPresent: mainSource.includes(expectedImport),
    expectedImport,
    examples: item.examples,
  };
});

const missing = fonts.filter((font) => !font.packageDependencyPresent || !font.cssImportPresent);
const report = {
  generatedFrom: ['public/figma-frames/*.json', 'package.json', 'src/main.jsx'],
  purpose: 'Ensures Figma text font families used by frame JSON are bundled at runtime instead of falling back silently.',
  aggregate: {
    uniqueFontFaces: fonts.length,
    textNodes: fonts.reduce((sum, font) => sum + font.textNodeCount, 0),
    missingRuntimeFontCoverage: missing.length,
  },
  fonts,
  missing,
};

const lines = [
  '# Figma Runtime Font Coverage',
  '',
  'Generated from committed Figma runtime JSON and runtime imports.',
  '',
  `- Unique font faces: \`${report.aggregate.uniqueFontFaces}\``,
  `- Text nodes: \`${report.aggregate.textNodes}\``,
  `- Missing runtime font coverage: \`${report.aggregate.missingRuntimeFontCoverage}\``,
  '',
  '| Font family | Weight | Style | Text nodes | Package | CSS import |',
  '|---|---:|---|---:|---|---|',
];
for (const font of fonts) {
  lines.push(`| ${font.fontFamily} | ${font.fontWeight} | ${font.fontStyle} | ${font.textNodeCount} | ${font.packageDependencyPresent ? 'yes' : 'no'} \`${font.fontsourcePackage}\` | ${font.cssImportPresent ? 'yes' : 'no'} \`${font.expectedImport}\` |`);
}
if (missing.length) {
  lines.push('', '## Missing runtime coverage', '', '| Font family | Expected package | Expected import |', '|---|---|---|');
  for (const font of missing) lines.push(`| ${font.fontFamily} | \`${font.fontsourcePackage}\` | \`${font.expectedImport}\` |`);
}

await writeOrCheck('figma-audit/font-coverage.json', jsonText(report));
await writeOrCheck('figma-audit/font-coverage.md', `${lines.join('\n')}\n`);

if (missing.length) {
  console.error(`Missing runtime font coverage for ${missing.length} font face(s).`);
  process.exitCode = 1;
}

if (process.exitCode) process.exit(process.exitCode);
console.log(CHECK
  ? `Figma font coverage is current: ${fonts.length} font face(s).`
  : `Figma font coverage: ${fonts.length} font face(s).`);
