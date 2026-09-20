# Sources and editorial verification

All **226 built-in questions across 113 rule families** were reviewed against the actual official North Carolina Driver Handbook retrieved on **September 19, 2026**. This includes the stem, keyed answer, every choice and its feedback, hint, rule summary, source citation, and relevant figure. The 22 local sign illustrations were rendered and compared with the handbook's regulatory and warning sign charts. The original 182-question review backlog is resolved for this document snapshot.

This was a Codex-assisted editorial review with independent second passes and a final integration review. It is not an NCDMV endorsement, an official exam bank, or a separate human/legal certification. “Source checked” means the authored material was checked against the identified source, not that every statement in the handbook is guaranteed to reflect current law.

## Exact document reviewed

- [Official handbook PDF](https://www.ncdot.gov/dmv/license-id/driver-licenses/new-drivers/Documents/nc-driver-handbook.pdf).
- Retrieved: **2026-09-19**; 7,283,104 bytes; **108 PDF pages**.
- SHA-256: `6c0fcb8f004e7fc34cea78de7167a055a3463601853135475265153c07808c0f`.
- Back-cover revision statement: **Revised May 2025**; printing notation **(09/25)**.
- PDF metadata: creation April 22, 2026; modification September 10, 2026. These metadata dates differ from the printed revision and are **not** treated as a new edition.
- Printed pages 1–105 correspond to PDF pages 3–107. `pdfPage` and the app's `#page=` links always use **one-based PDF pagination**.
- Current full-handbook sign charts: printed pages **86–87**, PDF pages **88–89**. Earlier standalone excerpts used printed pages 74–75; those old page numbers are not used for current questions.

Machine-readable retrieval metadata is in [handbook-source.json](handbook-source.json). The downloaded PDF was used locally; the binary is not redistributed in this repository. The publisher may replace the file at the same URL, so the hash identifies the reviewed snapshot.

## Extraction and review records

- [NC_DRIVER_HANDBOOK.md](NC_DRIVER_HANDBOOK.md): page-by-page extraction of factual information in original paraphrases, with tables, descriptions of relevant diagrams, and an entry for every PDF page. It is a paraphrased reference, not a verbatim transcription or substitute for the source's visual layout.
- [CONTENT_AUDIT.md](CONTENT_AUDIT.md): editorial findings and corrections, including a review record for every rule family and its two question variants.
- [CONTENT_AUDIT.json](CONTENT_AUDIT.json): review scope, source identity, page evidence, findings, and a digest for every reviewed question's wording, answer key, feedback, hint, concept citation, and illustration.
- [CONTENT_REVIEW.md](CONTENT_REVIEW.md): generated inventory of effective question status and primary PDF page, including any later packs.

The PDF text was extracted with `pdftotext -layout`. Relevant pages were rendered with `pdftoppm` and inspected directly, including school-bus layouts, roundabouts, traffic signals, hybrid beacons, sign charts, pavement markings, and numerical tables. Text extraction alone was not used to certify sign meanings. Local SVGs remain original schematic artwork.

## A known limitation in the handbook itself

The retrieved handbook's printed page 99 (PDF page 101) still lists personal auto liability limits of $30,000/$60,000/$25,000. The North Carolina Department of Insurance states that new or renewed policies on or after July 1, 2025 require $50,000/$100,000/$50,000. The Markdown preserves what the PDF says and labels it as superseded with a linked correction. These insurance limits are **not tested by the current question bank**. See the [official insurance update](https://www.ncdoi.gov/changes-rating-automobile-insurance-policies-effective-july-1-2025).

This review did not independently compare every handbook paragraph with current statutes, fees, and agency procedures. Extracted administrative facts are attributed to the handbook snapshot. The existing quiz was reviewed in full within its narrower driving-rule and sign scope.

## Maintaining verification

`npm run build` and `npm run check` reject source-checked questions whose reviewed wording, key, feedback, hint, citation, or SVG has changed without matching review evidence. The build checks the merged bank, so manually placing a pack in the repo cannot confer source-checked status without evidence. A matching digest establishes that reviewed material is unchanged; it does not prove the editorial judgment was correct. Do not regenerate evidence to silence a failure without reviewing the change against the actual source.

New browser imports and packs added with `add-pack` remain unverified. Structural validation cannot establish factual correctness. Preserve numerical qualifiers, roadway geometry, exceptions, and distinctions between law and handbook advice. Follow [AUTHORING.md](AUTHORING.md) when conducting a new review.

## Official reference links

- [Handbooks landing page](https://www.ncdot.gov/dmv/license-id/driver-licenses/new-drivers/Pages/handbooks.aspx).
- [Regulatory-sign excerpt](https://www.ncdot.gov/dmv/license-id/driver-licenses/new-drivers/Documents/regulatory-signs.pdf) and [warning-sign excerpt](https://www.ncdot.gov/dmv/license-id/driver-licenses/new-drivers/Documents/warning-signs.pdf): supplementary official documents; current built-in citations use the full handbook instead.
- [Driver license testing information](https://www.ncdot.gov/dmv/license-id/driver-licenses/new-drivers/Pages/driver-license-tests.aspx).

The app's 25-question check is an authored practice format, not a claim to reproduce the official exam. No prior chat scores or personal performance records are bundled.
