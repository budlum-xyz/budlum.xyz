# OpenFig Interaction Audit

Generated from the checked-in OpenFig `.fig` binary. This does not call the Figma API.

- OpenFig nodes scanned: `25658`
- Manifest frames: `39`
- Mapped OpenFig manifest frames: `39`
- Prototype/navigation-like records: `0`
- Hyperlink records: `7`
- Hyperlinks inside manifest frame scope: `0`
- Hyperlinks outside manifest frame scope: `7`

## Decision

No OpenFig prototype/navigation keys were found. Existing Figma REST prototype audit remains the source of truth for the 39 React-rendered frames.

Hyperlink records found in this OpenFig file are outside the 39 manifest-frame React scope, so they are inventoried here rather than implemented.

## Hyperlinks

| OpenFig node | Type | Name | URL | In manifest scope |
|---|---|---|---|---|
| `1:22549` | `TEXT` | Co-Founder |  | no |
| `1:22551` | `TEXT` | X / Twitter · Instagram | https://x.com/lubosruler | no |
| `1:22552` | `TEXT` | X / Twitter | https://x.com/sophiaeurymede | no |
| `1:23635` | `TEXT` | Instagram | https://www.instagram.com/bat.art19/ | no |
| `1:23804` | `TEXT` | Co-Founder |  | no |
| `1:23806` | `TEXT` | X / Twitter · Instagram | https://x.com/lubosruler | no |
| `1:23816` | `TEXT` | X / Twitter | https://x.com/sophiaeurymede | no |
