# Figma Image Filter Exactness Review

Generated from `figma-audit/unsupported-render-features.json` without calling the Figma API.

- Status: `not-rendered-exactness-blocked`
- Unsupported image filter records: `25`
- Unique filter sets: `2`
- Affected frames: `8`
- Unique affected image refs: `2`
- Official API reference: https://developers.figma.com/docs/plugins/api/Paint/#imagefilters

## Exactness decision

Figma exposes `ImagePaint.filters` values, but the committed Figma/OpenFig data does not provide a documented pixel-equivalent transfer function. CSS `brightness()`, `contrast()`, `saturate()`, or similar mappings are therefore treated as approximations and are forbidden until proven exact.

Current renderer behavior: ignore these filters and keep the affected nodes visible in `unsupported-render-features` audit. `scripts/verify-figma-data.mjs` enforces this by failing if renderer code starts processing image filters while this unsupported audit is still populated.

## Unique filter sets

| Count | Filters | Frames |
|---:|---|---|
| 24 | `{"exposure":-1}` | `2870:3749` (3), `2870:4251` (3), `2961:486` (3), `2961:886` (3), `2967:528` (3), `2971:1324` (3), `2971:1618` (6) |
| 1 | `{"contrast":-0.03999999910593033,"exposure":-1}` | `2306:6` (1) |

## Affected nodes

