import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const CHECK = process.argv.includes('--check');
const FIG_PATH = process.env.OPENFIG_FILE || 'tools/design-import/fixtures/untitled.fig';
const OPENFIG_DECK = 'tools/design-import/node_modules/openfig-cli/lib/core/fig-deck.mjs';
const OPENFIG_HELPERS = 'tools/design-import/node_modules/openfig-cli/lib/core/node-helpers.mjs';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const readJson = async (file) => JSON.parse(await readFile(file, 'utf8'));
const jsonText = (data) => `${JSON.stringify(data, null, 2)}\n`;

async function writeOrCheck(file, nextText) {
  if (!CHECK) {
    await writeFile(file, nextText, 'utf8');
    return;
  }
  const current = await readFile(file, 'utf8');
  if (current !== nextText) {
    console.error(`${file} is stale. Run npm run figma:openfig:interactions.`);
    process.exitCode = 1;
  }
}

function requireOpenFigDependency() {
  const deckPath = path.join(repoRoot, OPENFIG_DECK);
  const helperPath = path.join(repoRoot, OPENFIG_HELPERS);
  if (!existsSync(deckPath) || !existsSync(helperPath)) {
    throw new Error('OpenFig dependency is missing. Run: cd tools/design-import && npm ci');
  }
}

function prepareOpenFigTempDir() {
  const tmpDir = path.join(repoRoot, '.openfig-tmp');
  rmSync(tmpDir, { recursive: true, force: true });
  mkdirSync(tmpDir, { recursive: true });
  process.env.TMPDIR = tmpDir;
}

function nodeIdFromGuid(guid) {
  return `${guid.sessionID}:${guid.localID}`;
}

function interestingKeys(node) {
  return Object.keys(node).filter((key) => /proto|interact|transition|action|reaction|flow|overlay|navigation|trigger|destination|click|hover|mouse|link|hyperlink/i.test(key));
}

function ancestorIds(id, parentById) {
  const out = [];
  let current = parentById.get(id);
  while (current) {
    out.push(current);
    current = parentById.get(current);
  }
  return out;
}

requireOpenFigDependency();
prepareOpenFigTempDir();
const [{ FigDeck }, { nid }] = await Promise.all([
  import(pathToFileURL(path.join(repoRoot, OPENFIG_DECK)).href),
  import(pathToFileURL(path.join(repoRoot, OPENFIG_HELPERS)).href),
]);

const deck = await FigDeck.fromFile(path.join(repoRoot, FIG_PATH));
const parentById = new Map();
for (const node of deck.message.nodeChanges) {
  const id = nid(node);
  const parentId = node.parentIndex?.guid ? nodeIdFromGuid(node.parentIndex.guid) : null;
  if (parentId) parentById.set(id, parentId);
}

const geometrySummary = existsSync('figma-audit/openfig-geometry-resolve-summary.json')
  ? await readJson('figma-audit/openfig-geometry-resolve-summary.json')
  : { frameMappings: [] };
const mappedFrameIds = new Set((geometrySummary.frameMappings || []).map((mapping) => mapping.openFigFrameId));
const manifest = await readJson('figma-nodes/manifest.json');

const prototypeLike = [];
const hyperlinks = [];
for (const node of deck.message.nodeChanges) {
  const id = nid(node);
  const keys = interestingKeys(node);
  if (!keys.length) continue;
  const ancestors = ancestorIds(id, parentById);
  const mappedAncestor = ancestors.find((ancestor) => mappedFrameIds.has(ancestor));
  const base = {
    openFigNodeId: id,
    type: node.type,
    name: node.name || null,
    keys,
    parentId: parentById.get(id) || null,
    ancestorIds: ancestors,
    insideManifestFrame: Boolean(mappedAncestor),
    manifestOpenFigFrameId: mappedAncestor || null,
  };
  if (node.hyperlink != null) {
    hyperlinks.push({
      ...base,
      hyperlink: node.hyperlink,
      hasUrl: Boolean(node.hyperlink?.url),
    });
  }
  const nonHyperlinkKeys = keys.filter((key) => key !== 'hyperlink');
  if (nonHyperlinkKeys.length) {
    prototypeLike.push({
      ...base,
      keys: nonHyperlinkKeys,
    });
  }
}

