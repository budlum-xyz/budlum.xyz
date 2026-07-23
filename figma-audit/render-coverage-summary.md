# Figma Render Coverage Summary

Generated without calling the Figma API. It audits committed frame JSON against the renderer contract.

## Aggregate

- Frames: `39`
- Total nodes: `15530`
- Exact VECTOR geometry nodes rendered from Figma paths: `52`
- Exact RECTANGLE/ELLIPSE leaf geometry nodes rendered from Figma paths: `1477`
- VECTOR-like nodes skipped because exact geometry is missing: `774`
- Missing exact asset audit entries: `774`
- Text nodes: `1241`
- Image-fill nodes: `3896`
- CSS primitive/container nodes: `8085`

## Frames with missing exact geometry

| Frame ID | Missing audit entries | Skipped geometry nodes | Frame name |
|---|---:|---:|---|
| `2580:197` | 8 | 8 | tokens yazısına tıkladı |
| `2614:402` | 52 | 52 | tokens yazısına tıkladı - pencere max bu kadar açılabilir |
| `2856:4578` | 262 | 262 | budlum.xyz ye giriş yaptı |
| `2870:4251` | 35 | 35 | cüzdan aratılıyken parıltı butonuna tıkladı |
| `2971:1324` | 39 | 39 | cüzdan aratılıyken parıltı butonuna tıkladı |
| `2971:1618` | 55 | 55 | cüzdan aratılıyken parıltı butonuna tıkladı |
| `2921:712` | 35 | 35 | token aratılıyken parıltı butonuna tıkladı |
| `2967:528` | 59 | 59 | token aratılıyken parıltı butonuna tıkladı |
| `2961:886` | 59 | 59 | token aratılıyken parıltı butonuna tıkladı |
| `2961:486` | 59 | 59 | token aratılıyken parıltı butonuna tıkladı |
| `2870:3749` | 24 | 24 | Bir kullanıcının cüzdanını arattı |
| `2667:256` | 4 | 4 | herhangi bir yere tıkladı |
| `2671:814` | 4 | 4 | tohum tümcecikleri kaydet |
| `2977:1028` | 4 | 4 | tohum tümcecikleri kaydet |
| `2671:1094` | 4 | 4 | ilk önce Bud tokenına ihtiyacın var |
| `2395:169` | 12 | 12 | budlum.xyz |
| `2501:2814` | 4 | 4 | kullanıcı transferleri aç yerine tıkaldı |
| `2413:2181` | 3 | 3 | market |
| `2306:6` | 13 | 13 | budlum.xyz |
| `2569:149` | 19 | 19 | depo |
| `2873:4453` | 4 | 4 | budlum.xyz |
| `3099:1056` | 4 | 4 | budlum.xyz |
| `2903:345` | 4 | 4 | budlum.xyz ye giriş yaptı |
| `2900:600` | 4 | 4 | Zaten bir cüzdanım vara tıkladı |
| `2904:826` | 4 | 4 | budlum.xyz ye giriş yaptı |

Do not approximate skipped geometry nodes. Refresh those frames with `npm run figma:refresh` after Figma rate limits cool down.
