# Adding and reviewing questions

## The two workflows

**Temporary:** use Question lab to export a prompt, obtain JSON, then validate, preview, acknowledge the review limitation, and import. Questions are available until page refresh or session reset.

**Permanent public submission:** when the submission route is enabled, use Question lab to prepare the strict submission JSON, then paste it into the GitHub issue form. A GitHub account is required, and the issue body is public. When repository and organization workflow permissions allow Actions-created pull requests, the trusted issue workflow validates the issue-created snapshot and opens a bot pull request. The owner reviews and approves before merge; Pages deploys from `main` after merge. See [Permanent Question Submissions](SUBMISSIONS.md).

**Maintainer repository work:** save the pack outside this repository, create a feature branch, run `npm run add-pack -- /path/to/pack.json`, inspect the new file under `content/packs/`, review its claims against the official handbook, run `npm run build` and `npm run check`, and open a pull request with the source and generated bank together. The add-pack script validates against all currently committed packs and rolls back its new file if the build fails. The owner cannot approve their own pull request, so externally submitted packs should use the bot path when owner approval is required.

`npm run validate -- file.json --against-core` is useful for a preliminary check against core data. For packs that reuse concepts from other add-on packs, use the in-app validator or `add-pack`, which validates against the complete bank.

## Source requirements

Use only the current official North Carolina Driver Handbook or the two official NCDOT sign excerpts linked in [SOURCES.md](SOURCES.md). Obtain the actual document rather than treating a preceding generated explanation as evidence. If the PDF cannot be read, say so and keep the item pending. Do not invent page numbers or an edition date. `pdfPage` is one-based PDF pagination, which can differ from the page number printed on the page.

Each family has `sourceId`, `section`, `pdfPage`, and `reviewStatus`. Cite the smallest relevant source section. Inspect figures directly for sign questions. The local source URL validator permits only the handbook/sign PDF paths; it does not prove the URL is currently accessible or supports the claimed rule.

A human/content reviewer should verify the stem, correct choice, every distractor explanation, hint, and figure together. Preserve qualifications such as posted limits, roadway geometry, direction of approach, and whether the text states a law or a recommendation. Emergency advice should be especially literal and should not encourage unsafe experiments. Avoid trick questions with multiple defensible answers.

## Pack format

See [example-pack.json](example-pack.json), an unverified format example that is **not loaded automatically**, and [pack-schema.json](../content/pack-schema.json). The JavaScript validator additionally checks duplicate ids/stems and cross-references.

Top level:

```json
{
  "schemaVersion": 1,
  "packId": "distinct-pack-id",
  "title": "Readable pack title",
  "sources": {},
  "concepts": [],
  "questions": []
}
```

`questions` must contain 1–5000 entries. Browser uploads have a 5 MB limit for temporary imports. Permanent submission JSON is stricter: it must fit within 50,000 UTF-8 bytes, use only known fields, use allowed official NCDOT source URLs, and reference only bundled assets already present in the current bank. IDs use lowercase letters, digits, hyphens, and underscores, starting with a letter or digit, up to 96 characters. Reuse an existing concept id for a new variant of the same rule **without redefining that concept**. Existing source ids may be referenced without including them in `sources`.

A new concept needs:

```json
{
  "id": "your-new-rule",
  "title": "A clear rule title",
  "topic": "signals",
  "tags": ["specific phrase", "another useful phrase"],
  "summary": "A concise, source-grounded statement preserving exceptions.",
  "sourceId": "handbook",
  "section": "Actual relevant handbook section",
  "pdfPage": null,
  "reviewStatus": "needs-source-review",
  "priority": 1
}
```

Topic IDs: `signs`, `signals`, `school-buses`, `right-of-way`, `lane-use`, `passing`, `emergencies`, `weather`, `sharing`, `speed-distance`. Tags support search and request matching. Add new topics to engine/UI tests deliberately; do not silently invent a topic id.

Every question needs `id`, `concept`, `difficulty` (1 basic, 2 standard, 3 applied), `stem`, `hint`, exactly four `choices` with `id`, `text`, and `feedback`, and one `correctId`. Optional `asset` must name a bundled `assets/sign-*.svg` and requires `assetDescription`. Text-only items are preferred for externally generated packs unless an existing illustration is appropriate. Original illustrations may be added through a reviewed repository change, not an arbitrary image URL in an imported pack.

## What a useful new item looks like

Change the actual decision or evidence, not a person's name or merely the order of choices. A new roadway geometry can test a different school-bus requirement; changing a road name does not. A new step in a railroad emergency can be useful, but should not omit the preceding safety steps. Plausible distractors should represent common confusions, not introduce invented numeric rules without explaining them.

Give every alternative specific feedback. Explain the boundary separating the right answer from a tempting wrong one. Do not imply that an unnecessarily large clearance is unsafe merely because a question asks for a minimum. Avoid using exact irrelevant dollar amounts, dates, or time-window trivia to inflate the bank.

## Review status changes

All browser imports, permanent submissions, bot-created packs, and packs added by the command line begin pending. Submitted `source-checked` claims are forced back to `needs-source-review`. To mark an item locally as source-checked, first perform and document the review. Update the concept status (and any explicit question override), add the verified page information, and record the reviewer/date/document version in a commit or review note. Rebuild afterward. Imported question-level `needs-source-review` overrides a source-checked concept; both must be considered.

The core review is recorded in [CONTENT_AUDIT.json](CONTENT_AUDIT.json) and [CONTENT_AUDIT.md](CONTENT_AUDIT.md). Every core question inherits its concept's status and has an individual evidence digest covering the stem, choices, feedback, key, hint, concept citation, and SVG bytes. `scripts/review-evidence.cjs` checks that the current content still matches that review. After an actual editorial re-review, update the affected finding, question evidence digest (using `reviewDigest`), and document metadata as needed; do not update digests just to bypass a failure. Alternatively, mark changed material pending until it can be reviewed. The built-in inventory test intentionally expects 226 reviewed questions; a deliberate demotion must also update that release expectation and its documentation.

The banner and About counts track effective status, including temporary imports. Keep the About copy, README inventory, source notes, and review records consistent; do not change only a visual badge. `CONTENT_REVIEW.md` is generated by the build, while editorial findings in `CONTENT_AUDIT.md` are preserved separately.

The build validates review evidence after merging permanent packs, including questions that inherit a reviewed concept. Before promoting a pack, add its question IDs, documented findings, and reviewed digests to the audit. The current evidence record covers the identified handbook snapshot; using another source requires a corresponding extension of the recorded source evidence and its validation. Until that review is complete, leave the pack's question-level `needs-source-review` override in place.

## Safe maintenance

Do not edit generated `site/js/bank.js` directly. Do not add secrets, tracking, user scores from a chat transcript, or a live model endpoint to a content pack. Do not treat `npm run check`, the submission normalizer, or a bot pull request as a legal-accuracy audit. They check structure, provenance shape, duplicate risks, generated output, and repository safety boundaries; they do not prove the facts. Inventory tests deliberately pin the initial core count; update their expectations and documentation if deliberately changing the core rather than adding a separate pack.
