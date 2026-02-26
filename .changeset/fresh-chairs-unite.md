---
"create-stk": patch
---

Add a new backend Java template option using the public `spheceo/java-maven-template` repository via `giget`.

- Add `java-maven` under `Backend` -> `Java` with the label `Java (maven)`.
- Scaffold from the Java Maven template and replace `{{ project_name }}` in `src/main/java/Main.java`, `pom.xml`, and `README.md`.
- Skip package manager selection/install flow for Java templates, matching non-Node template behavior.
