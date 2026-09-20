# Contributing

Keep changes focused and reviewable. Content-only additions belong in `content/packs/`; behavior changes belong in the engine/UI with tests. Read [Authoring](docs/AUTHORING.md), [Sources](docs/SOURCES.md), and [Architecture](docs/ARCHITECTURE.md) first.

For a content correction, include the question id, the exact issue, the official handbook page/section, and an explanation covering all four options. Do not post personal driving, health, or licensing records. Mark unresolved questions pending rather than guessing.

Before opening a pull request:

```sh
npm run build
npm run check
```

For interface changes, regenerate the standalone preview and perform the optional browser smoke test in [Testing](docs/TESTING.md). Check narrow mobile widths and keyboard input. Commit source JSON together with its generated bundle. Keep the site's source-review notice consistent with actual editorial evidence.

Do not introduce analytics, persistence, a dependency, or a network service as an incidental refactor. Any such change needs an explicit design decision and updated privacy/security documentation. Use explanatory feedback rather than shame or exaggerated claims about road-test readiness.
