## Instructions

- Use shell or Node tools (no Python).
- Run type-checks after code changes.
- Do not edit tests unless asked.

## Monorepo

- PNPM workspace with apps in `apps/*`.
- CLI package: `apps/cli` (Changesets + `CHANGELOG.md` live here).
- Web app: `apps/web`.
- Turbo runs repo tasks; root `pnpm run ci` runs `lint`, `test`, `build` sequentially.

## Publishing (CLI)

- Add a changeset: `pnpm changeset` (choose patch/minor/major).
- Merge the Changesets PR; GitHub Actions runs `pnpm run release`.
