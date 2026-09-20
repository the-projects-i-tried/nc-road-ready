# Architecture and learning behavior

## Deliberately small runtime

The browser loads `engine.js`, the compiled `bank.js`, and `app.js`. They are ordinary local scripts rather than CDN modules. The site requires JavaScript but no server-side computation, API, build service, or browser persistence. Node is used only for optional development utilities. CSS and fonts are local/system resources. Sign SVGs are original schematic teaching illustrations.

`content/core.json` is the editable source of the built-in bank. The build appends validated `content/packs/*.json` in filename order, checks asset existence, and emits `site/js/bank.js`. It escapes HTML-sensitive data so text cannot terminate a script in the standalone distribution. `build --check` fails if the committed generated bundle differs from source.

## Three different objects

A **rule family** is a distinct concept with a topic, source, summary, tags, and review status. A **question variant** is an authored scenario with four explanations and one keyed answer. An **answer record** is an actual choice made during this page lifetime. Shuffling four options does not create a new variant.

The initial inventory is 113 families and 226 variants, not 226 independent rules and not an unlimited generator. The engine is content-independent within the declared topic taxonomy. New concepts and questions can be imported or committed without rewriting the selection logic.

## Adaptive selection

This is an explicit heuristic, not item-response theory, Bayesian knowledge tracing, or a validated learning intervention.

Eligibility first enforces topic exclusions, requested topics or concepts, difficulty, unresolved-mistake-only selection, and fresh-only exposure. Explicit review permits seen variants but still prefers fresh ones. A question never appears twice within the same batch. Where another eligible rule exists, the last three attempted rules are excluded from the next draw.

For the remaining eligible candidates, the engine multiplies weights:

| Component | Multiplier |
|---|---:|
| Per-rule priority | Source-data value, normally 1 |
| Rule not yet answered | 1.7 |
| Rule has an unresolved mistake | 4 |
| Rule meets the practiced heuristic | 0.35 |
| Exact variant already exposed | 0.08 |
| Rule in the last three attempts | 0.05 |
| Variant matches the adaptive difficulty target | 1.8 |
| Other difficulty in adaptive mode | 0.75 |
| Previously used topic | 1 / (1 + 0.08 × its attempt count) |

The last-six-answer accuracy selects a target after at least four responses: below 50% favors basic items, at least 80% favors applied items, and the middle favors standard items. The first questions favor standard difficulty. An explicit difficulty overrides this targeting.

A miss resets the rule's unassisted-success streak and practice evidence. Hint-assisted correct answers count as correct in visible accuracy but not as unassisted successes. An unresolved-mistake target remains until two unassisted correct answers occur. “Practiced” additionally needs at least two distinct successful variants and a gap of at least three answer indices. This label is not a readiness guarantee.

A narrow topic can run out before a requested batch length. The app states the limitation; there is no silent switch to unrelated topics. A weak-only round may end early as rules cease to be weak. Asking for review can supply additional attempts, but distinct-variant and spacing requirements still apply.

## Request interpretation

The input is a local, transparent keyword parser. It understands counts, familiar topics, common exclusions, difficulty, weak areas, review, and selected narrow terms such as ABS or ramp meters. If no predefined topic matches, existing and imported concept titles/tags provide a fallback, preferring the longest matching phrase. Unknown subjects are rejected instead of being answered with a pretend AI response. The interpretation is shown before the question.

It is not a general semantic model and does not resolve all complex English negation. Topic chips and the searchable rule library remain explicit alternatives. A simple “5 more” continues the last selected direction; “mixed” clears that focus.

## Practice check

The 25-question check builds a topic-balanced queue, preferring different rule families. It hides hints and feedback until completion and records scores only at the end. Leaving an unfinished check discards its ungraded responses but keeps question exposure for the rest of the session. This is an app feature, not a replica of a confidential DMV exam or a validated pass threshold.

## Content trust and rendering

Imported JSON receives structural validation: ids, source allowlist, four unique choices, a valid answer key, per-choice feedback, valid concept references, and duplicate stem/illustration checks. It cannot prove that a scenario is new in meaning, that a distractor is plausible, or that a legal explanation is correct.

Imports cannot overwrite known source metadata or concept definitions. Browser imports may only reference existing bundled illustration paths. Imported review claims are demoted to pending. Text is rendered with `textContent` and DOM creation, never `innerHTML` or `eval`. Browser CSP disallows connections, objects, and submitted forms. The standalone file uses exact hashes for its embedded scripts/styles.

## Session lifetime and extension boundary

Only an in-memory Session object holds answers, exposure history, and imported packs. UI reset constructs a new Session from the original bank; page reload does the same. The lower-level engine `reset()` resets learning state only and intentionally does not remove its current bank; callers requiring complete reset should create a new Session, as the UI does.

Reports and generation prompts are explicit downloads or clipboard actions. No session restore/import is implemented. The generation prompt includes actual current answers and existing scenarios, and tells an external author to obtain the current official handbook. Nothing is automatically sent to an AI provider.
