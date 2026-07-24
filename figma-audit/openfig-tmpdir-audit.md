# OpenFig TMPDIR Audit

Generated: 2026-07-24T16:52:49.265Z

## Policy

- OpenFig scripts **must** set `process.env.TMPDIR` to `.openfig-tmp` (repo-relative).
- OpenFig scripts **must** call `rmSync(tmpDir, { recursive: true, force: true })` to clean up.
- Hardcoded `/tmp/openfig*` or `/tmp/budlum*` paths in extraction logic are **forbidden**.

## Results

| Script | Uses .openfig-tmp | Has cleanup | Forbidden /tmp refs | Pass |
|---|---|---|---|---|
| `scripts/resolve-openfig-geometry.mjs` | ✅ | ✅ | ✅ none | ✅ |
| `scripts/audit-openfig-interactions.mjs` | ✅ | ✅ | ✅ none | ✅ |

## All scripts pass CI guard: ✅ YES