| Frame ID | Node ID | Type | Name | Filters | Image refs | Local assets |
|---|---|---|---|---|---|---|
| `2870:4251` | `2971:1215` | `RECTANGLE` | 1000102403 3 | `{"exposure":-1}` | `17f1b31a42b5866c1667526ca3d2211d68cb7e69` | `/figma-assets/17f1b31a42b5866c1667526ca3d2211d68cb7e69.png` |
| `2870:4251` | `2971:1240` | `RECTANGLE` | 1000102403 4 | `{"exposure":-1}` | `17f1b31a42b5866c1667526ca3d2211d68cb7e69` | `/figma-assets/17f1b31a42b5866c1667526ca3d2211d68cb7e69.png` |
| `2870:4251` | `2971:1241` | `RECTANGLE` | 1000102403 5 | `{"exposure":-1}` | `17f1b31a42b5866c1667526ca3d2211d68cb7e69` | `/figma-assets/17f1b31a42b5866c1667526ca3d2211d68cb7e69.png` |
| `2971:1324` | `2971:1475` | `RECTANGLE` | 1000102403 3 | `{"exposure":-1}` | `17f1b31a42b5866c1667526ca3d2211d68cb7e69` | `/figma-assets/17f1b31a42b5866c1667526ca3d2211d68cb7e69.png` |
| `2971:1324` | `2971:1500` | `RECTANGLE` | 1000102403 4 | `{"exposure":-1}` | `17f1b31a42b5866c1667526ca3d2211d68cb7e69` | `/figma-assets/17f1b31a42b5866c1667526ca3d2211d68cb7e69.png` |
| `2971:1324` | `2971:1501` | `RECTANGLE` | 1000102403 5 | `{"exposure":-1}` | `17f1b31a42b5866c1667526ca3d2211d68cb7e69` | `/figma-assets/17f1b31a42b5866c1667526ca3d2211d68cb7e69.png` |
| `2971:1618` | `2971:1777` | `RECTANGLE` | 1000102403 3 | `{"exposure":-1}` | `17f1b31a42b5866c1667526ca3d2211d68cb7e69` | `/figma-assets/17f1b31a42b5866c1667526ca3d2211d68cb7e69.png` |
| `2971:1618` | `2971:1802` | `RECTANGLE` | 1000102403 4 | `{"exposure":-1}` | `17f1b31a42b5866c1667526ca3d2211d68cb7e69` | `/figma-assets/17f1b31a42b5866c1667526ca3d2211d68cb7e69.png` |
| `2971:1618` | `2971:1803` | `RECTANGLE` | 1000102403 5 | `{"exposure":-1}` | `17f1b31a42b5866c1667526ca3d2211d68cb7e69` | `/figma-assets/17f1b31a42b5866c1667526ca3d2211d68cb7e69.png` |
| `2971:1618` | `2971:1943` | `RECTANGLE` | 1000102403 3 | `{"exposure":-1}` | `17f1b31a42b5866c1667526ca3d2211d68cb7e69` | `/figma-assets/17f1b31a42b5866c1667526ca3d2211d68cb7e69.png` |
| `2971:1618` | `2971:1968` | `RECTANGLE` | 1000102403 4 | `{"exposure":-1}` | `17f1b31a42b5866c1667526ca3d2211d68cb7e69` | `/figma-assets/17f1b31a42b5866c1667526ca3d2211d68cb7e69.png` |
| `2971:1618` | `2971:1969` | `RECTANGLE` | 1000102403 5 | `{"exposure":-1}` | `17f1b31a42b5866c1667526ca3d2211d68cb7e69` | `/figma-assets/17f1b31a42b5866c1667526ca3d2211d68cb7e69.png` |
| `2967:528` | `2967:989` | `RECTANGLE` | 1000102403 3 | `{"exposure":-1}` | `17f1b31a42b5866c1667526ca3d2211d68cb7e69` | `/figma-assets/17f1b31a42b5866c1667526ca3d2211d68cb7e69.png` |
| `2967:528` | `2967:1014` | `RECTANGLE` | 1000102403 4 | `{"exposure":-1}` | `17f1b31a42b5866c1667526ca3d2211d68cb7e69` | `/figma-assets/17f1b31a42b5866c1667526ca3d2211d68cb7e69.png` |
| `2967:528` | `2967:1015` | `RECTANGLE` | 1000102403 5 | `{"exposure":-1}` | `17f1b31a42b5866c1667526ca3d2211d68cb7e69` | `/figma-assets/17f1b31a42b5866c1667526ca3d2211d68cb7e69.png` |
| `2961:886` | `2961:1175` | `RECTANGLE` | 1000102403 3 | `{"exposure":-1}` | `17f1b31a42b5866c1667526ca3d2211d68cb7e69` | `/figma-assets/17f1b31a42b5866c1667526ca3d2211d68cb7e69.png` |
| `2961:886` | `2961:1200` | `RECTANGLE` | 1000102403 4 | `{"exposure":-1}` | `17f1b31a42b5866c1667526ca3d2211d68cb7e69` | `/figma-assets/17f1b31a42b5866c1667526ca3d2211d68cb7e69.png` |
| `2961:886` | `2961:1201` | `RECTANGLE` | 1000102403 5 | `{"exposure":-1}` | `17f1b31a42b5866c1667526ca3d2211d68cb7e69` | `/figma-assets/17f1b31a42b5866c1667526ca3d2211d68cb7e69.png` |
| `2961:486` | `2961:772` | `RECTANGLE` | 1000102403 3 | `{"exposure":-1}` | `17f1b31a42b5866c1667526ca3d2211d68cb7e69` | `/figma-assets/17f1b31a42b5866c1667526ca3d2211d68cb7e69.png` |
| `2961:486` | `2961:797` | `RECTANGLE` | 1000102403 4 | `{"exposure":-1}` | `17f1b31a42b5866c1667526ca3d2211d68cb7e69` | `/figma-assets/17f1b31a42b5866c1667526ca3d2211d68cb7e69.png` |
| `2961:486` | `2961:798` | `RECTANGLE` | 1000102403 5 | `{"exposure":-1}` | `17f1b31a42b5866c1667526ca3d2211d68cb7e69` | `/figma-assets/17f1b31a42b5866c1667526ca3d2211d68cb7e69.png` |
| `2870:3749` | `2870:4132` | `RECTANGLE` | 1000102403 3 | `{"exposure":-1}` | `17f1b31a42b5866c1667526ca3d2211d68cb7e69` | `/figma-assets/17f1b31a42b5866c1667526ca3d2211d68cb7e69.png` |
| `2870:3749` | `2870:4157` | `RECTANGLE` | 1000102403 4 | `{"exposure":-1}` | `17f1b31a42b5866c1667526ca3d2211d68cb7e69` | `/figma-assets/17f1b31a42b5866c1667526ca3d2211d68cb7e69.png` |
| `2870:3749` | `2870:4158` | `RECTANGLE` | 1000102403 5 | `{"exposure":-1}` | `17f1b31a42b5866c1667526ca3d2211d68cb7e69` | `/figma-assets/17f1b31a42b5866c1667526ca3d2211d68cb7e69.png` |
| `2306:6` | `2306:6` | `FRAME` | budlum.xyz | `{"contrast":-0.03999999910593033,"exposure":-1}` | `18832c17d8d083d348ef11b50b21bdaf708d7ed3` | `/figma-assets/18832c17d8d083d348ef11b50b21bdaf708d7ed3.png` |
