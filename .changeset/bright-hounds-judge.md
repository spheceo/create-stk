---
"create-stk": patch
---

Add a new backend Node.js template option for Bun + Elysia using the public `spheceo/ts-elysia-template` repository via `giget`.

- Add `node-elysia` as a backend Node.js template choice.
- Restrict the template to Bun and always use `bun install`.
- Run Bun install after scaffolding the template.
- Replace `{{ project_name }}` placeholders in the API entry file.
- Show `bun run dev` as the startup command for this template.
