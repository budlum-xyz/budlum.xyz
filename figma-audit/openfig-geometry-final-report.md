# OpenFig Geometry Final Report

This report records the cumulative exact-geometry recovery work performed from the checked-in OpenFig `.fig` binary after live Figma API refresh was blocked by rate limits.

## Source and matching policy

- OpenFig source: `tools/design-import/fixtures/untitled.fig`
- OpenFig parsed nodes: `25,658`
- OpenFig parsed blobs: `1,299`
- Dominant Figma↔OpenFig coordinate offset: `dx=19146`, `dy=-27147`
- Frame matching: compatible frame name + exact width/height + dominant coordinate offset.
- Node matching: compatible type + exact layer name + relative bbox within tolerance.
- No geometry was guessed. Ambiguous candidates were resolved only when decoded geometry signatures were identical.

## Cumulative outcome

| Step | Count | Result |
|---|---:|---|
| Initial missing exact geometry records | `774` | Baseline from `figma-audit/missing-exact-assets.json` |
| OpenFig geometry records resolved in main pass | `738` | Geometry paths written to matching Figma source/runtime JSON nodes |
| Previously resolved records re-applied for transform metadata | `738` | `size`, `targetAspectRatio`, and `relativeTransform` filled from exact OpenFig transforms |
| Duplicate REGULAR_POLYGON records resolved by identical geometry signatures | `4` | Geometry paths written after ambiguity was proven harmless |
| Empty/no-op VECTOR-like records removed from missing audit | `32` | Figma JSON had no visible fill/stroke/effect/render bounds, so no geometry is required |
| Final missing exact geometry records | `0` | `figma-audit/missing-exact-assets.json` is empty |

## Final render coverage

- Frames: `39`
- Total nodes: `15,530`
- Exact VECTOR geometry nodes rendered from path data: `790`
- Exact RECTANGLE/ELLIPSE leaf geometry nodes rendered from path data: `1,477`
- Renderable VECTOR-like nodes skipped because exact geometry is missing: `0`
- Empty/no-op VECTOR-like nodes requiring no geometry: `36`
- Remaining exact-geometry refresh plan: `0` frames, `0` records

## Validation

After synchronization:

```bash
npm run figma:doctor
npm run build
```

Both passed locally. GitHub Actions/CI remains the final approval gate.
