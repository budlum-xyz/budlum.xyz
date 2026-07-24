# OpenFig Tooling Security Review

Generated for the development-only OpenFig import toolchain under `tools/design-import`.

## Scope

- Root application dependencies are audited by `npm ci` and currently report `0` vulnerabilities.
- This review covers the nested OpenFig toolchain only: `tools/design-import/package-lock.json`.
- The OpenFig toolchain is used for offline `.fig` parsing/extraction in CI and development. It is not shipped in the Vite runtime bundle.

## Current `npm audit` result

| Package | Severity | Advisory | Current blocker |
|---|---|---|---|
| `@hono/node-server` | moderate | `GHSA-frvp-7c67-39w9` path traversal in `serve-static` on Windows via encoded backslash | Transitive via `@modelcontextprotocol/sdk` from `openfig-cli`. `npm audit fix` did not reduce the final advisory count without altering unrelated lockfile metadata. |
| `@modelcontextprotocol/sdk` | moderate | depends on vulnerable `@hono/node-server` | Transitive dependency of `openfig-cli`. |
| `sharp` | high | `GHSA-f88m-g3jw-g9cj` inherited libvips vulnerabilities | No fix available through current `openfig-cli@0.4.7` dependency range. |
| `openfig-cli` | high | aggregates `@modelcontextprotocol/sdk` and `sharp` advisories | Direct dev/tooling dependency; no fully fixed release verified yet in this repo. |

## Decision

Do not apply partial lockfile churn that leaves the advisory count unchanged. Keep the toolchain pinned until one of these becomes true:

1. `openfig-cli` publishes a compatible version that removes the vulnerable transitive ranges.
2. A lockfile-only override can be proven to reduce advisories without breaking:
   - `npm run figma:openfig:resolve:check`
   - `npm run figma:openfig:interactions:check`
   - `npm run figma:images:check`
   - `npm run figma:doctor`
3. The vulnerable dependency path becomes part of shipped runtime code, which would require immediate mitigation.

## Operational guard

- Do not run OpenFig tooling as a network-exposed server in this project.
- Keep OpenFig usage limited to local/CI file parsing and asset extraction.
- Re-run this review when `tools/design-import/package-lock.json` changes.
