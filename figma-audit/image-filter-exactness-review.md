# Figma Image Filter Exactness Review

Generated from `figma-audit/unsupported-render-features.json` without calling the Figma API.

- Status: `not-rendered-exactness-blocked`
- Unsupported image filter records: `63`
- Unique filter sets: `5`
- Affected frames: `12`
- Unique affected image refs: `7`
- Official API reference: https://developers.figma.com/docs/plugins/api/Paint/#imagefilters

## Exactness decision

Figma exposes `ImagePaint.filters` values, but the committed Figma/OpenFig data does not provide a documented pixel-equivalent transfer function. CSS `brightness()`, `contrast()`, `saturate()`, or similar mappings are therefore treated as approximations and are forbidden until proven exact.

Current renderer behavior: ignore these filters and keep the affected nodes visible in `unsupported-render-features` audit. `scripts/verify-figma-data.mjs` enforces this by failing if renderer code starts processing image filters while this unsupported audit is still populated.

## Unique filter sets

| Count | Filters | Frames |
|---:|---|---|
| 53 | `{"exposure":-1}` | `1:182` (24), `1:30` (5), `2870:3749` (3), `2870:4251` (3), `2961:486` (3), `2961:886` (3), `2967:528` (3), `2971:1324` (3), `2971:1618` (6) |
| 2 | `{"contrast":-0.03999999910593033,"exposure":-1}` | `1:182` (1), `2306:6` (1) |
| 6 | `{"saturation":-1}` | `1:21110` (6) |
| 1 | `{"exposure":0.05999999865889549,"highlights":0.2199999988079071,"shadows":0.2199999988079071}` | `1:25545` (1) |
| 1 | `{"highlights":-1}` | `1:25545` (1) |

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
| `1:30` | `1:155` | `RECTANGLE` | 1000102403 6 | `{"exposure":-1}` | `17f1b31a42b5866c1667526ca3d2211d68cb7e69` | `/figma-assets/17f1b31a42b5866c1667526ca3d2211d68cb7e69.png` |
| `1:30` | `1:156` | `RECTANGLE` | 1000102403 7 | `{"exposure":-1}` | `17f1b31a42b5866c1667526ca3d2211d68cb7e69` | `/figma-assets/17f1b31a42b5866c1667526ca3d2211d68cb7e69.png` |
| `1:30` | `1:173` | `RECTANGLE` | 1000102403 6 | `{"exposure":-1}` | `17f1b31a42b5866c1667526ca3d2211d68cb7e69` | `/figma-assets/17f1b31a42b5866c1667526ca3d2211d68cb7e69.png` |
| `1:30` | `1:174` | `RECTANGLE` | 1000102403 7 | `{"exposure":-1}` | `17f1b31a42b5866c1667526ca3d2211d68cb7e69` | `/figma-assets/17f1b31a42b5866c1667526ca3d2211d68cb7e69.png` |
| `1:30` | `1:181` | `RECTANGLE` | 1000102403 6 | `{"exposure":-1}` | `17f1b31a42b5866c1667526ca3d2211d68cb7e69` | `/figma-assets/17f1b31a42b5866c1667526ca3d2211d68cb7e69.png` |
| `1:182` | `1:3843` | `RECTANGLE` | 1000102403 3 | `{"exposure":-1}` | `17f1b31a42b5866c1667526ca3d2211d68cb7e69` | `/figma-assets/17f1b31a42b5866c1667526ca3d2211d68cb7e69.png` |
| `1:182` | `1:3868` | `RECTANGLE` | 1000102403 4 | `{"exposure":-1}` | `17f1b31a42b5866c1667526ca3d2211d68cb7e69` | `/figma-assets/17f1b31a42b5866c1667526ca3d2211d68cb7e69.png` |
| `1:182` | `1:3869` | `RECTANGLE` | 1000102403 5 | `{"exposure":-1}` | `17f1b31a42b5866c1667526ca3d2211d68cb7e69` | `/figma-assets/17f1b31a42b5866c1667526ca3d2211d68cb7e69.png` |
| `1:182` | `1:4120` | `RECTANGLE` | 1000102403 3 | `{"exposure":-1}` | `17f1b31a42b5866c1667526ca3d2211d68cb7e69` | `/figma-assets/17f1b31a42b5866c1667526ca3d2211d68cb7e69.png` |
| `1:182` | `1:4145` | `RECTANGLE` | 1000102403 4 | `{"exposure":-1}` | `17f1b31a42b5866c1667526ca3d2211d68cb7e69` | `/figma-assets/17f1b31a42b5866c1667526ca3d2211d68cb7e69.png` |
| `1:182` | `1:4146` | `RECTANGLE` | 1000102403 5 | `{"exposure":-1}` | `17f1b31a42b5866c1667526ca3d2211d68cb7e69` | `/figma-assets/17f1b31a42b5866c1667526ca3d2211d68cb7e69.png` |
| `1:182` | `1:4315` | `RECTANGLE` | 1000102403 3 | `{"exposure":-1}` | `17f1b31a42b5866c1667526ca3d2211d68cb7e69` | `/figma-assets/17f1b31a42b5866c1667526ca3d2211d68cb7e69.png` |
| `1:182` | `1:4340` | `RECTANGLE` | 1000102403 4 | `{"exposure":-1}` | `17f1b31a42b5866c1667526ca3d2211d68cb7e69` | `/figma-assets/17f1b31a42b5866c1667526ca3d2211d68cb7e69.png` |
| `1:182` | `1:4341` | `RECTANGLE` | 1000102403 5 | `{"exposure":-1}` | `17f1b31a42b5866c1667526ca3d2211d68cb7e69` | `/figma-assets/17f1b31a42b5866c1667526ca3d2211d68cb7e69.png` |
| `1:182` | `1:4446` | `RECTANGLE` | 1000102403 3 | `{"exposure":-1}` | `17f1b31a42b5866c1667526ca3d2211d68cb7e69` | `/figma-assets/17f1b31a42b5866c1667526ca3d2211d68cb7e69.png` |
| `1:182` | `1:4471` | `RECTANGLE` | 1000102403 4 | `{"exposure":-1}` | `17f1b31a42b5866c1667526ca3d2211d68cb7e69` | `/figma-assets/17f1b31a42b5866c1667526ca3d2211d68cb7e69.png` |
| `1:182` | `1:4472` | `RECTANGLE` | 1000102403 5 | `{"exposure":-1}` | `17f1b31a42b5866c1667526ca3d2211d68cb7e69` | `/figma-assets/17f1b31a42b5866c1667526ca3d2211d68cb7e69.png` |
| `1:182` | `1:4969` | `RECTANGLE` | 1000102403 3 | `{"exposure":-1}` | `17f1b31a42b5866c1667526ca3d2211d68cb7e69` | `/figma-assets/17f1b31a42b5866c1667526ca3d2211d68cb7e69.png` |
| `1:182` | `1:4994` | `RECTANGLE` | 1000102403 4 | `{"exposure":-1}` | `17f1b31a42b5866c1667526ca3d2211d68cb7e69` | `/figma-assets/17f1b31a42b5866c1667526ca3d2211d68cb7e69.png` |
| `1:182` | `1:4995` | `RECTANGLE` | 1000102403 5 | `{"exposure":-1}` | `17f1b31a42b5866c1667526ca3d2211d68cb7e69` | `/figma-assets/17f1b31a42b5866c1667526ca3d2211d68cb7e69.png` |
| `1:182` | `1:5325` | `RECTANGLE` | 1000102403 3 | `{"exposure":-1}` | `17f1b31a42b5866c1667526ca3d2211d68cb7e69` | `/figma-assets/17f1b31a42b5866c1667526ca3d2211d68cb7e69.png` |
| `1:182` | `1:5350` | `RECTANGLE` | 1000102403 4 | `{"exposure":-1}` | `17f1b31a42b5866c1667526ca3d2211d68cb7e69` | `/figma-assets/17f1b31a42b5866c1667526ca3d2211d68cb7e69.png` |
| `1:182` | `1:5351` | `RECTANGLE` | 1000102403 5 | `{"exposure":-1}` | `17f1b31a42b5866c1667526ca3d2211d68cb7e69` | `/figma-assets/17f1b31a42b5866c1667526ca3d2211d68cb7e69.png` |
| `1:182` | `1:5700` | `RECTANGLE` | 1000102403 3 | `{"exposure":-1}` | `17f1b31a42b5866c1667526ca3d2211d68cb7e69` | `/figma-assets/17f1b31a42b5866c1667526ca3d2211d68cb7e69.png` |
| `1:182` | `1:5725` | `RECTANGLE` | 1000102403 4 | `{"exposure":-1}` | `17f1b31a42b5866c1667526ca3d2211d68cb7e69` | `/figma-assets/17f1b31a42b5866c1667526ca3d2211d68cb7e69.png` |
| `1:182` | `1:5726` | `RECTANGLE` | 1000102403 5 | `{"exposure":-1}` | `17f1b31a42b5866c1667526ca3d2211d68cb7e69` | `/figma-assets/17f1b31a42b5866c1667526ca3d2211d68cb7e69.png` |
| `1:182` | `1:5959` | `RECTANGLE` | 1000102403 3 | `{"exposure":-1}` | `17f1b31a42b5866c1667526ca3d2211d68cb7e69` | `/figma-assets/17f1b31a42b5866c1667526ca3d2211d68cb7e69.png` |
| `1:182` | `1:5984` | `RECTANGLE` | 1000102403 4 | `{"exposure":-1}` | `17f1b31a42b5866c1667526ca3d2211d68cb7e69` | `/figma-assets/17f1b31a42b5866c1667526ca3d2211d68cb7e69.png` |
| `1:182` | `1:5985` | `RECTANGLE` | 1000102403 5 | `{"exposure":-1}` | `17f1b31a42b5866c1667526ca3d2211d68cb7e69` | `/figma-assets/17f1b31a42b5866c1667526ca3d2211d68cb7e69.png` |
| `1:182` | `1:9400` | `FRAME` | budlum.xyz | `{"contrast":-0.03999999910593033,"exposure":-1}` | `18832c17d8d083d348ef11b50b21bdaf708d7ed3` | `/figma-assets/18832c17d8d083d348ef11b50b21bdaf708d7ed3.png` |
| `1:21110` | `1:22541` | `RECTANGLE` | Rectangle 306 | `{"saturation":-1}` | `feee03c9e3a90bda1bbbfcf3b97049f7e55974b3` | `/figma-assets/feee03c9e3a90bda1bbbfcf3b97049f7e55974b3.png` |
| `1:21110` | `1:22544` | `RECTANGLE` | Rectangle 298 | `{"saturation":-1}` | `f11a696b5b6a5e24f7abe5b0d08bc624512462f4` | `/figma-assets/f11a696b5b6a5e24f7abe5b0d08bc624512462f4.jpg` |
| `1:21110` | `1:23636` | `RECTANGLE` | image 6 | `{"saturation":-1}` | `c61117319de29897447fc326835729a85c45b890` | `/figma-assets/c61117319de29897447fc326835729a85c45b890.png` |
| `1:21110` | `1:23637` | `RECTANGLE` | Rectangle 602 | `{"saturation":-1}` | `f11a696b5b6a5e24f7abe5b0d08bc624512462f4` | `/figma-assets/f11a696b5b6a5e24f7abe5b0d08bc624512462f4.jpg` |
| `1:21110` | `1:23799` | `RECTANGLE` | Rectangle 304 | `{"saturation":-1}` | `feee03c9e3a90bda1bbbfcf3b97049f7e55974b3` | `/figma-assets/feee03c9e3a90bda1bbbfcf3b97049f7e55974b3.png` |
| `1:21110` | `1:23802` | `RECTANGLE` | Rectangle 298 | `{"saturation":-1}` | `f11a696b5b6a5e24f7abe5b0d08bc624512462f4` | `/figma-assets/f11a696b5b6a5e24f7abe5b0d08bc624512462f4.jpg` |
| `1:25545` | `1:25614` | `ELLIPSE` | Profil | `{"exposure":0.05999999865889549,"highlights":0.2199999988079071,"shadows":0.2199999988079071}` | `ea70dfac214172e53757f02b7879606efc22933e` | `/figma-assets/ea70dfac214172e53757f02b7879606efc22933e.jpg` |
| `1:25545` | `1:25637` | `RECTANGLE` | 1000097432 1 | `{"highlights":-1}` | `adc93e7132139144e00f31d7cec5109a3e267f3c` | `/figma-assets/adc93e7132139144e00f31d7cec5109a3e267f3c.png` |
