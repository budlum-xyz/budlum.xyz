import fs from 'node:fs';
import path from 'node:path';

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const fail = (message) => { console.error(`FIGMA VERIFY: ${message}`); process.exitCode = 1; };
const ok = (message) => console.log(`FIGMA VERIFY: ${message}`);

const manifestPath = 'figma-nodes/manifest.json';
const auditDir = 'figma-audit';
const frameComponentName = (id) => `Frame${id.replace(':', '_')}.jsx`;
const tokenPatterns = [
  { name: 'GitHub token', pattern: /gh[pousr]_[A-Za-z0-9_]{20,}/g },
  { name: 'Figma token', pattern: /figd_[A-Za-z0-9_-]{20,}/g },
];
const scanExtensions = new Set(['.js', '.jsx', '.mjs', '.json', '.md', '.html', '.css', '.yml', '.yaml', '.txt']);
const excludedDirs = new Set(['.git', 'node_modules', 'dist', 'build', 'coverage', '.cache', '.arena']);

function walkFiles(dir, visitor) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (excludedDirs.has(entry.name)) continue;
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(file, visitor);
    else visitor(file);
  }
}

function assertJsonFile(file, description) {
  if (!fs.existsSync(file)) {
    fail(`Missing ${description}: ${file}`);
    return null;
  }
  try {
    return readJson(file);
  } catch (error) {
    fail(`Invalid JSON in ${description}: ${file} (${error.message})`);
    return null;
  }
}

function verifyNoCommittedTokens() {
  for (const root of ['.', '.github', 'figma-audit', 'figma-nodes', 'public', 'scripts', 'src']) {
    walkFiles(root, (file) => {
      const ext = path.extname(file);
      if (!scanExtensions.has(ext)) return;
      const content = fs.readFileSync(file, 'utf8');
      for (const token of tokenPatterns) {
        token.pattern.lastIndex = 0;
        if (token.pattern.test(content)) fail(`Possible committed ${token.name} in ${file}`);
      }
    });
  }
}

function verifyManifestAndFrames() {
  const manifest = assertJsonFile(manifestPath, 'Figma manifest');
  if (!manifest) return [];
  if (!Array.isArray(manifest) || manifest.length !== 39) fail(`Expected 39 top-level frame records, got ${manifest?.length ?? 0}`);

  const seen = new Set();
  for (const frame of manifest) {
    if (!frame.id || !frame.name || !frame.file) {
      fail(`Invalid manifest record: ${JSON.stringify(frame)}`);
      continue;
    }
    if (seen.has(frame.id)) fail(`Duplicate manifest frame ID: ${frame.id}`);
    seen.add(frame.id);

    const source = path.join('figma-nodes', frame.file);
    const runtime = path.join('public/figma-frames', frame.file);
    const sourceJson = assertJsonFile(source, 'source node JSON');
    const runtimeJson = assertJsonFile(runtime, 'runtime node JSON');
    if (sourceJson?.id !== frame.id) fail(`Source node ID mismatch: ${source}`);
    if (runtimeJson?.id !== frame.id) fail(`Runtime node ID mismatch: ${runtime}`);
    if (sourceJson?.name !== frame.name) fail(`Source node name mismatch for ${frame.id}: expected ${frame.name}, got ${sourceJson?.name}`);

    const component = path.join('src', 'frames', frameComponentName(frame.id));
    if (!fs.existsSync(component)) {
      fail(`Missing frame component: ${component}`);
    } else {
      const text = fs.readFileSync(component, 'utf8');
      if (!text.includes(`Figma node ID: ${frame.id}`)) fail(`Frame component missing Figma node ID comment: ${component}`);
      if (!text.includes(frame.file)) fail(`Frame component does not reference runtime JSON file ${frame.file}: ${component}`);
    }
  }
  return manifest;
}

