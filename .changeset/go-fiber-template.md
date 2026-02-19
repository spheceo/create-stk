---
"create-stk": patch
---

Add a new backend template option for Go + Fiber using the public `spheceo/go-fiber-template` repository via `giget`.

- Add `go-fiber` as a backend template choice.
- Scaffold from GitHub template and run Go-specific setup (`go mod tidy` and placeholder replacement).
- Skip JavaScript package installation flow for non-JS Go templates.
- Skip package manager prompt when `go-fiber` is selected.
- Show `go run .` as the startup command for Go projects.
