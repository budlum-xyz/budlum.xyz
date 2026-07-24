# Unsupported Figma Render Features

Generated without calling the Figma API. These are committed Figma features that the renderer does not yet render exactly.

- Total unsupported feature records: `268`

## By kind

| Kind | Count |
|---|---:|
| `textStrokeNotRendered` | 205 |
| `imageFiltersNotRendered` | 63 |

## By frame

| Frame ID | Count | Frame name |
|---|---:|---|
| `1:21110` | 135 | budlum.com |
| `1:182` | 61 | budlum.xyz |
| `2971:1618` | 9 | cüzdan aratılıyken parıltı butonuna tıkladı |
| `1:25545` | 6 | ekip |
| `2870:3749` | 6 | Bir kullanıcının cüzdanını arattı |
| `2870:4251` | 6 | cüzdan aratılıyken parıltı butonuna tıkladı |
| `2961:486` | 6 | token aratılıyken parıltı butonuna tıkladı |
| `2961:886` | 6 | token aratılıyken parıltı butonuna tıkladı |
| `2967:528` | 6 | token aratılıyken parıltı butonuna tıkladı |
| `2971:1324` | 6 | cüzdan aratılıyken parıltı butonuna tıkladı |
| `1:30` | 5 | budlum.xyz/go |
| `2900:600` | 3 | Zaten bir cüzdanım vara tıkladı |
| `2903:345` | 3 | budlum.xyz ye giriş yaptı |
| `2904:826` | 3 | budlum.xyz ye giriş yaptı |
| `2921:712` | 3 | token aratılıyken parıltı butonuna tıkladı |
| `2972:2406` | 3 | budlum.xyzde fareyle gezilirken |
| `2306:6` | 1 | budlum.xyz |

## Renderer contract

- These records are intentionally unsupported until an exact renderer exists.
- CSS filter approximations are not acceptable for Figma image filters.
- If exact support is implemented, remove the corresponding records from this audit in the same change.

Do not silently approximate these features. Implement exact support or keep them visible in this audit.
