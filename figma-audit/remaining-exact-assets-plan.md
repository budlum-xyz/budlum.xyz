# Remaining Exact Figma Geometry Plan

Generated from `figma-audit/missing-exact-assets.json`.

- Total missing exact assets: `548`
- Frames with missing exact assets: `19`

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
npm run figma:refresh -- --ids=2921:712,2667:256,2671:1094,2671:814
```

### Batch 2

```bash
FIGMA_TOKEN=<figma-token> \
FIGMA_CHUNK_SIZE=1 \
FIGMA_MAX_RETRIES=2 \
FIGMA_RETRY_WAIT_MS=600000 \
FIGMA_MAX_WAIT_MS=900000 \
FIGMA_SKIP_RATE_LIMITED=1 \
npm run figma:refresh -- --ids=2900:600,2903:345,2904:826,2977:1028
```

### Batch 3

```bash
FIGMA_TOKEN=<figma-token> \
FIGMA_CHUNK_SIZE=1 \
FIGMA_MAX_RETRIES=2 \
FIGMA_RETRY_WAIT_MS=600000 \
FIGMA_MAX_WAIT_MS=900000 \
FIGMA_SKIP_RATE_LIMITED=1 \
npm run figma:refresh -- --ids=2569:149,2580:197,2870:3749,2870:4251
```

### Batch 4

```bash
FIGMA_TOKEN=<figma-token> \
FIGMA_CHUNK_SIZE=1 \
FIGMA_MAX_RETRIES=2 \
FIGMA_RETRY_WAIT_MS=600000 \
FIGMA_MAX_WAIT_MS=900000 \
FIGMA_SKIP_RATE_LIMITED=1 \
npm run figma:refresh -- --ids=2971:1324,2961:486,2961:886,2967:528
```

### Batch 5

```bash
FIGMA_TOKEN=<figma-token> \
FIGMA_CHUNK_SIZE=1 \
FIGMA_MAX_RETRIES=2 \
FIGMA_RETRY_WAIT_MS=600000 \
FIGMA_MAX_WAIT_MS=900000 \
FIGMA_SKIP_RATE_LIMITED=1 \
npm run figma:refresh -- --ids=2971:1618,2614:402,2856:4578
```

## Frame order

| Frame ID | Missing exact assets | Frame name |
|---|---:|---|
| `2921:712` | 2 | token aratılıyken parıltı butonuna tıkladı |
| `2667:256` | 4 | herhangi bir yere tıkladı |
| `2671:1094` | 4 | ilk önce Bud tokenına ihtiyacın var |
| `2671:814` | 4 | tohum tümcecikleri kaydet |
| `2900:600` | 4 | Zaten bir cüzdanım vara tıkladı |
| `2903:345` | 4 | budlum.xyz ye giriş yaptı |
| `2904:826` | 4 | budlum.xyz ye giriş yaptı |
| `2977:1028` | 4 | tohum tümcecikleri kaydet |
| `2569:149` | 6 | depo |
| `2580:197` | 8 | tokens yazısına tıkladı |
| `2870:3749` | 24 | Bir kullanıcının cüzdanını arattı |
| `2870:4251` | 24 | cüzdan aratılıyken parıltı butonuna tıkladı |
| `2971:1324` | 24 | cüzdan aratılıyken parıltı butonuna tıkladı |
| `2961:486` | 26 | token aratılıyken parıltı butonuna tıkladı |
| `2961:886` | 26 | token aratılıyken parıltı butonuna tıkladı |
| `2967:528` | 26 | token aratılıyken parıltı butonuna tıkladı |
| `2971:1618` | 40 | cüzdan aratılıyken parıltı butonuna tıkladı |
| `2614:402` | 52 | tokens yazısına tıkladı - pencere max bu kadar açılabilir |
| `2856:4578` | 262 | budlum.xyz ye giriş yaptı |

Do not approximate vector nodes. If Figma still returns 429, leave these entries in audit and retry later.
