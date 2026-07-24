# Stroke Overlay Coverage — Image-Fill Nodes

Generated: 2026-07-24T16:52:49.114Z

## Summary

| Category | Count | Exactness |
|---|---|---|
| SVG overlay (strokeGeometry) | 1 | exact |
| CSS border (INSIDE, solid stroke) | 8 | exact |
| CSS border (CENTER/OUTSIDE or non-solid) | 0 | approximate |
| Not rendered | 4003 | n/a |
| **Total image-fill nodes** | **4012** | |

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

