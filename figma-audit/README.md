# Figma Audit Directory

This directory is the shared handoff area for Figma-driven implementation work. Do not use it as a place to invent missing UI. If Figma data is incomplete, record the gap here and leave the corresponding UI node unapproximated.

## Core audit files

- `nested-frames.json` — nested frame/component/instance inventory from the Figma node payloads.
- `prototype-interactions.json` — interactions found in the Figma REST node payloads.
- `variants.json` — variant/component-set records found in the Figma REST node payloads.
- `missing-exact-assets.json` — visible VECTOR-like nodes that cannot be rendered because committed JSON lacks exact `fillGeometry` / `strokeGeometry`.

## Generated planning/coverage files

- `remaining-exact-assets-plan.md` — human-readable batch plan for refreshing frames after Figma rate limits cool down.
- `remaining-exact-assets-plan.json` — machine-readable version of the remaining refresh plan.
- `render-coverage-summary.md` — human-readable render coverage report for committed frame JSON.
- `render-coverage-summary.json` — machine-readable render coverage report.
- `wallet-states-review.json` — Wallet frame/state review summary.
- `wallet-exact-vector-assets-resolved.json` — Wallet scope vector nodes that were resolved with exact Figma geometry.

## Local commands

Run these without calling the Figma API:

```bash
npm run figma:sync-missing
npm run figma:coverage
npm run figma:plan
npm run figma:verify
```


Run these in CI/check mode without rewriting files:

```bash
npm run figma:sync-missing:check
npm run figma:coverage:check
npm run figma:plan:check
npm run figma:verify
```


Print the next recommended live-refresh batch without calling Figma:

```bash
npm run figma:next
npm run figma:next -- --batch=2
```

Run this only when explicitly refreshing from Figma and only with a token in the environment:

```bash
FIGMA_TOKEN=<figma-token> \
FIGMA_CHUNK_SIZE=1 \
FIGMA_MAX_RETRIES=2 \
FIGMA_RETRY_WAIT_MS=600000 \
FIGMA_MAX_WAIT_MS=900000 \
FIGMA_SKIP_RATE_LIMITED=1 \
npm run figma:refresh -- --ids=<frame-id-list>
```

## Rules for other AI agents

1. Do not approximate VECTOR-like nodes listed in `missing-exact-assets.json`.
2. Do not remove audit entries unless the corresponding committed frame JSON now contains exact geometry.
3. After any Figma refresh, run the local commands above and commit all changed audit files together with the refreshed frame JSON.
4. Do not commit secrets. Tokens must appear only as shell environment variables.
5. If Figma returns `429`, stop live refresh attempts and follow `../FIGMA_RATE_LIMIT_PLAYBOOK.md`.
