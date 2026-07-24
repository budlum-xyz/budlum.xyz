# Figma Implementation Current Status

Generated from committed audit files. This does not call the Figma API.

## Summary

- Manifest frames: `44`
- Total Figma nodes audited: `41905`
- Missing exact geometry records: `0`
- Skipped renderable vector geometry: `0`
- Exact vector geometry nodes: `1684`
- Exact rectangle/ellipse leaf geometry nodes: `12411`
- Unsupported feature records: `268`
- Remaining live refresh plan: `0` frame(s), `0` record(s)
- Local image assets: `118` (`57353872` bytes)
- Runtime font faces covered: `6`

## Unsupported by kind

| Kind | Count |
|---|---:|
| `textStrokeNotRendered` | 205 |
| `imageFiltersNotRendered` | 63 |

## Decisions

- Exact vector geometry backlog closed: `true`
- Live Figma geometry refresh currently required: `false`
- Image filters: `not-rendered-exactness-blocked`
- Text strokes: `not-rendered-exactness-blocked`
- Runtime images must stay local: `true`
- OpenFig tooling is shipped to runtime: `false`
