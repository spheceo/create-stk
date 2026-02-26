---
"create-stk": patch
---

Add a new backend Python template option using the public `spheceo/python-fast-template` repository via `giget`.

- Add `python-fastapi` under `Backend` -> `Python` with the label `Python (FastAPI)`.
- Scaffold from the Python FastAPI template and replace `{{ project_name }}` in `src/index.py`, `pyproject.toml`, and `README.md`.
- Replace `{{ project_description }}` in `pyproject.toml` with `This is an empty template.`.
- Skip package manager selection/install flow for this non-Node template.
