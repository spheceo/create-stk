---
"create-stk": patch
---

Add a new backend template option for Rust + Axum using the public `spheceo/rust-axum-template` repository via `giget`.

- Add `rust-axum` as a backend template choice.
- Scaffold from the Rust template and replace `{{ project_name }}` placeholders in Cargo files and API source.
- Run `cargo update` after scaffold setup.
- Skip package manager prompt/install flow for non-JS templates (`go-fiber`, `rust-axum`).
- Show `cargo run` as the startup command for Rust projects.
