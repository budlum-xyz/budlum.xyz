# Figma Rate Limit Playbook — Arena AI Collaborators

## Current rule

Do not guess UI values. All frontend/Figma work must use the Figma file as the source of truth.

- No approximate colors, spacing, typography, icons, layouts, states, or interactions.
- If exact Figma data is not available, record it in audit instead of inventing it.
- Do not commit, print, or store Figma/GitHub tokens in repo files, logs, README, PR bodies, or issues.
- Tokens must be passed only through environment variables.


## Latest live API status — 2026-07-24

A live refresh was attempted from Arena on 2026-07-24 for the next safe exact-geometry batch:

```txt
2413:2181, 2501:2814, 2667:256, 2671:1094
```

Result: both the current Figma source route and the backup Figma workspace route returned `429 Rate limit exceeded` with a low-tier `Retry-After` window of roughly `366k` seconds (`~4.2` days). No frame JSON, runtime JSON, or audit files were rewritten by the refresh command.

Action for all collaborators: do not keep retrying or leave an Arena instance sleeping for days. Resume live Figma refresh only after the cooldown expires or when a non-rate-limited token/workspace is explicitly provided. Until then, use committed JSON only for non-live checks and keep missing exact geometry in audit; do not approximate vectors.

See `figma-audit/live-rate-limit-status.json` for the sanitized machine-readable status.

## Current status

The Wallet frame/state scope has been merged into `main`.

Merged scope:

- `2223:54` — `kullanıcı bir cüzdanı açtı`
- `2446:824` — `kullanıcı boş bir cüzdanı açtı`
- `2377:22` — `kullanıcı kendi cüzdanını açtı`
- `2901:266`
- `2901:704`
- `2902:961`
- `2907:1281`
- `2972:3658`
- `2972:3858`
- `2972:4204`

Wallet audit summary:

- Wallet frames reviewed: `10`
- Wallet nodes reviewed: `3224`
- Geometry nodes fetched from Figma API: `2408`
- Exact VECTOR geometry nodes rendered from Figma paths: `48`
- Wallet-scope missing exact vector assets: `0`
- Prototype interactions found in the checked Wallet JSON: `0`
- Variant records found in the checked Wallet JSON: `0`

## Why rate limits are happening

Figma API returns:

```txt
429 Rate limit exceeded
```

This is especially likely when using:

```txt
geometry=paths
```

Large frames with many vector/path nodes are expensive. Multiple Arena instances or agents hitting the same Figma file at the same time will exhaust the limit quickly.

## Coordination rule for multiple AIs

Only one AI/instance should run live Figma refresh commands at a time.

Other AIs should use the committed JSON files unless they are explicitly assigned to refresh a specific frame.

Live refresh work should be serialized:

1. Pick a small set of frame IDs.
2. Run the refresh command with chunk size `1`.
3. Commit successful output.
4. Let the limit cool down before the next batch.

## Safe refresh script

Use the script already in the repo:

```bash
npm run figma:refresh -- --ids=<comma-separated-frame-ids>
```

The script reads the token only from `FIGMA_TOKEN`.

Example with placeholders only:

```bash
FIGMA_TOKEN=<figma-token> \
FIGMA_CHUNK_SIZE=1 \
FIGMA_MAX_RETRIES=8 \
FIGMA_RETRY_WAIT_MS=600000 \
FIGMA_SKIP_RATE_LIMITED=1 \
npm run figma:refresh -- --ids=2921:712,2569:149,2580:197,2667:256
```

Meaning:

- `FIGMA_CHUNK_SIZE=1`: fetch one frame per request.
- `FIGMA_MAX_RETRIES=8`: retry more times before giving up.
- `FIGMA_RETRY_WAIT_MS=600000`: wait 10 minutes between retries when Figma does not provide `Retry-After`.
- `FIGMA_SKIP_RATE_LIMITED=1`: if a chunk is still rate-limited after retries, skip it and continue with later chunks.

## Recommended order for remaining exact vector refresh

Do **not** start with the largest frame. Start with smaller frames so useful progress can be committed before the rate limit is exhausted.

Remaining missing exact vector frames from `figma-audit/missing-exact-assets.json` at the time of this note:

```txt
2921:712   token aratılıyken parıltı butonuna tıkladı
2569:149   depo
2580:197   tokens yazısına tıkladı
2667:256   herhangi bir yere tıkladı
2671:1094  ilk önce Bud tokenına ihtiyacın var
2671:814   tohum tümcecikleri kaydet
2900:600   Zaten bir cüzdanım vara tıkladı
2903:345   budlum.xyz ye giriş yaptı
2904:826   budlum.xyz ye giriş yaptı
2977:1028  tohum tümcecikleri kaydet
2870:3749  Bir kullanıcının cüzdanını arattı
2870:4251  cüzdan aratılıyken parıltı butonuna tıkladı
2971:1324  cüzdan aratılıyken parıltı butonuna tıkladı
2961:486   token aratılıyken parıltı butonuna tıkladı
2961:886   token aratılıyken parıltı butonuna tıkladı
2967:528   token aratılıyken parıltı butonuna tıkladı
2971:1618  cüzdan aratılıyken parıltı butonuna tıkladı
2614:402   tokens yazısına tıkladı - pencere max bu kadar açılabilir
2856:4578  budlum.xyz ye giriş yaptı
```

