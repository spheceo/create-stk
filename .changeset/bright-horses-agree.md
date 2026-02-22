---
"create-stk": patch
---

Add a new backend Node.js template option for Serverless + Playwright using the public `spheceo/serverless-playwright` repository via `giget`.

- Add `node-serverless-playwright` as a backend Node.js template choice.
- Keep `node` as the default empty Node project scaffold.
- Group backend selection so Node.js exposes `Empty Project` and `Serverless + Playwright` variants.
- Run `pnpm install` after scaffolding the Serverless + Playwright template.
- Show `pnpm dev` as the startup command for this template.