function verifyAuditFiles() {
  for (const name of ['nested-frames.json', 'prototype-interactions.json', 'missing-exact-assets.json', 'variants.json']) {
    assertJsonFile(path.join(auditDir, name), `audit file ${name}`);
  }

  const missing = assertJsonFile(path.join(auditDir, 'missing-exact-assets.json'), 'missing exact assets audit') || [];
  const plan = fs.existsSync(path.join(auditDir, 'remaining-exact-assets-plan.json'))
    ? readJson(path.join(auditDir, 'remaining-exact-assets-plan.json'))
    : null;

  if (plan) {
    if (plan.totalMissingExactAssets !== missing.length) {
      fail(`remaining-exact-assets-plan.json is stale: expected totalMissingExactAssets=${missing.length}, got ${plan.totalMissingExactAssets}`);
    }
    const frameCount = new Set(missing.map((entry) => entry.rootFrameId)).size;
    if (plan.totalFramesWithMissingExactAssets !== frameCount) {
      fail(`remaining-exact-assets-plan.json is stale: expected totalFramesWithMissingExactAssets=${frameCount}, got ${plan.totalFramesWithMissingExactAssets}`);
    }
  }

  const coverage = fs.existsSync(path.join(auditDir, 'render-coverage-summary.json'))
    ? readJson(path.join(auditDir, 'render-coverage-summary.json'))
    : null;
  if (coverage) {
    if (coverage.aggregate?.missingExactAssetAuditEntries !== missing.length) {
      fail(`render-coverage-summary.json is stale: expected missingExactAssetAuditEntries=${missing.length}, got ${coverage.aggregate?.missingExactAssetAuditEntries}`);
    }
    if (coverage.aggregate?.skippedMissingGeometry !== missing.length) {
      fail(`render-coverage-summary.json mismatch: skippedMissingGeometry=${coverage.aggregate?.skippedMissingGeometry}, missing audit entries=${missing.length}`);
    }
  }

  const walletReview = fs.existsSync(path.join(auditDir, 'wallet-states-review.json'))
    ? readJson(path.join(auditDir, 'wallet-states-review.json'))
    : null;
  if (walletReview?.implementedFrameIds) {
    const walletIds = new Set(walletReview.implementedFrameIds);
    const actualWalletMissing = missing.filter((entry) => walletIds.has(entry.rootFrameId)).length;
    if (walletReview.aggregate?.totalMissingExactVectorAssets !== actualWalletMissing) {
      fail(`wallet-states-review.json is stale: expected totalMissingExactVectorAssets=${actualWalletMissing}, got ${walletReview.aggregate?.totalMissingExactVectorAssets}`);
    }
  }
}


function verifyUnsupportedRendererContract() {
  const unsupportedPath = path.join(auditDir, 'unsupported-render-features.json');
  if (!fs.existsSync(unsupportedPath)) return;
  const unsupported = readJson(unsupportedPath);
  const hasUnsupportedImageFilters = (unsupported.features || []).some((feature) => feature.kind === 'imageFiltersNotRendered')
    || Boolean(unsupported.byKind?.imageFiltersNotRendered);
  if (!hasUnsupportedImageFilters) return;

  const renderer = fs.existsSync(path.join('src', 'FigmaNode.jsx'))
    ? fs.readFileSync(path.join('src', 'FigmaNode.jsx'), 'utf8')
    : '';
  const approximateImageFilterPatterns = [
    /cssImageFilter/,
    /\.filters\b/,
    /filter\s*:/,
    /style\.filter\b/,
  ];
  if (approximateImageFilterPatterns.some((pattern) => pattern.test(renderer))) {
    fail('Renderer appears to process Figma image filters while imageFiltersNotRendered remains in unsupported audit. Implement exact support and clear the audit, or leave filters unrendered.');
  }
}

function verifyPublicImageFillMap() {
  const payload = assertJsonFile('public/figma-image-fills.json', 'Figma image fill map');
  if (!payload) return;
  const images = payload.meta?.images || payload.images;
  if (!images || typeof images !== 'object') fail('Figma image fill map does not contain an images object.');
}

verifyNoCommittedTokens();
verifyManifestAndFrames();
verifyAuditFiles();
verifyUnsupportedRendererContract();
verifyPublicImageFillMap();

if (!process.exitCode) ok('node manifest, components, audit structure, image fills, and token scan are valid.');