Suggested first batch after cooldown:

```bash
FIGMA_TOKEN=<figma-token> \
FIGMA_CHUNK_SIZE=1 \
FIGMA_MAX_RETRIES=8 \
FIGMA_RETRY_WAIT_MS=600000 \
FIGMA_SKIP_RATE_LIMITED=1 \
npm run figma:refresh -- --ids=2921:712,2569:149,2580:197,2667:256
```

Suggested second batch:

```bash
FIGMA_TOKEN=<figma-token> \
FIGMA_CHUNK_SIZE=1 \
FIGMA_MAX_RETRIES=8 \
FIGMA_RETRY_WAIT_MS=600000 \
FIGMA_SKIP_RATE_LIMITED=1 \
npm run figma:refresh -- --ids=2671:1094,2671:814,2900:600,2903:345,2904:826,2977:1028
```

Leave the largest frames for later:

```txt
2614:402
2856:4578
```

## After each successful refresh

Run:

```bash
npm run build
```

Then inspect:

```bash
git status --short
```

Expected changed files may include:

- `figma-nodes/<frame>.json`
- `public/figma-frames/<frame>.json`
- `figma-audit/missing-exact-assets.json`
- `figma-audit/live-geometry-refresh-summary.json`
- `figma-audit/live-geometry-resolved-vector-nodes.json`

Commit successful progress in small batches.

## If 429 continues

If even one small frame returns `429` after several retries:

1. Stop all live Figma refresh jobs across all Arena instances.
2. Wait at least 30–60 minutes.
3. Retry a single small frame with `FIGMA_CHUNK_SIZE=1`.
4. If it still fails, wait longer or use a different authorized Figma token.

Do not work around this by approximating SVG/vector nodes.




## Printing the next safe refresh batch

To avoid manually copying stale frame lists, print the next generated batch with:

```bash
npm run figma:next
```

Print a later batch with:

```bash
npm run figma:next -- --batch=2
```

This command does not call Figma and does not need a token. It only reads `figma-audit/remaining-exact-assets-plan.json`.



Run all non-Figma-API audit checks with one command:

```bash
npm run figma:doctor
```

Track unsupported non-geometry render features without calling Figma:

```bash
npm run figma:unsupported
npm run figma:unsupported:check
```

This writes/checks:

- `figma-audit/unsupported-render-features.json`
- `figma-audit/unsupported-render-features.md`

## Syncing committed missing-geometry audit

If renderer coverage finds VECTOR-like nodes without exact path geometry that are not yet listed in `figma-audit/missing-exact-assets.json`, sync the audit without calling Figma:

```bash
npm run figma:sync-missing
npm run figma:coverage
npm run figma:plan
npm run figma:verify
```

This keeps the renderer contract honest: missing geometry stays visible in audit instead of being approximated.

`npm run figma:coverage` writes:

- `figma-audit/render-coverage-summary.json`
- `figma-audit/render-coverage-summary.md`

## Regenerating the remaining-frame plan

When `figma-audit/missing-exact-assets.json` changes, regenerate the recommended refresh order with:

```bash
npm run figma:plan
```

This writes:

- `figma-audit/remaining-exact-assets-plan.json`
- `figma-audit/remaining-exact-assets-plan.md`

The plan sorts frames from smallest missing exact asset count to largest so agents can make progress before the Figma limit is exhausted.

## Important security rule

Never write real tokens into this file or any other repo file.

Use only:

```bash
FIGMA_TOKEN=<figma-token>
GITHUB_TOKEN=<github-token>
```

as shell environment variables at runtime.

## Long `Retry-After` responses

A later retry showed Figma can return a very large `Retry-After` window. In one observed case Figma requested roughly `4.3` days before retrying.

Do not leave Arena instances sleeping for days.

The refresh script now supports:

```bash
FIGMA_MAX_WAIT_MS=900000
```

Default: `900000` ms, i.e. 15 minutes.

If Figma asks for a wait longer than `FIGMA_MAX_WAIT_MS` and `FIGMA_SKIP_RATE_LIMITED=1` is set, the script skips that chunk instead of sleeping indefinitely. Re-run later after the limit window cools down.

Recommended safe command:

```bash
FIGMA_TOKEN=<figma-token> \
FIGMA_CHUNK_SIZE=1 \
FIGMA_MAX_RETRIES=2 \
FIGMA_RETRY_WAIT_MS=600000 \
FIGMA_MAX_WAIT_MS=900000 \
FIGMA_SKIP_RATE_LIMITED=1 \
npm run figma:refresh -- --ids=2921:712
```
