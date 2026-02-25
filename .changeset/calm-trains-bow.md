---
"create-stk": patch
---

Fix package manager behavior for Bun-only Node.js templates.

- Force `bun` as the package manager for `node-serverless-playwright` and `node-elysia`.
- Ignore `--pm` overrides for those Bun-only templates.
- Run `bun install` for Serverless + Playwright scaffolds.
- Show `bun run dev` as the startup command for Serverless + Playwright.
