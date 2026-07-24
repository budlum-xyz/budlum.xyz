#!/usr/bin/env node
/**
 * Audit: ensure OpenFig scripts use .openfig-tmp and not /tmp.
 *
 * Scans the OpenFig geometry and interaction scripts for:
 * - Correct TMPDIR assignment to .openfig-tmp
 * - Cleanup (rmSync) of the tmp directory
 * - No hardcoded /tmp references in paths that affect extraction
 *
 * This guard prevents the disk-full /tmp pollution seen in earlier runs.
 */

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

const CHECK = process.argv.includes('--check');

const SCRIPTS = [
  'scripts/resolve-openfig-geometry.mjs',
  'scripts/audit-openfig-interactions.mjs',
];

const REQUIRED_TMPDIR_VAR = '.openfig-tmp';
const FORBIDDEN_PATTERNS = [
  '/tmp/openfig',
  "'/tmp/",
  '"/tmp/',
  '/tmp/budlum',
  "'/tmp/budlum",
  '"/tmp/budlum',
];

async function main() {
  const findings = [];
  let allPass = true;

  for (const scriptPath of SCRIPTS) {
    const fullPath = path.join(repoRoot, scriptPath);
    const content = readFileSync(fullPath, 'utf8');
    const lines = content.split('\n');

    const tmpdirLine = lines.find((l) => l.includes('TMPDIR') && l.includes('='));
    // .openfig-tmp may be assigned to tmpDir variable, not just in TMPDIR= line
    const usesOpenfigTmp = tmpdirLine?.includes(REQUIRED_TMPDIR_VAR) || content.includes(REQUIRED_TMPDIR_VAR);

    const cleanupLine = lines.find((l) => l.includes('rmSync') && l.includes('tmpDir'));
    const hasCleanup = !!cleanupLine;

    const forbiddenRefs = FORBIDDEN_PATTERNS.filter((p) => content.includes(p));
    const passes = usesOpenfigTmp && hasCleanup && forbiddenRefs.length === 0;

    findings.push({
      script: scriptPath,
      usesOpenfigTmp: !!usesOpenfigTmp,
      tmpdirLine: tmpdirLine?.trim() || null,
      hasCleanup: !!hasCleanup,
      cleanupLine: cleanupLine?.trim() || null,
      forbiddenRefs,
      passes,
    });

    if (!passes) allPass = false;
  }

  const stableOutput = {
    scripts: findings,
    allPass,
  };

  const output = {
    generated: new Date().toISOString(),
    ...stableOutput,
  };

  const outJson = path.join(repoRoot, 'figma-audit/openfig-tmpdir-audit.json');
  const outMd = path.join(repoRoot, 'figma-audit/openfig-tmpdir-audit.md');

  const lines = [
    '# OpenFig TMPDIR Audit',
    '',
    `Generated: ${output.generated}`,
    '',
    '## Policy',
    '',
    '- OpenFig scripts **must** set `process.env.TMPDIR` to `.openfig-tmp` (repo-relative).',
    '- OpenFig scripts **must** call `rmSync(tmpDir, { recursive: true, force: true })` to clean up.',
    '- Hardcoded `/tmp/openfig*` or `/tmp/budlum*` paths in extraction logic are **forbidden**.',
    '',
    '## Results',
    '',
    '| Script | Uses .openfig-tmp | Has cleanup | Forbidden /tmp refs | Pass |',
    '|---|---|---|---|---|',
    ...findings.map(
      (f) =>
        `| \`${f.script}\` | ${f.usesOpenfigTmp ? '✅' : '❌'} | ${f.hasCleanup ? '✅' : '❌'} | ${f.forbiddenRefs.length ? '❌ ' + f.forbiddenRefs.join(', ') : '✅ none'} | ${f.passes ? '✅' : '❌'} |`,
    ),
    '',
    '## All scripts pass CI guard: ' + (allPass ? '✅ YES' : '❌ NO'),
  ];

  const jsonText = `${JSON.stringify(stableOutput, null, 2)}\n`;
  const mdText = `${lines.join('\n')}\n`;

  if (!CHECK) {
    const { writeFileSync } = await import('node:fs');
    writeFileSync(outJson, jsonText, 'utf8');
    writeFileSync(outMd, mdText, 'utf8');
    console.log(`OpenFig TMPDIR audit: ${allPass ? 'PASS' : 'FAIL'}`);
    for (const f of findings) {
      if (!f.passes) {
        console.error(`  FAIL: ${f.script}`);
        if (!f.usesOpenfigTmp) console.error(`    Missing .openfig-tmp usage`);
        if (!f.hasCleanup) console.error(`    Missing rmSync cleanup`);
        if (f.forbiddenRefs.length) console.error(`    Forbidden /tmp refs: ${f.forbiddenRefs.join(', ')}`);
      }
    }
  } else {
    const current = JSON.parse(readFileSync(outJson, 'utf8'));
    if (JSON.stringify(current.scripts) !== JSON.stringify(stableOutput.scripts) || current.allPass !== stableOutput.allPass) {
      console.error('OpenFig TMPDIR audit is stale. Run npm run figma:openfig-tmpdir.');
      process.exit(1);
    }
    console.log(`OpenFig TMPDIR audit is current: ${allPass ? 'PASS' : 'FAIL'}`);
  }

  if (!allPass) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
