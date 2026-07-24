# Figma Text Stroke Exactness Review

Generated from `figma-audit/unsupported-render-features.json` without calling the Figma API.

- Status: `not-rendered-exactness-blocked`
- Text stroke records: `36`
- Affected frames: `12`
- Unique stroke/font specs: `1`

## Exactness decision

CSS `-webkit-text-stroke` is not accepted as an exact Figma `OUTSIDE` text-stroke renderer. These nodes remain unrendered as strokes until exact text outline/vector data or a proven pixel-equivalent renderer exists.

## Specs

| Count | Spec | Frames |
|---:|---|---|
| 36 | `{"fontFamily":"Dosis","fontSize":48,"strokeAlign":"OUTSIDE","strokePaints":[{"blendMode":"NORMAL","color":{"a":1,"b":0.9803921580314636,"g":0.9882352948188782,"r":0.9843137264251709},"type":"SOLID"}],"strokeWeight":4}` | `2870:3749` (3), `2870:4251` (3), `2900:600` (3), `2903:345` (3), `2904:826` (3), `2921:712` (3), `2961:486` (3), `2961:886` (3), `2967:528` (3), `2971:1324` (3), `2971:1618` (3), `2972:2406` (3) |

## Affected text nodes

| Frame ID | Node ID | Name | Characters | Stroke | Font |
|---|---|---|---|---|---|
| `2972:2406` | `2972:2420` | Revaştakiler | `Revaştakiler` | `{"strokeAlign":"OUTSIDE","strokeWeight":4,"strokes":[{"blendMode":"NORMAL","color":{"a":1,"b":0.9803921580314636,"g":0.9882352948188782,"r":0.9843137264251709},"type":"SOLID"}]}` | `{"fontFamily":"Dosis","fontSize":48,"fontWeight":400}` |
| `2972:2406` | `2972:2421` | Market | `Market` | `{"strokeAlign":"OUTSIDE","strokeWeight":4,"strokes":[{"blendMode":"NORMAL","color":{"a":1,"b":0.9803921580314636,"g":0.9882352948188782,"r":0.9843137264251709},"type":"SOLID"}]}` | `{"fontFamily":"Dosis","fontSize":48,"fontWeight":400}` |
| `2972:2406` | `2972:2422` | Transactions | `Transactions` | `{"strokeAlign":"OUTSIDE","strokeWeight":4,"strokes":[{"blendMode":"NORMAL","color":{"a":1,"b":0.9803921580314636,"g":0.9882352948188782,"r":0.9843137264251709},"type":"SOLID"}]}` | `{"fontFamily":"Dosis","fontSize":48,"fontWeight":400}` |
| `2870:4251` | `2870:4265` | Revaştakiler | `Revaştakiler` | `{"strokeAlign":"OUTSIDE","strokeWeight":4,"strokes":[{"blendMode":"NORMAL","color":{"a":1,"b":0.9803921580314636,"g":0.9882352948188782,"r":0.9843137264251709},"type":"SOLID"}]}` | `{"fontFamily":"Dosis","fontSize":48,"fontWeight":400}` |
| `2870:4251` | `2870:4266` | Market | `Market` | `{"strokeAlign":"OUTSIDE","strokeWeight":4,"strokes":[{"blendMode":"NORMAL","color":{"a":1,"b":0.9803921580314636,"g":0.9882352948188782,"r":0.9843137264251709},"type":"SOLID"}]}` | `{"fontFamily":"Dosis","fontSize":48,"fontWeight":400}` |
| `2870:4251` | `2870:4267` | Transactions | `Transactions` | `{"strokeAlign":"OUTSIDE","strokeWeight":4,"strokes":[{"blendMode":"NORMAL","color":{"a":1,"b":0.9803921580314636,"g":0.9882352948188782,"r":0.9843137264251709},"type":"SOLID"}]}` | `{"fontFamily":"Dosis","fontSize":48,"fontWeight":400}` |
| `2971:1324` | `2971:1332` | Revaştakiler | `Revaştakiler` | `{"strokeAlign":"OUTSIDE","strokeWeight":4,"strokes":[{"blendMode":"NORMAL","color":{"a":1,"b":0.9803921580314636,"g":0.9882352948188782,"r":0.9843137264251709},"type":"SOLID"}]}` | `{"fontFamily":"Dosis","fontSize":48,"fontWeight":400}` |
| `2971:1324` | `2971:1333` | Market | `Market` | `{"strokeAlign":"OUTSIDE","strokeWeight":4,"strokes":[{"blendMode":"NORMAL","color":{"a":1,"b":0.9803921580314636,"g":0.9882352948188782,"r":0.9843137264251709},"type":"SOLID"}]}` | `{"fontFamily":"Dosis","fontSize":48,"fontWeight":400}` |
| `2971:1324` | `2971:1334` | Transactions | `Transactions` | `{"strokeAlign":"OUTSIDE","strokeWeight":4,"strokes":[{"blendMode":"NORMAL","color":{"a":1,"b":0.9803921580314636,"g":0.9882352948188782,"r":0.9843137264251709},"type":"SOLID"}]}` | `{"fontFamily":"Dosis","fontSize":48,"fontWeight":400}` |
| `2971:1618` | `2971:1626` | Revaştakiler | `Revaştakiler` | `{"strokeAlign":"OUTSIDE","strokeWeight":4,"strokes":[{"blendMode":"NORMAL","color":{"a":1,"b":0.9803921580314636,"g":0.9882352948188782,"r":0.9843137264251709},"type":"SOLID"}]}` | `{"fontFamily":"Dosis","fontSize":48,"fontWeight":400}` |
| `2971:1618` | `2971:1627` | Market | `Market` | `{"strokeAlign":"OUTSIDE","strokeWeight":4,"strokes":[{"blendMode":"NORMAL","color":{"a":1,"b":0.9803921580314636,"g":0.9882352948188782,"r":0.9843137264251709},"type":"SOLID"}]}` | `{"fontFamily":"Dosis","fontSize":48,"fontWeight":400}` |
| `2971:1618` | `2971:1628` | Transactions | `Transactions` | `{"strokeAlign":"OUTSIDE","strokeWeight":4,"strokes":[{"blendMode":"NORMAL","color":{"a":1,"b":0.9803921580314636,"g":0.9882352948188782,"r":0.9843137264251709},"type":"SOLID"}]}` | `{"fontFamily":"Dosis","fontSize":48,"fontWeight":400}` |
| `2921:712` | `2921:720` | Revaştakiler | `Revaştakiler` | `{"strokeAlign":"OUTSIDE","strokeWeight":4,"strokes":[{"blendMode":"NORMAL","color":{"a":1,"b":0.9803921580314636,"g":0.9882352948188782,"r":0.9843137264251709},"type":"SOLID"}]}` | `{"fontFamily":"Dosis","fontSize":48,"fontWeight":400}` |
| `2921:712` | `2921:721` | Market | `Market` | `{"strokeAlign":"OUTSIDE","strokeWeight":4,"strokes":[{"blendMode":"NORMAL","color":{"a":1,"b":0.9803921580314636,"g":0.9882352948188782,"r":0.9843137264251709},"type":"SOLID"}]}` | `{"fontFamily":"Dosis","fontSize":48,"fontWeight":400}` |
| `2921:712` | `2921:722` | Transactions | `Transactions` | `{"strokeAlign":"OUTSIDE","strokeWeight":4,"strokes":[{"blendMode":"NORMAL","color":{"a":1,"b":0.9803921580314636,"g":0.9882352948188782,"r":0.9843137264251709},"type":"SOLID"}]}` | `{"fontFamily":"Dosis","fontSize":48,"fontWeight":400}` |
| `2967:528` | `2967:536` | Revaştakiler | `Revaştakiler` | `{"strokeAlign":"OUTSIDE","strokeWeight":4,"strokes":[{"blendMode":"NORMAL","color":{"a":1,"b":0.9803921580314636,"g":0.9882352948188782,"r":0.9843137264251709},"type":"SOLID"}]}` | `{"fontFamily":"Dosis","fontSize":48,"fontWeight":400}` |
| `2967:528` | `2967:537` | Market | `Market` | `{"strokeAlign":"OUTSIDE","strokeWeight":4,"strokes":[{"blendMode":"NORMAL","color":{"a":1,"b":0.9803921580314636,"g":0.9882352948188782,"r":0.9843137264251709},"type":"SOLID"}]}` | `{"fontFamily":"Dosis","fontSize":48,"fontWeight":400}` |
| `2967:528` | `2967:538` | Transactions | `Transactions` | `{"strokeAlign":"OUTSIDE","strokeWeight":4,"strokes":[{"blendMode":"NORMAL","color":{"a":1,"b":0.9803921580314636,"g":0.9882352948188782,"r":0.9843137264251709},"type":"SOLID"}]}` | `{"fontFamily":"Dosis","fontSize":48,"fontWeight":400}` |
| `2961:886` | `2961:894` | Revaştakiler | `Revaştakiler` | `{"strokeAlign":"OUTSIDE","strokeWeight":4,"strokes":[{"blendMode":"NORMAL","color":{"a":1,"b":0.9803921580314636,"g":0.9882352948188782,"r":0.9843137264251709},"type":"SOLID"}]}` | `{"fontFamily":"Dosis","fontSize":48,"fontWeight":400}` |
| `2961:886` | `2961:895` | Market | `Market` | `{"strokeAlign":"OUTSIDE","strokeWeight":4,"strokes":[{"blendMode":"NORMAL","color":{"a":1,"b":0.9803921580314636,"g":0.9882352948188782,"r":0.9843137264251709},"type":"SOLID"}]}` | `{"fontFamily":"Dosis","fontSize":48,"fontWeight":400}` |
| `2961:886` | `2961:896` | Transactions | `Transactions` | `{"strokeAlign":"OUTSIDE","strokeWeight":4,"strokes":[{"blendMode":"NORMAL","color":{"a":1,"b":0.9803921580314636,"g":0.9882352948188782,"r":0.9843137264251709},"type":"SOLID"}]}` | `{"fontFamily":"Dosis","fontSize":48,"fontWeight":400}` |
| `2961:486` | `2961:494` | Revaştakiler | `Revaştakiler` | `{"strokeAlign":"OUTSIDE","strokeWeight":4,"strokes":[{"blendMode":"NORMAL","color":{"a":1,"b":0.9803921580314636,"g":0.9882352948188782,"r":0.9843137264251709},"type":"SOLID"}]}` | `{"fontFamily":"Dosis","fontSize":48,"fontWeight":400}` |
| `2961:486` | `2961:495` | Market | `Market` | `{"strokeAlign":"OUTSIDE","strokeWeight":4,"strokes":[{"blendMode":"NORMAL","color":{"a":1,"b":0.9803921580314636,"g":0.9882352948188782,"r":0.9843137264251709},"type":"SOLID"}]}` | `{"fontFamily":"Dosis","fontSize":48,"fontWeight":400}` |
| `2961:486` | `2961:496` | Transactions | `Transactions` | `{"strokeAlign":"OUTSIDE","strokeWeight":4,"strokes":[{"blendMode":"NORMAL","color":{"a":1,"b":0.9803921580314636,"g":0.9882352948188782,"r":0.9843137264251709},"type":"SOLID"}]}` | `{"fontFamily":"Dosis","fontSize":48,"fontWeight":400}` |
| `2870:3749` | `2870:3763` | Top ranks | `Top ranks` | `{"strokeAlign":"OUTSIDE","strokeWeight":4,"strokes":[{"blendMode":"NORMAL","color":{"a":1,"b":0.9803921580314636,"g":0.9882352948188782,"r":0.9843137264251709},"type":"SOLID"}]}` | `{"fontFamily":"Dosis","fontSize":48,"fontWeight":400}` |
| `2870:3749` | `2870:3764` | Market | `Market` | `{"strokeAlign":"OUTSIDE","strokeWeight":4,"strokes":[{"blendMode":"NORMAL","color":{"a":1,"b":0.9803921580314636,"g":0.9882352948188782,"r":0.9843137264251709},"type":"SOLID"}]}` | `{"fontFamily":"Dosis","fontSize":48,"fontWeight":400}` |
| `2870:3749` | `2870:3765` | Transactions | `Transactions` | `{"strokeAlign":"OUTSIDE","strokeWeight":4,"strokes":[{"blendMode":"NORMAL","color":{"a":1,"b":0.9803921580314636,"g":0.9882352948188782,"r":0.9843137264251709},"type":"SOLID"}]}` | `{"fontFamily":"Dosis","fontSize":48,"fontWeight":400}` |
| `2903:345` | `2903:359` | Revaştakiler | `Revaştakiler` | `{"strokeAlign":"OUTSIDE","strokeWeight":4,"strokes":[{"blendMode":"NORMAL","color":{"a":1,"b":0.9803921580314636,"g":0.9882352948188782,"r":0.9843137264251709},"type":"SOLID"}]}` | `{"fontFamily":"Dosis","fontSize":48,"fontWeight":400}` |
| `2903:345` | `2903:360` | Market | `Market` | `{"strokeAlign":"OUTSIDE","strokeWeight":4,"strokes":[{"blendMode":"NORMAL","color":{"a":1,"b":0.9803921580314636,"g":0.9882352948188782,"r":0.9843137264251709},"type":"SOLID"}]}` | `{"fontFamily":"Dosis","fontSize":48,"fontWeight":400}` |
| `2903:345` | `2903:361` | Transactions | `Transactions` | `{"strokeAlign":"OUTSIDE","strokeWeight":4,"strokes":[{"blendMode":"NORMAL","color":{"a":1,"b":0.9803921580314636,"g":0.9882352948188782,"r":0.9843137264251709},"type":"SOLID"}]}` | `{"fontFamily":"Dosis","fontSize":48,"fontWeight":400}` |
| `2900:600` | `2900:614` | Revaştakiler | `Revaştakiler` | `{"strokeAlign":"OUTSIDE","strokeWeight":4,"strokes":[{"blendMode":"NORMAL","color":{"a":1,"b":0.9803921580314636,"g":0.9882352948188782,"r":0.9843137264251709},"type":"SOLID"}]}` | `{"fontFamily":"Dosis","fontSize":48,"fontWeight":400}` |
| `2900:600` | `2900:615` | Market | `Market` | `{"strokeAlign":"OUTSIDE","strokeWeight":4,"strokes":[{"blendMode":"NORMAL","color":{"a":1,"b":0.9803921580314636,"g":0.9882352948188782,"r":0.9843137264251709},"type":"SOLID"}]}` | `{"fontFamily":"Dosis","fontSize":48,"fontWeight":400}` |
| `2900:600` | `2900:616` | Transactions | `Transactions` | `{"strokeAlign":"OUTSIDE","strokeWeight":4,"strokes":[{"blendMode":"NORMAL","color":{"a":1,"b":0.9803921580314636,"g":0.9882352948188782,"r":0.9843137264251709},"type":"SOLID"}]}` | `{"fontFamily":"Dosis","fontSize":48,"fontWeight":400}` |
| `2904:826` | `2904:840` | Revaştakiler | `Revaştakiler` | `{"strokeAlign":"OUTSIDE","strokeWeight":4,"strokes":[{"blendMode":"NORMAL","color":{"a":1,"b":0.9803921580314636,"g":0.9882352948188782,"r":0.9843137264251709},"type":"SOLID"}]}` | `{"fontFamily":"Dosis","fontSize":48,"fontWeight":400}` |
| `2904:826` | `2904:841` | Market | `Market` | `{"strokeAlign":"OUTSIDE","strokeWeight":4,"strokes":[{"blendMode":"NORMAL","color":{"a":1,"b":0.9803921580314636,"g":0.9882352948188782,"r":0.9843137264251709},"type":"SOLID"}]}` | `{"fontFamily":"Dosis","fontSize":48,"fontWeight":400}` |
| `2904:826` | `2904:842` | Transactions | `Transactions` | `{"strokeAlign":"OUTSIDE","strokeWeight":4,"strokes":[{"blendMode":"NORMAL","color":{"a":1,"b":0.9803921580314636,"g":0.9882352948188782,"r":0.9843137264251709},"type":"SOLID"}]}` | `{"fontFamily":"Dosis","fontSize":48,"fontWeight":400}` |
