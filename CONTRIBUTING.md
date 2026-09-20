# Contributing

Keep changes focused and reviewable. Content-only additions belong in `content/packs/`; behavior changes belong in the engine/UI with tests. Read [Authoring](docs/AUTHORING.md), [Permanent Question Submissions](docs/SUBMISSIONS.md), [Sources](docs/SOURCES.md), and [Architecture](docs/ARCHITECTURE.md) first.

When the permanent-submission route is enabled, prepare the strict submission JSON in Question lab and paste it into the GitHub issue form. The issue body is public and requires a GitHub account. When repository and organization workflow permissions allow Actions-created pull requests, a trusted workflow opens a bot pull request from the issue-created snapshot. Later issue edits do not overwrite that pull request; open a new issue for revisions unless a maintainer asks you to edit the pull request.

For direct repository work, use a feature branch and open a pull request. The owner cannot approve their own pull request, so externally submitted packs should use the bot path when owner approval is required.

For a content correction, include the question id, the exact issue, the official handbook page/section, and an explanation covering all four options. Do not post personal driving, health, licensing records, secrets, or confidential text. Mark unresolved questions pending rather than guessing.

Before opening a pull request:

```sh
npm run build
npm run check
```

For interface changes, regenerate the standalone preview and perform the optional browser smoke test in [Testing](docs/TESTING.md). Check narrow mobile widths and keyboard input. Commit source JSON together with its generated bundle. Keep the site's source-review notice consistent with actual editorial evidence.

Do not introduce analytics, persistence, a dependency, or a network service as an incidental refactor. Any such change needs an explicit design decision and updated privacy/security documentation. Passing validation or CI does not prove factual accuracy, source verification, or an absolute injection guarantee. Use explanatory feedback rather than shame or exaggerated claims about road-test readiness.
