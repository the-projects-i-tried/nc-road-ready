# Testing and release checks

## Reproduce the core checks

```sh
npm run build
npm run check
```

No dependency installation is required. The checks use Node's built-in test runner and standard library. The September 19, 2026 source-review update was checked locally with Node v25.8.1; GitHub Actions uses Node 22.

**Current result: 57 passing Node tests, zero failures.** They cover the content format and inventory, source URL restrictions, duplicate and malformed packs, deterministic selection, bank exhaustion without exact repeats, explicit review, hard topic/difficulty filters, hint-aware progress, spaced/distinct-variant practice labels, adaptive weighting, deferred scoring, reset, safe imports, natural-language topic matching, generated bundle freshness, standalone CSP hashes, source/preview script equality, permanent pack addition, relative paths, local HTTP serving, and traversal rejection. Checks also cover all 108 Markdown page entries, complete review evidence, rejection of changed reviewed wording/keys/citations/artwork, and rejection of permanent packs that claim or inherit source-checked status without their own evidence.

The permanent-submission update adds strict field normalization, UTF-8 byte limits, prototype-shaped key rejection, pending review status, issue-body parsing, allowed file paths, symlink rejection, and refusal of altered retry snapshots. A disposable Git checkout with simulated GitHub API responses exercised the real build/check sequence, exact three-file PR payload, validation status before branch creation, immutable existing PRs, recovery after PR creation failure, and refusal of tampered generated JavaScript. The permanent-pack test now accommodates already committed packs rather than assuming the compiled bank contains only core content.

These are software/data-integrity tests. They do not establish the factual correctness of a road rule, reproduce the official exam, or measure educational efficacy.

## Optional browser smoke test

This uses Python Playwright rather than adding a browser-test dependency to the npm project. In a development environment with Python and Chromium available:

```sh
python -m pip install playwright
python -m playwright install chromium
python tests/browser_smoke.py
```

To use a system Chromium:

```sh
python tests/browser_smoke.py --chromium /path/to/chromium
```

Add `--screenshots` to regenerate the three illustrations in `docs/`. They are screenshots of the actual running app, not design mockups. The test generates a temporary self-contained HTML copy and loads it with Playwright `set_content` in fresh browser contexts.

**Current result: 13 passing browser workflows.** The source-review update was exercised with Python 3.14.4, Playwright 1.63.0, and cached Chromium. The test also confirms source-page links, 226 checked questions at startup, 226 checked out of 227 after importing an unverified question, and restoration to 226 out of 226 after reset. The reset assertion caught and drove a fix for a stale review-status banner.

The submission update passed the same browser suite, including preparation after a session import, strict rejection of unknown fields, a fixed GitHub form link without JSON in its URL, invalidation after edits/reset, and mobile layouts. Counts are now derived from the loaded bank so future permanent packs do not invalidate the temporary-import/reset checks. Browser tests do not submit real GitHub issues or approve/merge PRs. Live bot-created PR testing remains blocked until the organization permits Actions to create PRs.

| Workflow | Result |
|---|---|
| Fresh launch, inventory, zero prior scores | Passed |
| Complete learning round, wrong answer, hint, all four explanations, score | Passed |
| History filtering and a real report download | Passed |
| Follow-up on a missed rule | Passed |
| Metadata topic request, limited pool, exhaustion, explicit review, unknown topic | Passed |
| 25-question check with feedback/scoring withheld until the end | Passed |
| Authoring-prompt download | Passed |
| JSON preview, acknowledgment gate, import, duplicate rejection | Passed |
| External-image rejection and HTML-shaped text not executed | Passed |
| Full reset removes progress and temporary packs | Passed |
| Keyboard answer submission and local question report | Passed |
| 320, 390, 768, and 1440 px layouts; sign images; no horizontal overflow | Passed |
| No page/console errors, outgoing HTTP requests, or cookies during these workflows | Passed |

Wrong and correct answer backgrounds were also checked to be visually distinct. Desktop and mobile screenshots were visually inspected.

## Scope limits

The environment's managed-browser policy blocked direct `file://` and localhost navigation. The browser workflows therefore exercised the generated standalone copy via `set_content`, which runs the real engine, bank, UI, CSS, images, and content-security policy. The ordinary HTTP development server was separately tested from Node, but browser navigation to that server was not verified here.

The [GitHub repository](https://github.com/the-projects-i-tried/nc-road-ready) and [Pages site](https://the-projects-i-tried.github.io/nc-road-ready/) are published. The Pages workflow validates the bank before deployment. Browser workflow coverage above is for the generated standalone copy. Safari, Firefox, real iOS/Android devices, and embedded deployment on the organization's actual homepage were not tested. Keyboard focus, labels, responsive layouts, and non-color answer labels are implemented; this is not a formal accessibility compliance audit.

The original 182-question handbook backlog was resolved by reviewing the actual downloaded source. All 226 built-in questions now have documented evidence and PDF page citations. This editorial review is separate from successful software tests and does not certify every handbook statement as current law. See [SOURCES.md](SOURCES.md) and [CONTENT_AUDIT.md](CONTENT_AUDIT.md).

## Useful manual acceptance checks after deployment

Open the deployed project URL in a desktop browser and on a phone. Start five questions, make a deliberate error, read all explanations, request a follow-up, and test an official source link. Refresh to verify a fresh session. Complete a 25-question check, import the example pack temporarily, and confirm it disappears on reset. Verify relative sign images and the optional `?embed=1` view under the real project path.
