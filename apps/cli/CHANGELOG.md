# create-stk

## 0.0.17

### Patch Changes

- 975951e: Clean up the Nuxt scaffold template by removing the placeholder comment from the script setup block.

## 0.0.16

### Patch Changes

- 1e696cf: Fix Serverless + Playwright scaffolding to replace the project name placeholder in `README.md`.

  - Replace `{{ project_name }}` in `README.md` for `node-serverless-playwright`.
  - Keep existing placeholder replacement in `api/index.ts`.

## 0.0.15

### Patch Changes

- ca6bd56: Add a new backend Python template option using the public `spheceo/python-fast-template` repository via `giget`.

  - Add `python-fastapi` under `Backend` -> `Python` with the label `Python (FastAPI)`.
  - Scaffold from the Python FastAPI template and replace `{{ project_name }}` in `src/index.py`, `pyproject.toml`, and `README.md`.
  - Replace `{{ project_description }}` in `pyproject.toml` with `This is an empty template.`.
  - Skip package manager selection/install flow for this non-Node template.

## 0.0.14

### Patch Changes

- f7e5039: Add a new backend Java template option using the public `spheceo/java-maven-template` repository via `giget`.

  - Add `java-maven` under `Backend` -> `Java` with the label `Java (maven)`.
  - Scaffold from the Java Maven template and replace `{{ project_name }}` in `src/main/java/Main.java`, `pom.xml`, and `README.md`.
  - Skip package manager selection/install flow for Java templates, matching non-Node template behavior.

- f2c1db6: Update Serverless + Playwright Node.js template scaffolding details.

  - Replace `{{ project_name }}` in `api/index.ts` for the Serverless + Playwright template.
  - Rename the template option label to `Serverless + Playwright (bun)` in the CLI picker.

## 0.0.13

### Patch Changes

- 2ba13b4: Fix package manager behavior for Bun-only Node.js templates.

  - Force `bun` as the package manager for `node-serverless-playwright` and `node-elysia`.
  - Ignore `--pm` overrides for those Bun-only templates.
  - Run `bun install` for Serverless + Playwright scaffolds.
  - Show `bun run dev` as the startup command for Serverless + Playwright.

## 0.0.12

### Patch Changes

- fcc7086: Add a new backend Node.js template option for Bun + Elysia using the public `spheceo/ts-elysia-template` repository via `giget`.

  - Add `node-elysia` as a backend Node.js template choice.
  - Restrict the template to Bun and always use `bun install`.
  - Run Bun install after scaffolding the template.
  - Replace `{{ project_name }}` placeholders in the API entry file.
  - Show `bun run dev` as the startup command for this template.

## 0.0.11

### Patch Changes

- 5d848b1: Add a new backend Node.js template option for Serverless + Playwright using the public `spheceo/serverless-playwright` repository via `giget`.

  - Add `node-serverless-playwright` as a backend Node.js template choice.
  - Keep `node` as the default empty Node project scaffold.
  - Group backend selection so Node.js exposes `Empty Project` and `Serverless + Playwright` variants.
  - Run `pnpm install` after scaffolding the Serverless + Playwright template.
  - Show `pnpm dev` as the startup command for this template.

## 0.0.10

### Patch Changes

- 4a845c6: Add a new backend template option for Rust + Axum using the public `spheceo/rust-axum-template` repository via `giget`.

  - Add `rust-axum` as a backend template choice.
  - Scaffold from the Rust template and replace `{{ project_name }}` placeholders in Cargo files and API source.
  - Run `cargo update` after scaffold setup.
  - Skip package manager prompt/install flow for non-JS templates (`go-fiber`, `rust-axum`).
  - Show `cargo run` as the startup command for Rust projects.

## 0.0.9

### Patch Changes

- 58bbbe1: Add a new backend template option for Go + Fiber using the public `spheceo/go-fiber-template` repository via `giget`.

  - Add `go-fiber` as a backend template choice.
  - Scaffold from GitHub template and run Go-specific setup (`go mod tidy` and placeholder replacement).
  - Skip JavaScript package installation flow for non-JS Go templates.
  - Skip package manager prompt when `go-fiber` is selected.
  - Show `go run .` as the startup command for Go projects.

## 0.0.8

### Patch Changes

- 7354e98: small change to website

## 0.0.7

### Patch Changes

- 8dcfe94: switch to monorepo

## 0.0.6

### Patch Changes

- 29f4b3b: windows + next js bug fixes

## 0.0.5

### Patch Changes

- a7e817b: Document manual changeset creation fallback.

## 0.0.4

### Patch Changes

- a1157d3: Default package manager and git init when a project is provided.

## 0.0.3

### Patch Changes

- 86ef648: small change to the node template from .mts to .ts for the index file.

## 0.0.2

### Patch Changes

- e0f4456: internal restructure and tests to ensure cli stability

## 0.0.0

- Clean slate.
