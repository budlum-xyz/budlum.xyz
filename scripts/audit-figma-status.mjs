import { readFile, writeFile } from 'node:fs/promises';

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
    console.error(`${file} is stale. Run npm run figma:status.`);
    process.exitCode = 1;
  }
}

const [
  manifest,
  coverage,
  unsupported,
  plan,
  fontCoverage,
  localImages,
  imageFilters,
  textStrokes,
  paintStacks,
  openfigInteractions,
  openfigGeometry,
  toolingSecurity,
] = await Promise.all([
  readJson('figma-nodes/manifest.json'),
  readJson('figma-audit/render-coverage-summary.json'),
  readJson('figma-audit/unsupported-render-features.json'),
  readJson('figma-audit/remaining-exact-assets-plan.json'),
  readJson('figma-audit/font-coverage.json'),
  readJson('figma-audit/local-image-assets.json'),
  readJson('figma-audit/image-filter-exactness-review.json'),
  readJson('figma-audit/text-stroke-exactness-review.json'),
  readJson('figma-audit/paint-stack-review.json'),
  readJson('figma-audit/openfig-interactions.json'),
  readJson('figma-audit/openfig-geometry-final-report.json'),
  readJson('figma-audit/openfig-tooling-security-review.json'),
]);

const status = {
  generatedFrom: [
    'figma-nodes/manifest.json',
    'figma-audit/render-coverage-summary.json',
    'figma-audit/unsupported-render-features.json',
    'figma-audit/remaining-exact-assets-plan.json',
    'figma-audit/font-coverage.json',
    'figma-audit/local-image-assets.json',
    'figma-audit/image-filter-exactness-review.json',
    'figma-audit/text-stroke-exactness-review.json',
    'figma-audit/paint-stack-review.json',
    'figma-audit/openfig-interactions.json',
    'figma-audit/openfig-geometry-final-report.json',
    'figma-audit/openfig-tooling-security-review.json',
  ],
  summary: {
    manifestFrames: manifest.length,
    totalRenderedNodesAudited: coverage.aggregate.totalNodes,
    missingExactGeometryRecords: coverage.aggregate.missingExactAssetAuditEntries,
    skippedRenderableVectorGeometry: coverage.aggregate.skippedMissingGeometry,
    exactVectorGeometryNodes: coverage.aggregate.exactVectorGeometry,
    exactLeafGeometryNodes: coverage.aggregate.exactLeafGeometry,
    unsupportedFeatureRecords: unsupported.totalUnsupportedFeatureRecords,
    unsupportedByKind: unsupported.byKind,
    remainingRefreshPlanFrames: plan.totalFramesWithMissingExactAssets,
    remainingRefreshPlanRecords: plan.totalMissingExactAssets,
    localImageAssets: localImages.aggregate.localAssets,
    localImageAssetBytes: localImages.aggregate.totalBytes,
    runtimeFontFaces: fontCoverage.aggregate.uniqueFontFaces,
    missingRuntimeFontCoverage: fontCoverage.aggregate.missingRuntimeFontCoverage,
    imageFilterRecordsBlocked: imageFilters.aggregate.unsupportedImageFilterRecords,
    textStrokeRecordsBlocked: textStrokes.aggregate.textStrokeRecords,
    multiFillPaintStackRecords: paintStacks.aggregate.multiFillRecords,
    openfigPrototypeLikeRecords: openfigInteractions.aggregate.prototypeLikeRecords,
    openfigHyperlinkRecordsOutsideScope: openfigInteractions.aggregate.hyperlinksOutsideManifestFrames,
    openfigGeometryFinalMissing: openfigGeometry.cumulativeOutcome.finalMissingExactGeometryRecords,
    openfigToolingVulnerabilities: toolingSecurity.toolingAudit.vulnerabilities,
  },
  decisions: {
    noApproximateVectorGeometry: coverage.aggregate.skippedMissingGeometry === 0,
    liveFigmaGeometryRefreshRequired: plan.totalMissingExactAssets > 0,
    imageFiltersBlockedUntilExactPixelMath: imageFilters.status,
    textStrokesBlockedUntilExactOutlineRenderer: textStrokes.status,
    localRuntimeImagesRequired: true,
    openfigToolingRuntimeShipped: false,
  },
};

const lines = [
  '# Figma Implementation Current Status',
  '',
  'Generated from committed audit files. This does not call the Figma API.',
  '',
  '## Summary',
  '',
  `- Manifest frames: \`${status.summary.manifestFrames}\``,
  `- Total Figma nodes audited: \`${status.summary.totalRenderedNodesAudited}\``,
  `- Missing exact geometry records: \`${status.summary.missingExactGeometryRecords}\``,
  `- Skipped renderable vector geometry: \`${status.summary.skippedRenderableVectorGeometry}\``,
  `- Exact vector geometry nodes: \`${status.summary.exactVectorGeometryNodes}\``,
  `- Exact rectangle/ellipse leaf geometry nodes: \`${status.summary.exactLeafGeometryNodes}\``,
  `- Unsupported feature records: \`${status.summary.unsupportedFeatureRecords}\``,
  `- Remaining live refresh plan: \`${status.summary.remainingRefreshPlanFrames}\` frame(s), \`${status.summary.remainingRefreshPlanRecords}\` record(s)`,
  `- Local image assets: \`${status.summary.localImageAssets}\` (\`${status.summary.localImageAssetBytes}\` bytes)`,
  `- Runtime font faces covered: \`${status.summary.runtimeFontFaces}\``,
  '',
  '## Unsupported by kind',
  '',
  '| Kind | Count |',
  '|---|---:|',
];
for (const [kind, count] of Object.entries(status.summary.unsupportedByKind).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))) {
  lines.push(`| \`${kind}\` | ${count} |`);
}
lines.push(
  '',
  '## Decisions',
  '',
  `- Exact vector geometry backlog closed: \`${status.decisions.noApproximateVectorGeometry}\``,
  `- Live Figma geometry refresh currently required: \`${status.decisions.liveFigmaGeometryRefreshRequired}\``,
  `- Image filters: \`${status.decisions.imageFiltersBlockedUntilExactPixelMath}\``,
  `- Text strokes: \`${status.decisions.textStrokesBlockedUntilExactOutlineRenderer}\``,
  `- Runtime images must stay local: \`${status.decisions.localRuntimeImagesRequired}\``,
  `- OpenFig tooling is shipped to runtime: \`${status.decisions.openfigToolingRuntimeShipped}\``,
);

await writeOrCheck('figma-audit/current-status.json', jsonText(status));
await writeOrCheck('figma-audit/current-status.md', `${lines.join('\n')}\n`);

if (process.exitCode) process.exit(process.exitCode);
console.log(CHECK
  ? `Figma status report is current: ${status.summary.unsupportedFeatureRecords} unsupported feature record(s).`
  : `Figma status report: ${status.summary.unsupportedFeatureRecords} unsupported feature record(s).`);
