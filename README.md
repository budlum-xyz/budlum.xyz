# Budlum.xyz — Figma implementation

This repository renders the `budlum.xyz` Figma design as React from committed Figma/OpenFig source data.

- Every top-level `budlum.xyz` Figma frame has a dedicated React wrapper under `src/frames/`.
- Frame source JSON preserves Figma node IDs and layer names under `figma-nodes/`.
- Runtime frame data is under `public/figma-frames/`.
- Runtime image fills use committed local assets under `public/figma-assets/`, generated from the checked-in OpenFig `.fig` archive.
- Exact vector/path geometry is resolved; `figma-audit/missing-exact-assets.json` should stay empty unless a real new missing-geometry node is introduced.
- Unsupported non-geometry features, currently Figma image filters without a proven pixel-equivalent renderer, are tracked under `figma-audit/` and must not be approximated.

## Run

```bash
npm install
npm run dev
```

## Verify

```bash
npm run build
npm run figma:doctor
```

`figma:doctor` runs all non-live Figma/OpenFig checks and installs `tools/design-import` dependencies locally for OpenFig validation. It does not call the live Figma API.

## Live Figma refresh

Do not run live Figma refresh unless explicitly assigned and a non-rate-limited token is provided via environment variable only. See `FIGMA_RATE_LIMIT_PLAYBOOK.md`.
