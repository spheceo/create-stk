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

- Add a changeset: `pnpm changeset`.
- Default to patch changes only unless the user explicitly states the update is major, breaking, or should be minor/major.
- For CLI releases, keep incrementing `0.1.x` patch versions by default instead of bumping `0.x.0`.
- Merge the Changesets PR; GitHub Actions runs `pnpm run release`.
