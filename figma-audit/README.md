# Figma Audit Directory

This directory is the shared handoff area for Figma-driven implementation work. Do not use it as a place to invent missing UI. If Figma data is incomplete, record the gap here and leave the corresponding UI node unapproximated.

## Status dashboard

- `current-status.md` / `.json` — consolidated status generated from all committed Figma/OpenFig audit files.

## Core audit files

- `nested-frames.json` — nested frame/component/instance inventory from the Figma node payloads.
- `prototype-interactions.json` — interactions found in the Figma REST node payloads.
- `variants.json` — variant/component-set records found in the Figma REST node payloads.
- `missing-exact-assets.json` — visible/renderable VECTOR-like nodes that cannot be rendered because committed JSON lacks exact `fillGeometry` / `strokeGeometry`. Current target state is empty (`0` records).

## Generated planning/coverage files

- `remaining-exact-assets-plan.md` — human-readable batch plan for refreshing frames after Figma rate limits cool down. Current target state is `0` frames.
- `remaining-exact-assets-plan.json` — machine-readable version of the remaining refresh plan.
- `render-coverage-summary.md` — human-readable render coverage report for committed frame JSON.
- `render-coverage-summary.json` — machine-readable render coverage report.
- `wallet-states-review.json` — Wallet frame/state review summary.
- `wallet-exact-vector-assets-resolved.json` — Wallet scope vector nodes that were resolved with exact Figma geometry.

- `openfig-geometry-final-report.md` / `.json` — cumulative exact-geometry recovery report from the checked-in OpenFig `.fig` binary.
- `openfig-geometry-resolve-summary.md` / `.json` — current OpenFig↔Figma geometry resolver summary.
- `openfig-figma-crosswalk-candidates.json` — frame mapping candidates used by the OpenFig geometry resolver.
- `openfig-interactions.md` / `.json` — OpenFig hyperlink/prototype-like inventory for interaction handoff.
- `image-filter-exactness-review.md` / `.json` — exactness decision and node inventory for Figma image filters that are intentionally unsupported until a pixel-equivalent renderer exists.
- `local-image-assets.md` / `.json` — committed local image asset inventory generated from the OpenFig `.fig` archive.
- `openfig-tooling-security-review.md` / `.json` — development-only OpenFig toolchain audit and mitigation notes.
- `paint-stack-review.md` / `.json` — multi-fill paint stack inventory and exactness notes.
- `text-stroke-exactness-review.md` / `.json` — exactness decision and inventory for unsupported Figma text strokes.
- `stroke-overlay-coverage.md` / `.json` — coverage audit for image-fill stroke overlay rendering (SVG overlay exact, CSS border INSIDE exact, CSS border CENTER/OUTSIDE approximate).
- `openfig-tmpdir-audit.md` / `.json` — CI guard verifying OpenFig scripts use `.openfig-tmp` and clean up, not `/tmp`.
- `font-coverage.md` / `.json` — runtime font package/import coverage for Figma text nodes.

## Local commands

Run these without calling the Figma API:

```bash
npm run figma:sync-missing
npm run figma:coverage
npm run figma:plan
npm run figma:unsupported
npm run figma:image-filters
npm run figma:paint-stacks
npm run figma:text-strokes
npm run figma:stroke-overlay
npm run figma:openfig-tmpdir
npm run figma:fonts
npm run figma:images:extract
npm run figma:openfig:interactions
npm run figma:status
npm run figma:status:check
npm run figma:verify
```


Run these in CI/check mode without rewriting files:

```bash
npm run figma:sync-missing:check
npm run figma:coverage:check
npm run figma:plan:check
npm run figma:unsupported:check
npm run figma:image-filters:check
npm run figma:paint-stacks:check
npm run figma:text-strokes:check
npm run figma:stroke-overlay:check
npm run figma:openfig-tmpdir:check
npm run figma:fonts:check
npm run figma:images:check
npm run figma:openfig:interactions:check
npm run figma:verify
```


Print the next recommended live-refresh batch without calling Figma:

```bash
npm run figma:next
npm run figma:next -- --batch=2
```



Run all non-Figma-API audit checks with one command. This also installs `tools/design-import` dependencies locally so OpenFig checks can run:

```bash
npm run figma:doctor
```

Track unsupported non-geometry render features and image-filter exactness without calling Figma:

```bash
npm run figma:unsupported
npm run figma:unsupported:check
npm run figma:image-filters
npm run figma:image-filters:check
npm run figma:images:extract
npm run figma:images:check
```

This writes/checks:

- `figma-audit/unsupported-render-features.json`
- `figma-audit/unsupported-render-features.md`
- `figma-audit/image-filter-exactness-review.json`
- `figma-audit/image-filter-exactness-review.md`
- `figma-audit/paint-stack-review.json`
- `figma-audit/paint-stack-review.md`
- `figma-audit/local-image-assets.json`
- `figma-audit/local-image-assets.md`

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


## Runtime image URL rule

Runtime frame JSON files under `public/figma-frames/` must not contain Figma/S3 `assetUrl` fields. Image fills are resolved through `public/figma-image-fills.json`, which must map used image refs to committed `/figma-assets/...` files. `npm run figma:verify` fails if source/runtime frame JSON diverges or if `assetUrl` fields are reintroduced.

## Rules for other AI agents

1. Do not approximate VECTOR-like nodes listed in `missing-exact-assets.json`; if the file is empty, keep it empty unless a real missing geometry record is introduced.
2. Do not remove missing-geometry audit entries unless the corresponding committed frame JSON now contains exact geometry, or the node is proven to be a no-op with no visible fill/stroke/effect/render bounds.
3. After any Figma/OpenFig refresh or image asset extraction, run `npm run figma:doctor` and commit all changed audit files together with the refreshed frame JSON/assets.
4. Do not commit secrets. Tokens must appear only as shell environment variables.
5. If Figma returns `429`, stop live refresh attempts and follow `../FIGMA_RATE_LIMIT_PLAYBOOK.md`.
