# Figma Render Coverage Summary

Generated without calling the Figma API. It audits committed frame JSON against the renderer contract.

## Aggregate

- Frames: `39`
- Total nodes: `15530`
- Exact VECTOR geometry nodes rendered from Figma paths: `790`
- Exact RECTANGLE/ELLIPSE leaf geometry nodes rendered from Figma paths: `1503`
- Renderable VECTOR-like nodes skipped because exact geometry is missing: `0`
- Empty/no-op VECTOR-like nodes requiring no geometry: `36`
- Missing exact asset audit entries: `0`
- Nodes positioned with Figma relativeTransform matrices: `3997`
- Rotated nodes positioned from Figma rotation fallback: `511`
- Rotated transform nodes covered by matrix positioning: `841`
- Rotated transform nodes still unsupported: `0`
- Text nodes: `1241`
- Text nodes with exact style override spans: `16`
- Image-fill nodes: `3896`
- CSS primitive/container nodes: `8059`

## Frames with missing exact geometry

| Frame ID | Missing audit entries | Skipped geometry nodes | Frame name |
|---|---:|---:|---|

Do not approximate skipped geometry nodes. Refresh those frames with `npm run figma:refresh` after Figma rate limits cool down.
