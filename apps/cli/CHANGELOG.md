# create-stk

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
