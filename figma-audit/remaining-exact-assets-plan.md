# Remaining Exact Figma Geometry Plan

Generated from `figma-audit/missing-exact-assets.json`.

- Total missing exact assets: `774`
- Frames with missing exact assets: `25`

## Safe command template

```bash
FIGMA_TOKEN=<figma-token> FIGMA_CHUNK_SIZE=1 FIGMA_MAX_RETRIES=2 FIGMA_RETRY_WAIT_MS=600000 FIGMA_MAX_WAIT_MS=900000 FIGMA_SKIP_RATE_LIMITED=1 npm run figma:refresh -- --ids=<comma-separated-frame-ids>
```

## Suggested batches

### Batch 1

```bash
FIGMA_TOKEN=<figma-token> \
FIGMA_CHUNK_SIZE=1 \
FIGMA_MAX_RETRIES=2 \
FIGMA_RETRY_WAIT_MS=600000 \
FIGMA_MAX_WAIT_MS=900000 \
FIGMA_SKIP_RATE_LIMITED=1 \
npm run figma:refresh -- --ids=2413:2181,2501:2814,2667:256,2671:1094
```

### Batch 2

```bash
FIGMA_TOKEN=<figma-token> \
FIGMA_CHUNK_SIZE=1 \
FIGMA_MAX_RETRIES=2 \
FIGMA_RETRY_WAIT_MS=600000 \
FIGMA_MAX_WAIT_MS=900000 \
FIGMA_SKIP_RATE_LIMITED=1 \
npm run figma:refresh -- --ids=2671:814,2873:4453,2900:600,2903:345
```

### Batch 3

```bash
FIGMA_TOKEN=<figma-token> \
FIGMA_CHUNK_SIZE=1 \
FIGMA_MAX_RETRIES=2 \
FIGMA_RETRY_WAIT_MS=600000 \
FIGMA_MAX_WAIT_MS=900000 \
FIGMA_SKIP_RATE_LIMITED=1 \
npm run figma:refresh -- --ids=2904:826,2977:1028,3099:1056,2580:197
```

### Batch 4

```bash
FIGMA_TOKEN=<figma-token> \
FIGMA_CHUNK_SIZE=1 \
FIGMA_MAX_RETRIES=2 \
FIGMA_RETRY_WAIT_MS=600000 \
FIGMA_MAX_WAIT_MS=900000 \
FIGMA_SKIP_RATE_LIMITED=1 \
npm run figma:refresh -- --ids=2395:169,2306:6,2569:149,2870:3749
```

### Batch 5

```bash
FIGMA_TOKEN=<figma-token> \
FIGMA_CHUNK_SIZE=1 \
FIGMA_MAX_RETRIES=2 \
FIGMA_RETRY_WAIT_MS=600000 \
FIGMA_MAX_WAIT_MS=900000 \
FIGMA_SKIP_RATE_LIMITED=1 \
npm run figma:refresh -- --ids=2870:4251,2921:712,2971:1324,2614:402
```

### Batch 6

```bash
FIGMA_TOKEN=<figma-token> \
FIGMA_CHUNK_SIZE=1 \
FIGMA_MAX_RETRIES=2 \
FIGMA_RETRY_WAIT_MS=600000 \
FIGMA_MAX_WAIT_MS=900000 \
FIGMA_SKIP_RATE_LIMITED=1 \
npm run figma:refresh -- --ids=2971:1618,2961:486,2961:886,2967:528
```

### Batch 7

```bash
FIGMA_TOKEN=<figma-token> \
FIGMA_CHUNK_SIZE=1 \
FIGMA_MAX_RETRIES=2 \
FIGMA_RETRY_WAIT_MS=600000 \
FIGMA_MAX_WAIT_MS=900000 \
FIGMA_SKIP_RATE_LIMITED=1 \
npm run figma:refresh -- --ids=2856:4578
```

## Frame order

| Frame ID | Missing exact assets | Frame name |
|---|---:|---|
| `2413:2181` | 3 | market |
| `2501:2814` | 4 | kullanıcı transferleri aç yerine tıkaldı |
| `2667:256` | 4 | herhangi bir yere tıkladı |
| `2671:1094` | 4 | ilk önce Bud tokenına ihtiyacın var |
| `2671:814` | 4 | tohum tümcecikleri kaydet |
| `2873:4453` | 4 | budlum.xyz |
| `2900:600` | 4 | Zaten bir cüzdanım vara tıkladı |
| `2903:345` | 4 | budlum.xyz ye giriş yaptı |
| `2904:826` | 4 | budlum.xyz ye giriş yaptı |
| `2977:1028` | 4 | tohum tümcecikleri kaydet |
| `3099:1056` | 4 | budlum.xyz |
| `2580:197` | 8 | tokens yazısına tıkladı |
| `2395:169` | 12 | budlum.xyz |
| `2306:6` | 13 | budlum.xyz |
| `2569:149` | 19 | depo |
| `2870:3749` | 24 | Bir kullanıcının cüzdanını arattı |
| `2870:4251` | 35 | cüzdan aratılıyken parıltı butonuna tıkladı |
| `2921:712` | 35 | token aratılıyken parıltı butonuna tıkladı |
| `2971:1324` | 39 | cüzdan aratılıyken parıltı butonuna tıkladı |
| `2614:402` | 52 | tokens yazısına tıkladı - pencere max bu kadar açılabilir |
| `2971:1618` | 55 | cüzdan aratılıyken parıltı butonuna tıkladı |
| `2961:486` | 59 | token aratılıyken parıltı butonuna tıkladı |
| `2961:886` | 59 | token aratılıyken parıltı butonuna tıkladı |
| `2967:528` | 59 | token aratılıyken parıltı butonuna tıkladı |
| `2856:4578` | 262 | budlum.xyz ye giriş yaptı |

Do not approximate vector nodes. If Figma still returns 429, leave these entries in audit and retry later.