const report = {
  generatedFrom: [FIG_PATH, 'figma-audit/openfig-geometry-resolve-summary.json', 'figma-nodes/manifest.json'],
  purpose: 'Documents interaction-like data discovered in the checked-in OpenFig .fig binary so prototype behavior is not guessed.',
  aggregate: {
    openFigNodes: deck.message.nodeChanges.length,
    manifestFrames: manifest.length,
    mappedOpenFigFrames: mappedFrameIds.size,
    prototypeLikeRecords: prototypeLike.length,
    hyperlinkRecords: hyperlinks.length,
    hyperlinksInsideManifestFrames: hyperlinks.filter((item) => item.insideManifestFrame).length,
    hyperlinksOutsideManifestFrames: hyperlinks.filter((item) => !item.insideManifestFrame).length,
    hyperlinksWithUrl: hyperlinks.filter((item) => item.hasUrl).length,
  },
  policy: {
    prototypeImplementation: prototypeLike.length === 0 ? 'No OpenFig prototype/navigation keys were found in the checked file.' : 'Prototype-like keys require explicit Figma verification before implementation.',
    hyperlinkImplementation: 'Hyperlinks outside the 39 manifest frames are not implemented in the React renderer scope.',
    noGuessing: true,
  },
  prototypeLike,
  hyperlinks,
};

const lines = [
  '# OpenFig Interaction Audit',
  '',
  'Generated from the checked-in OpenFig `.fig` binary. This does not call the Figma API.',
  '',
  `- OpenFig nodes scanned: \`${report.aggregate.openFigNodes}\``,
  `- Manifest frames: \`${report.aggregate.manifestFrames}\``,
  `- Mapped OpenFig manifest frames: \`${report.aggregate.mappedOpenFigFrames}\``,
  `- Prototype/navigation-like records: \`${report.aggregate.prototypeLikeRecords}\``,
  `- Hyperlink records: \`${report.aggregate.hyperlinkRecords}\``,
  `- Hyperlinks inside manifest frame scope: \`${report.aggregate.hyperlinksInsideManifestFrames}\``,
  `- Hyperlinks outside manifest frame scope: \`${report.aggregate.hyperlinksOutsideManifestFrames}\``,
  '',
  '## Decision',
  '',
  prototypeLike.length === 0
    ? 'No OpenFig prototype/navigation keys were found. Existing Figma REST prototype audit remains the source of truth for the 39 React-rendered frames.'
    : 'Prototype-like OpenFig keys were found and must be verified against Figma before implementation.',
  '',
  'Hyperlink records found in this OpenFig file are outside the 39 manifest-frame React scope, so they are inventoried here rather than implemented.',
];
if (hyperlinks.length) {
  lines.push('', '## Hyperlinks', '', '| OpenFig node | Type | Name | URL | In manifest scope |', '|---|---|---|---|---|');
  for (const item of hyperlinks) {
    lines.push(`| \`${item.openFigNodeId}\` | \`${item.type}\` | ${item.name || ''} | ${item.hyperlink?.url || ''} | ${item.insideManifestFrame ? 'yes' : 'no'} |`);
  }
}
if (prototypeLike.length) {
  lines.push('', '## Prototype-like records', '', '| OpenFig node | Type | Name | Keys | In manifest scope |', '|---|---|---|---|---|');
  for (const item of prototypeLike) {
    lines.push(`| \`${item.openFigNodeId}\` | \`${item.type}\` | ${item.name || ''} | \`${item.keys.join(',')}\` | ${item.insideManifestFrame ? 'yes' : 'no'} |`);
  }
}

await writeOrCheck('figma-audit/openfig-interactions.json', jsonText(report));
await writeOrCheck('figma-audit/openfig-interactions.md', `${lines.join('\n')}\n`);

if (process.exitCode) process.exit(process.exitCode);
console.log(CHECK
  ? `OpenFig interaction audit is current: ${prototypeLike.length} prototype-like record(s), ${hyperlinks.length} hyperlink record(s).`
  : `OpenFig interaction audit: ${prototypeLike.length} prototype-like record(s), ${hyperlinks.length} hyperlink record(s).`);
