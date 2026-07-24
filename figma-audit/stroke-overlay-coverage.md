# Stroke Overlay Coverage — Image-Fill Nodes

Generated: 2026-07-24T17:48:34.138Z

## Summary

| Category | Count | Exactness |
|---|---|---|
| SVG overlay (strokeGeometry) | 11 | exact |
| CSS border (INSIDE, solid stroke) | 10 | exact |
| CSS border (CENTER/OUTSIDE or non-solid) | 0 | approximate |
| Not rendered | 12320 | n/a |
| **Total image-fill nodes** | **12341** | |

## Render method reference

| Method | Trigger | Exactness rationale |
|---|---|---|
| `svg-overlay` | `strokeGeometry` present | Exact SVG path from OpenFig binary |
| `css-border` (INSIDE) | INSIDE + solid stroke, no strokeGeometry | CSS border is inside by default; exact for rectangles |
| `css-border` (CENTER/OUTSIDE) | solid stroke, no strokeGeometry | Border position differs from Figma CENTER/OUTSIDE |
| `not-rendered` | Non-solid stroke, no strokeGeometry | CSS cannot replicate gradient/image stroke |

## SVG overlay nodes (exact strokeGeometry)

| Frame | Node | Type | Align | Weight |
|---|---|---|---|---|
| budlum.xyzde fareyle gezilirken | 1000105989 2 | `RECTANGLE` | `CENTER` | 4 |
| budlum.xyz/go | bebek 2 | `RECTANGLE` | `OUTSIDE` | 4 |
| budlum.xyz | 1000105989 2 | `RECTANGLE` | `CENTER` | 4 |
| budlum.xyz | daş15 1 | `RECTANGLE` | `INSIDE` | 4 |
| budlum.xyz | daş 12 1 | `RECTANGLE` | `INSIDE` | 4 |
| budlum.xyz | daş15 1 | `RECTANGLE` | `INSIDE` | 4 |
| budlum.xyz | daş 12 5 | `RECTANGLE` | `INSIDE` | 4 |
| budlum.xyz | daş15 9 | `RECTANGLE` | `INSIDE` | 4 |
| budlum.xyz | Rectangle 218 | `RECTANGLE` | `INSIDE` | 4 |
| budlum.xyz | Rectangle 218 | `RECTANGLE` | `INSIDE` | 4 |
| budlum.xyz | Rectangle 218 | `RECTANGLE` | `INSIDE` | 4 |

