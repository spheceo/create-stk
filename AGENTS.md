## Instructions

- Do not use Python for edits or scripting. Use shell or Node tools instead.
- Run type-checks after you complete making changes to the codebase to ensure there aren't and Typescript errors.
- Do not alter or change the test files for this project unless otherwise instructed.

## Publishing

1) Create a changeset:
```bash
pnpm changeset
```
- Pick the version bump (patch/minor/major).
- Write a short summary of the change.

If the interactive prompt cannot open `/dev/tty`, create a changeset file manually:
```bash
cat <<'EOF' > .changeset/short-description.md
---
"create-stk": patch
---

Short summary of the change.
EOF
```
Pick the appropriate bump (patch/minor/major) and filename.

2) Commit and push:
```bash
git add .
git commit -m "(add the appropriate commit message)"
git push
```

3) Merge the Changesets PR and let GitHub Actions publish.
- The `Publish` workflow runs `pnpm run release` via Changesets.
