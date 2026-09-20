# Adding and reviewing questions

## The two workflows

**Temporary:** use Question lab to export a prompt, obtain JSON, then validate, preview, acknowledge the review limitation, and import. Questions are available until page refresh or session reset.

**Permanent:** save the pack outside this repository, run `npm run add-pack -- /path/to/pack.json`, inspect the new file under `content/packs/`, review its claims against the official handbook, run `npm run build` and `npm run check`, and commit the source and generated bank together. The add-pack script validates against all currently committed packs and rolls back its new file if the build fails.

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

`questions` must contain 1–5000 entries. Browser uploads have a 5 MB limit. IDs use lowercase letters, digits, hyphens, and underscores, starting with a letter or digit, up to 96 characters. Reuse an existing concept id for a new variant of the same rule **without redefining that concept**. Existing source ids may be referenced without including them in `sources`.

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

All browser imports and packs added by the command line begin pending. To certify an item locally as source-checked, first perform and document the review. Update the concept status (and any explicit question override), add the verified page information, and record the reviewer/date/document version in a commit or review note. Rebuild afterward. Imported question-level `needs-source-review` overrides a source-checked concept; both must be considered.

The initial banner explains the build's outstanding source review. Do not remove or soften it until the full bank has actually been reviewed. When review is complete, update the About copy, README inventory, source notes, and review queue consistently; do not change only a visual badge.

## Safe maintenance

Do not edit generated `site/js/bank.js` directly. Do not add secrets, tracking, user scores from a chat transcript, or a live model endpoint to a content pack. Do not treat `npm run check` as a legal-accuracy audit. Inventory tests deliberately pin the initial core count; update their expectations and documentation if deliberately changing the core rather than adding a separate pack.
