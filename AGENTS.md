## Instructions

- Do not use Python for edits or scripting. Use shell or Node tools instead.
- Run type-checks after you complete making changes to the codebase to ensure there aren't and Typescript errors.

## Publishing

1) Create a changeset:
```bash
pnpm changeset
```
- Pick the version bump (patch/minor/major).
- Write a short summary of the change.

2) Commit and push:
```bash
git add .
git commit -m "chore: changeset"
git push
```

3) Merge the Changesets PR and let GitHub Actions publish.
- The `Publish` workflow runs `pnpm run release` via Changesets.