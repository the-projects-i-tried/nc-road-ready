# Testing and release checks

## Reproduce the core checks

```sh
npm run build
npm run check
```

No dependency installation is required. The checks use Node's built-in test runner and standard library. The release was tested with Node v22.16.0.

**Release result: 39 passing Node tests, zero failures.** They cover the content format and inventory, source URL restrictions, duplicate and malformed packs, deterministic selection, bank exhaustion without exact repeats, explicit review, hard topic/difficulty filters, hint-aware progress, spaced/distinct-variant practice labels, adaptive weighting, deferred scoring, reset, safe imports, natural-language topic matching, generated bundle freshness, standalone CSP hashes, source/preview script equality, permanent pack addition, relative paths, local HTTP serving, and traversal rejection.

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

**Release result: 13 passing browser workflows.**

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

GitHub Pages deployment is configured but was **not executed**. No remote repository was created. Safari, Firefox, real iOS/Android devices, and embedded deployment on the organization's actual homepage were not tested. Keyboard focus, labels, responsive layouts, and non-color answer labels are implemented; this is not a formal accessibility compliance audit.

The full handbook source review remains unresolved for 182 questions. That limitation is independent of the successful software tests. See [SOURCES.md](SOURCES.md).

## Useful manual acceptance checks after deployment

Open the deployed project URL in a desktop browser and on a phone. Start five questions, make a deliberate error, read all explanations, request a follow-up, and test an official source link. Refresh to verify a fresh session. Complete a 25-question check, import the example pack temporarily, and confirm it disappears on reset. Verify relative sign images and the optional `?embed=1` view under the real project path.
