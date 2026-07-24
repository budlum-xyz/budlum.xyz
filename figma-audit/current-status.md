# Figma Implementation Current Status

Generated from committed audit files. This does not call the Figma API.

## Summary

- Manifest frames: `39`
- Total Figma nodes audited: `15530`
- Missing exact geometry records: `0`
- Skipped renderable vector geometry: `0`
- Exact vector geometry nodes: `790`
- Exact rectangle/ellipse leaf geometry nodes: `1503`
- Unsupported feature records: `61`
- Remaining live refresh plan: `0` frame(s), `0` record(s)
- Local image assets: `68` (`16542753` bytes)
- Runtime font faces covered: `2`

## Unsupported by kind

| Kind | Count |
|---|---:|
| `textStrokeNotRendered` | 36 |
| `imageFiltersNotRendered` | 25 |

## Decisions

- Exact vector geometry backlog closed: `true`
- Live Figma geometry refresh currently required: `false`
- Image filters: `not-rendered-exactness-blocked`
- Text strokes: `not-rendered-exactness-blocked`
- Runtime images must stay local: `true`
- OpenFig tooling is shipped to runtime: `false`
