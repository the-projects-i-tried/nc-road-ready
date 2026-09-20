# Editorial audit of the built-in question bank

Review completed **2026-09-19**. Scope: **226 questions, 904 answer choices and explanations, 226 hints, 113 rule summaries, and 22 sign illustrations**. All current built-in questions are source checked against the identified official handbook; no item remains in the initial source-review backlog. Counts and IDs were preserved.

This was a Codex-assisted editorial review, split into four content groups with independent second passes and final integration review. It does not claim a separate human sign-off or NCDMV endorsement. Source agreement and software tests serve different purposes: the review checks the authored claims, while tests check structure and guard against changing reviewed text without another review.

## Source and method

The [official PDF](https://www.ncdot.gov/dmv/license-id/driver-licenses/new-drivers/Documents/nc-driver-handbook.pdf) was downloaded, not inferred from a previous chat. It contains 108 PDF pages and prints **Revised May 2025** on its back cover. SHA-256: `6c0fcb8f004e7fc34cea78de7167a055a3463601853135475265153c07808c0f`. See [source identity and limitations](SOURCES.md) and the [page-by-page extracted information](NC_DRIVER_HANDBOOK.md).

For each family, reviewers read both variants and every answer, explanation, hint, and summary against the cited text. Relevant diagrams were rendered and inspected. The school-bus layouts, signal combinations, roundabouts, hybrid-beacon phases, sign charts, and pavement markings were checked visually. All 22 local sign SVGs were rendered and compared with the official charts. They remain schematic, original illustrations; no SVG replacement was needed.

Each reviewed question has a digest in [CONTENT_AUDIT.json](CONTENT_AUDIT.json), covering its actual wording and key, all feedback, hint, concept citation, and SVG bytes. The primary PDF page is shown in the app; the records below list additional supporting pages when needed. A matching digest proves only that reviewed content has not changed, not that an editorial judgment is infallible. Imported packs still begin unverified.

## Findings and corrections

- **A question could reward the wrong reading of its stem.** `being-passed-1` asked what to avoid, while its keyed choice described the recommended response and the distractors were all actions to avoid. It now asks how to respond, leaving one defensible answer.
- **Several stems and answers did not fit together.** Action questions had “Yes” or “No” choices; a right-passing question asked whether passing was allowed but offered roadway features. School-bus, signal, pedestrian, funeral-procession, crosswalk, passing, and railroad-reporting items were aligned with the question actually asked.
- **Emergency instructions needed precise conditions.** Shoulder recovery now explicitly waits until stopped or nearly stopped before returning safely. ABS answers include hard, steady braking. Oncoming-lane escape answers preserve the handbook's instruction to keep right even if leaving the road is necessary. Stopped-vehicle Move Over items include the 12-foot/warning-light trigger and a safe available lane-change condition.
- **Some stems assumed facts not stated.** School-bus scenarios now identify the vehicle and signal where needed; the one-way center-lane recommendation specifies three or more lanes; solid-yellow passing items specify a slower motor vehicle; the second yellow-arrow scenario explicitly starts from a protected green arrow.
- **All citations and effective review statuses were reconciled.** The 182 pending handbook questions now have actual PDF pages. The 44 sign questions were rechecked using current full-handbook charts at PDF pages 88–89 (printed 86–87), replacing references to older standalone excerpts.
- **Hints and figure descriptions were cleaned up.** Placeholder hints were replaced with rule or sign-recognition cues. Sign wording and descriptions were aligned with the rendered figures, including the DO NOT ENTER legend and low-clearance notation.
- **The source itself has a known stale administrative claim.** The handbook's old insurance limits are annotated in the Markdown with the later official correction. Those limits are not used in any current quiz item. The extraction is a faithful factual reference to the retrieved document, not a comprehensive reconciliation of the handbook with every current statute or agency procedure.

No alternative answer key had to be selected after correcting question scope and wording. This does not mean the old questions were all clean: the ambiguity and missing conditions above were substantive defects.

## Per-rule review

Every record below covers both listed questions, all four choices and feedback explanations, the hint, and the concept summary/citation. All underwent an independent second pass. PDF pages are one-based; printed pages are two less within the numbered handbook body.


### bus-two-lane

Questions: `bus-two-lane-1`, `bus-two-lane-2`. PDF pages: [49](NC_DRIVER_HANDBOOK.md#pdf-page-49). Printed pages: 47.

Source confirms that when a school bus stops for passengers on a two-lane roadway, all traffic from both directions must stop.

Review changes: Set concept reviewStatus to source-checked with handbook sourceId, smallest section, and one-based pdfPage. Replaced generic question hints with source-specific hints.

Figure check: Rendered PDF page 49; diagram shows stop signs for both directions on a two-lane roadway.

### bus-three-lane

Questions: `bus-three-lane-1`, `bus-three-lane-2`. PDF pages: [50](NC_DRIVER_HANDBOOK.md#pdf-page-50). Printed pages: 48.

Source confirms that one lane each way plus a center turning lane still requires all traffic from both directions to stop.

Review changes: Set concept reviewStatus to source-checked with handbook sourceId, smallest section, and one-based pdfPage. Replaced generic question hints with source-specific hints.

Figure check: Rendered PDF page 50; top diagram shows stop signs for both directions on the two-lane plus center-turn-lane layout.

### bus-four-undivided

Questions: `bus-four-undivided-1`, `bus-four-undivided-2`. PDF pages: [50](NC_DRIVER_HANDBOOK.md#pdf-page-50). Printed pages: 48.

Source confirms that a four-lane roadway without a median separation requires all traffic from both directions to stop.

Review changes: Set concept reviewStatus to source-checked with handbook sourceId, smallest section, and one-based pdfPage. Replaced generic question hints with source-specific hints. Edited awkward answer text so the correct choice directly answers the stem.

Figure check: Rendered PDF page 50; four-lane no-median diagram shows stop signs on both sides of the bus.

- bus-four-undivided-1: independently reviewed and corrected for precise scope, safety instruction, or stem/choice alignment.
- bus-four-undivided-1: made the relevant vehicle, signal, or roadway condition explicit in the stem.

### bus-five-lane

Questions: `bus-five-lane-1`, `bus-five-lane-2`. PDF pages: [50](NC_DRIVER_HANDBOOK.md#pdf-page-50). Printed pages: 48.

Source confirms that on a roadway of four lanes or more with a center turning lane, only traffic following the bus must stop.

Review changes: Set concept reviewStatus to source-checked with handbook sourceId, smallest section, and one-based pdfPage. Replaced generic question hints with source-specific hints.

Figure check: Rendered PDF page 50; bottom diagram shows stop signs only for vehicles following the bus.

- bus-five-lane-1: made the relevant vehicle, signal, or roadway condition explicit in the stem.
- bus-five-lane-2: made the relevant vehicle, signal, or roadway condition explicit in the stem.

### bus-median

Questions: `bus-median-1`, `bus-median-2`. PDF pages: [50](NC_DRIVER_HANDBOOK.md#pdf-page-50). Printed pages: 48.

Source confirms that on a divided highway of four lanes or more with a median separation, only traffic following the bus must stop.

Review changes: Set concept reviewStatus to source-checked with handbook sourceId, smallest section, and one-based pdfPage. Replaced generic question hints with source-specific hints.

Figure check: Rendered PDF page 50; divided-highway diagram shows opposing traffic continuing across the median while following traffic stops.

### bus-following

Questions: `bus-following-1`, `bus-following-2`. PDF pages: [50](NC_DRIVER_HANDBOOK.md#pdf-page-50). Printed pages: 48.

Source confirms the exceptions are for opposing traffic; traffic following the bus must stop in the divided-highway and four-lanes-plus-center-turn-lane diagrams.

Review changes: Set concept reviewStatus to source-checked with handbook sourceId, smallest section, and one-based pdfPage. Replaced generic question hints with source-specific hints.

Figure check: Rendered PDF page 50; both exception diagrams mark stop signs only behind/following the bus.

### bus-red-lights

Questions: `bus-red-lights-1`, `bus-red-lights-2`. PDF pages: [49](NC_DRIVER_HANDBOOK.md#pdf-page-49). Printed pages: 47.

Source confirms that a mechanical stop signal or flashing red lights while receiving or discharging passengers requires approaching drivers to stop and not pass.

Review changes: Set concept reviewStatus to source-checked with handbook sourceId, smallest section, and one-based pdfPage. Replaced generic question hints with source-specific hints.

Figure check: Rendered PDF page 49; bus illustration supports the stop-signal context, while the text carries the rule.

- bus-red-lights-1: made the relevant vehicle, signal, or roadway condition explicit in the stem.

### bus-resume

Questions: `bus-resume-1`, `bus-resume-2`. PDF pages: [49](NC_DRIVER_HANDBOOK.md#pdf-page-49). Printed pages: 47.

Source confirms drivers may not pass until the mechanical stop signal is withdrawn, red lights are off, and the bus has started to move.

Review changes: Set concept reviewStatus to source-checked with handbook sourceId, smallest section, and one-based pdfPage. Replaced generic question hints with source-specific hints.

Figure check: Rendered PDF page 49; text reviewed; no additional geometry figure required.

- bus-resume-1: made the relevant vehicle, signal, or roadway condition explicit in the stem.

### bus-speed

Questions: `bus-speed-1`, `bus-speed-2`. PDF pages: [49](NC_DRIVER_HANDBOOK.md#pdf-page-49), [55](NC_DRIVER_HANDBOOK.md#pdf-page-55). Printed pages: 47, 53.

Source states the maximum speed limit for a school bus is 45 mph; the maximum-speed table repeats school buses 45 mph. General speed-limit text confirms posted and condition limits still matter.

Review changes: Set concept reviewStatus to source-checked with handbook sourceId, smallest section, and one-based pdfPage. Replaced generic question hints with source-specific hints.

Figure check: No figure required; checked text on PDF pages 49 and 55.

### activity-speed

Questions: `activity-speed-1`, `activity-speed-2`. PDF pages: [55](NC_DRIVER_HANDBOOK.md#pdf-page-55). Printed pages: 53.

Source maximum-speed table lists school activity buses at 55 mph.

Review changes: Set concept reviewStatus to source-checked with handbook sourceId, smallest section, and one-based pdfPage. Replaced generic question hints with source-specific hints.

Figure check: No figure required; checked text on PDF page 55.

### bus-tracks

Questions: `bus-tracks-1`, `bus-tracks-2`. PDF pages: [63](NC_DRIVER_HANDBOOK.md#pdf-page-63). Printed pages: 61.

Source warns drivers to be prepared to stop for vehicles that must stop at crossings, including school buses.

Review changes: Set concept reviewStatus to source-checked with handbook sourceId, smallest section, and one-based pdfPage. Replaced generic question hints with source-specific hints. Tightened summary and feedback to match the handbook’s following-driver warning at railroad crossings.

Figure check: No figure required for school-bus following rule; railroad text reviewed on PDF page 63.

- bus-tracks-1: made the relevant vehicle, signal, or roadway condition explicit in the stem.

### bus-stop-vigilance

Questions: `bus-stop-vigilance-1`, `bus-stop-vigilance-2`. PDF pages: [49](NC_DRIVER_HANDBOOK.md#pdf-page-49). Printed pages: 47.

Source warns that children waiting for or leaving a bus might dart into traffic, and that children at bus stops may run into the street even when the bus is not in sight.

Review changes: Set concept reviewStatus to source-checked with handbook sourceId, smallest section, and one-based pdfPage. Replaced generic question hints with source-specific hints.

Figure check: Rendered PDF page 49; bus image is decorative, rule is in adjacent text.

### stop-position

Questions: `stop-position-1`, `stop-position-2`. PDF pages: [85](NC_DRIVER_HANDBOOK.md#pdf-page-85). Printed pages: 83.

Source confirms stop signs require a full stop; if there is no stop line or marked crosswalk, stop before entering the intersection where there is a view of the intersecting street.

Review changes: Set concept reviewStatus to source-checked with handbook sourceId, smallest section, and one-based pdfPage. Replaced generic question hints with source-specific hints.

Figure check: Rendered PDF page 85; stop-sign figure inspected, text carries the stopping-position rule.

### flashing-red

Questions: `flashing-red-1`, `flashing-red-2`. PDF pages: [83](NC_DRIVER_HANDBOOK.md#pdf-page-83). Printed pages: 81.

Source says a flashing red signal has the same meaning as a stop sign: stop and proceed only when the intersection can be entered without interfering with approaching traffic.

Review changes: Set concept reviewStatus to source-checked with handbook sourceId, smallest section, and one-based pdfPage. Replaced generic question hints with source-specific hints.

Figure check: Rendered PDF page 83; no separate flashing-red figure needed beyond text.

### flashing-yellow

Questions: `flashing-yellow-1`, `flashing-yellow-2`. PDF pages: [83](NC_DRIVER_HANDBOOK.md#pdf-page-83). Printed pages: 81.

Source says a flashing yellow signal has the same meaning as a warning sign: slow down and proceed with caution.

Review changes: Set concept reviewStatus to source-checked with handbook sourceId, smallest section, and one-based pdfPage. Replaced generic question hints with source-specific hints.

Figure check: Rendered PDF page 83; no separate flashing-yellow figure needed beyond text.

### steady-yellow

Questions: `steady-yellow-1`, `steady-yellow-2`. PDF pages: [82](NC_DRIVER_HANDBOOK.md#pdf-page-82). Printed pages: 80.

Source says circular yellow means caution and red is coming; stop unless too close to stop safely and never speed up to beat red.

Review changes: Set concept reviewStatus to source-checked with handbook sourceId, smallest section, and one-based pdfPage. Replaced generic question hints with source-specific hints.

Figure check: Rendered PDF page 82; circular signal figures inspected.

### right-on-red

Questions: `right-on-red-1`, `right-on-red-2`. PDF pages: [82](NC_DRIVER_HANDBOOK.md#pdf-page-82). Printed pages: 80.

Source allows right turn on steady circular red after a complete stop unless a NO TURN ON RED sign is present, with yielding to traffic and pedestrians.

Review changes: Set concept reviewStatus to source-checked with handbook sourceId, smallest section, and one-based pdfPage. Replaced generic question hints with source-specific hints. Expanded feedback to preserve the complete-stop, no-prohibiting-sign, and pedestrian/traffic yielding conditions.

Figure check: Rendered PDF page 82; circular red figure inspected, text carries exceptions and yielding detail.

### circular-green-left

Questions: `circular-green-left-1`, `circular-green-left-2`. PDF pages: [82](NC_DRIVER_HANDBOOK.md#pdf-page-82). Printed pages: 80.

Source says circular green permits proceeding cautiously straight or turning, and turning vehicles must yield to oncoming traffic and pedestrians.

Review changes: Set concept reviewStatus to source-checked with handbook sourceId, smallest section, and one-based pdfPage. Replaced generic question hints with source-specific hints.

Figure check: Rendered PDF page 82; circular green figure inspected.

### flashing-yellow-arrow

Questions: `flashing-yellow-arrow-1`, `flashing-yellow-arrow-2`. PDF pages: [83](NC_DRIVER_HANDBOOK.md#pdf-page-83). Printed pages: 81.

Source says a flashing yellow arrow permits the indicated turn but drivers must yield to oncoming traffic and pedestrians.

Review changes: Set concept reviewStatus to source-checked with handbook sourceId, smallest section, and one-based pdfPage. Replaced generic question hints with source-specific hints.

Figure check: Rendered PDF page 83; flashing-yellow-arrow figure inspected, including left/right turn heads.

### red-arrow-combination

Questions: `red-arrow-combination-1`, `red-arrow-combination-2`. PDF pages: [83](NC_DRIVER_HANDBOOK.md#pdf-page-83). Printed pages: 81.

Source says when arrow and circular signals are both displayed, turning traffic is controlled by the arrow and through traffic by the circular signal; red arrow means turning traffic must stop.

Review changes: Set concept reviewStatus to source-checked with handbook sourceId, smallest section, and one-based pdfPage. Replaced generic question hints with source-specific hints. Edited awkward answer text so the correct choice directly answers the stem.

Figure check: Rendered PDF page 83; combination signal displays inspected.

- red-arrow-combination-1: independently reviewed and corrected for precise scope, safety instruction, or stem/choice alignment.

### yellow-arrow

Questions: `yellow-arrow-1`, `yellow-arrow-2`. PDF pages: [82](NC_DRIVER_HANDBOOK.md#pdf-page-82), [83](NC_DRIVER_HANDBOOK.md#pdf-page-83). Printed pages: 80, 81.

Source says a yellow arrow means the protected green-arrow signal is about to change; the flashing-yellow-arrow figure labels solid yellow arrow as prepare to stop.

Review changes: Set concept reviewStatus to source-checked with handbook sourceId, smallest section, and one-based pdfPage. Replaced generic question hints with source-specific hints. Clarified that the steady yellow arrow warns a protected green-arrow signal is about to change and that drivers should prepare to stop.

Figure check: Rendered PDF pages 82-83; steady yellow-arrow and arrow-head figures inspected.

- yellow-arrow-2: made the relevant vehicle, signal, or roadway condition explicit in the stem.

### dark-intersection

Questions: `dark-intersection-1`, `dark-intersection-2`. PDF pages: [83](NC_DRIVER_HANDBOOK.md#pdf-page-83). Printed pages: 81.

Source says a malfunctioning traffic light should be treated as though controlled by stop signs on all approaches unless an officer/authorized person or another device is controlling traffic.

Review changes: Set concept reviewStatus to source-checked with handbook sourceId, smallest section, and one-based pdfPage. Replaced generic question hints with source-specific hints.

Figure check: Rendered PDF page 83; text reviewed; no figure required.

### officer-controls

Questions: `officer-controls-1`, `officer-controls-2`. PDF pages: [90](NC_DRIVER_HANDBOOK.md#pdf-page-90). Printed pages: 88.

Source says to obey an officer’s hand signals instead of normal traffic signals or signs.

Review changes: Set concept reviewStatus to source-checked with handbook sourceId, smallest section, and one-based pdfPage. Replaced generic question hints with source-specific hints.

Figure check: No figure required; checked text on PDF page 90.

### ramp-dark

Questions: `ramp-dark-1`, `ramp-dark-2`. PDF pages: [84](NC_DRIVER_HANDBOOK.md#pdf-page-84). Printed pages: 82.

Source says when a ramp meter is dark or not emitting red or green, a vehicle may proceed without stopping and enter by merging or yielding as normal conditions allow.

Review changes: Set concept reviewStatus to source-checked with handbook sourceId, smallest section, and one-based pdfPage. Replaced generic question hints with source-specific hints.

Figure check: Rendered PDF page 84; ramp meter red/green figure inspected, dark condition stated in text.

### ramp-red

Questions: `ramp-red-1`, `ramp-red-2`. PDF pages: [84](NC_DRIVER_HANDBOOK.md#pdf-page-84). Printed pages: 82.

Source says vehicles facing a circular red ramp-meter display must stop; figure caption says steady red means stop and wait for green.

Review changes: Set concept reviewStatus to source-checked with handbook sourceId, smallest section, and one-based pdfPage. Replaced generic question hints with source-specific hints.

Figure check: Rendered PDF page 84; ramp meter figure inspected.

### hybrid-flashing-red

Questions: `hybrid-flashing-red-1`, `hybrid-flashing-red-2`. PDF pages: [84](NC_DRIVER_HANDBOOK.md#pdf-page-84). Printed pages: 82.

Source says during flashing red, vehicles remain stopped until pedestrians or emergency response vehicles have cleared; after the crossing/intersection is clear and after first coming to a complete stop, vehicles may move while beacons flash red.

Review changes: Set concept reviewStatus to source-checked with handbook sourceId, smallest section, and one-based pdfPage. Replaced generic question hints with source-specific hints. Broadened wording from pedestrian-only beacon language to the handbook’s hybrid-beacon coverage of pedestrians and emergency response vehicles; retained pedestrian scenarios.

Figure check: Rendered PDF page 84; hybrid beacon sequence inspected, including alternating flashing-red phase.

### simultaneous-right

Questions: `simultaneous-right-1`, `simultaneous-right-2`. PDF pages: [59](NC_DRIVER_HANDBOOK.md#pdf-page-59). Printed pages: 57.

Source says when two or more vehicles reach an unsigned/unsignalized intersection at the same time, the vehicle to the right has the right of way.

Review changes: Set concept reviewStatus to source-checked with handbook sourceId, smallest section, and one-based pdfPage. Replaced generic question hints with source-specific hints.

Figure check: No figure required; checked text on PDF page 59.

### already-in-intersection

Questions: `already-in-intersection-1`, `already-in-intersection-2`. PDF pages: [59](NC_DRIVER_HANDBOOK.md#pdf-page-59). Printed pages: 57.

Source says the vehicle already in the intersection has the right of way ahead of any vehicle that has not yet entered.

Review changes: Set concept reviewStatus to source-checked with handbook sourceId, smallest section, and one-based pdfPage. Replaced generic question hints with source-specific hints. Edited awkward answer text so the correct choice directly answers the stem.

Figure check: No figure required; checked text on PDF page 59.

- already-in-intersection-1: independently reviewed and corrected for precise scope, safety instruction, or stem/choice alignment.

### blind-intersection

Questions: `blind-intersection-1`, `blind-intersection-2`. PDF pages: [59](NC_DRIVER_HANDBOOK.md#pdf-page-59). Printed pages: 57.

Source says at unmarked intersections where it is hard to see in all directions, stop and then move forward slowly and cautiously.

Review changes: Set concept reviewStatus to source-checked with handbook sourceId, smallest section, and one-based pdfPage. Replaced generic question hints with source-specific hints.

Figure check: No figure required; checked text on PDF page 59.

### private-driveway

Questions: `private-driveway-1`, `private-driveway-2`. PDF pages: [59](NC_DRIVER_HANDBOOK.md#pdf-page-59). Printed pages: 57.

Source says when exiting a private driveway, stop and yield to all other vehicles and pedestrians.

Review changes: Set concept reviewStatus to source-checked with handbook sourceId, smallest section, and one-based pdfPage. Replaced generic question hints with source-specific hints.

Figure check: No figure required; checked text on PDF page 59.

### pedestrian-unmarked

Questions: `pedestrian-unmarked-1`, `pedestrian-unmarked-2`. PDF pages: [48](NC_DRIVER_HANDBOOK.md#pdf-page-48). Printed pages: 46.

Source checked against the official NC Driver Handbook, Revised May 2025 PDF. The concept is supported with the listed qualifications.

Review changes: Set source metadata and review status; replaced generic hint with a source-specific cue; tightened summary and choice feedback to preserve handbook conditions.

Figure check: No figure needed; text passage was controlling.

### pedestrian-finishing

Questions: `pedestrian-finishing-1`, `pedestrian-finishing-2`. PDF pages: [48](NC_DRIVER_HANDBOOK.md#pdf-page-48). Printed pages: 46.

Source checked against the official NC Driver Handbook, Revised May 2025 PDF. The concept is supported with the listed qualifications.

Review changes: Set source metadata and review status; replaced generic hint with a source-specific cue; tightened summary and choice feedback to preserve handbook conditions.

Figure check: No figure needed; text passage was controlling.

- pedestrian-finishing-1: independently reviewed and corrected for precise scope, safety instruction, or stem/choice alignment.

### blind-pedestrian

Questions: `blind-pedestrian-1`, `blind-pedestrian-2`. PDF pages: [48](NC_DRIVER_HANDBOOK.md#pdf-page-48). Printed pages: 46.

Source checked against the official NC Driver Handbook, Revised May 2025 PDF. The concept is supported with the listed qualifications.

Review changes: Set source metadata and review status; replaced generic hint with a source-specific cue; tightened summary and choice feedback to preserve handbook conditions.

Figure check: No figure needed; text passage was controlling.

### funeral-procession

Questions: `funeral-procession-1`, `funeral-procession-2`. PDF pages: [54](NC_DRIVER_HANDBOOK.md#pdf-page-54). Printed pages: 52.

Source checked against the official NC Driver Handbook, Revised May 2025 PDF. The concept is supported with the listed qualifications.

Review changes: Set source metadata and review status; replaced generic hint with a source-specific cue; tightened summary and choice feedback to preserve handbook conditions. Added the handbook's exception that a non-procession driver may enter only if safe and without crossing the procession's path.

Figure check: No figure needed; text passage was controlling.

- funeral-procession-1: independently reviewed and corrected for precise scope, safety instruction, or stem/choice alignment.

### uturn-green-arrows

Questions: `uturn-green-arrows-1`, `uturn-green-arrows-2`. PDF pages: [82](NC_DRIVER_HANDBOOK.md#pdf-page-82), [83](NC_DRIVER_HANDBOOK.md#pdf-page-83). Printed pages: 80, 81.

Source checked against the official NC Driver Handbook, Revised May 2025 PDF. The concept is supported with the listed qualifications.

Review changes: Set source metadata and review status; replaced generic hint with a source-specific cue; tightened summary and choice feedback to preserve handbook conditions.

Figure check: Rendered and inspected rendered PDF pages 82 and 83; arrow-signal figures/text confirm the simultaneous green-arrow U-turn/right-turn yield rule.

### roundabout-entry

Questions: `roundabout-entry-1`, `roundabout-entry-2`. PDF pages: [60](NC_DRIVER_HANDBOOK.md#pdf-page-60), [61](NC_DRIVER_HANDBOOK.md#pdf-page-61). Printed pages: 58, 59.

Source checked against the official NC Driver Handbook, Revised May 2025 PDF. The concept is supported with the listed qualifications.

Review changes: Set source metadata and review status; replaced generic hint with a source-specific cue; tightened summary and choice feedback to preserve handbook conditions.

Figure check: Rendered and inspected rendered PDF pages 60 and 61; figures/text confirm circulating priority, outside crosswalks, and no passing bicyclists inside the roundabout.

### roundabout-exit-pedestrian

Questions: `roundabout-exit-pedestrian-1`, `roundabout-exit-pedestrian-2`. PDF pages: [61](NC_DRIVER_HANDBOOK.md#pdf-page-61). Printed pages: 59.

Source checked against the official NC Driver Handbook, Revised May 2025 PDF. The concept is supported with the listed qualifications.

Review changes: Set source metadata and review status; replaced generic hint with a source-specific cue; tightened summary and choice feedback to preserve handbook conditions.

Figure check: Rendered and inspected rendered PDF pages 60 and 61; figures/text confirm circulating priority, outside crosswalks, and no passing bicyclists inside the roundabout.

- roundabout-exit-pedestrian-1: independently reviewed and corrected for precise scope, safety instruction, or stem/choice alignment.

### interstate-right

Questions: `interstate-right-1`, `interstate-right-2`. PDF pages: [66](NC_DRIVER_HANDBOOK.md#pdf-page-66). Printed pages: 64.

Source checked against the official NC Driver Handbook, Revised May 2025 PDF. The concept is supported with the listed qualifications.

Review changes: Set source metadata and review status; replaced generic hint with a source-specific cue; tightened summary and choice feedback to preserve handbook conditions.

Figure check: No figure needed; text passage was controlling.

### intersection-lane-change

Questions: `intersection-lane-change-1`, `intersection-lane-change-2`. PDF pages: [59](NC_DRIVER_HANDBOOK.md#pdf-page-59). Printed pages: 57.

Source checked against the official NC Driver Handbook, Revised May 2025 PDF. The concept is supported with the listed qualifications.

Review changes: Set source metadata and review status; replaced generic hint with a source-specific cue; tightened summary and choice feedback to preserve handbook conditions.

Figure check: No figure needed; text passage was controlling.

### lane-beyond

Questions: `lane-beyond-1`, `lane-beyond-2`. PDF pages: [56](NC_DRIVER_HANDBOOK.md#pdf-page-56). Printed pages: 54.

Source checked against the official NC Driver Handbook, Revised May 2025 PDF. The concept is supported with the listed qualifications.

Review changes: Set source metadata and review status; replaced generic hint with a source-specific cue; tightened summary and choice feedback to preserve handbook conditions.

Figure check: No figure needed; text passage was controlling.

### one-way-through

Questions: `one-way-through-1`, `one-way-through-2`. PDF pages: [65](NC_DRIVER_HANDBOOK.md#pdf-page-65). Printed pages: 63.

Source checked against the official NC Driver Handbook, Revised May 2025 PDF. The concept is supported with the listed qualifications.

Review changes: Set source metadata and review status; replaced generic hint with a source-specific cue; tightened summary and choice feedback to preserve handbook conditions.

Figure check: No figure needed; text passage was controlling.

- one-way-through-2: independently reviewed and corrected for precise scope, safety instruction, or stem/choice alignment.
- Specified three or more lanes in the summary and feedback so the recommendation does not assume a center lane on a two-lane street.

### missed-turn-lane

Questions: `missed-turn-lane-1`, `missed-turn-lane-2`. PDF pages: [65](NC_DRIVER_HANDBOOK.md#pdf-page-65). Printed pages: 63.

Source checked against the official NC Driver Handbook, Revised May 2025 PDF. The concept is supported with the listed qualifications.

Review changes: Set source metadata and review status; replaced generic hint with a source-specific cue; tightened summary and choice feedback to preserve handbook conditions.

Figure check: No figure needed; text passage was controlling.

### center-turn-lane

Questions: `center-turn-lane-1`, `center-turn-lane-2`. PDF pages: [90](NC_DRIVER_HANDBOOK.md#pdf-page-90). Printed pages: 88.

Source checked against the official NC Driver Handbook, Revised May 2025 PDF. The concept is supported with the listed qualifications.

Review changes: Set source metadata and review status; replaced generic hint with a source-specific cue; tightened summary and choice feedback to preserve handbook conditions.

Figure check: Rendered and inspected rendered PDF page 90; pavement-marking text and diagram confirm yellow/white meanings and two-way left-turn lane markings.

### three-lane-passing

Questions: `three-lane-passing-1`, `three-lane-passing-2`. PDF pages: [57](NC_DRIVER_HANDBOOK.md#pdf-page-57). Printed pages: 55.

Source checked against the official NC Driver Handbook, Revised May 2025 PDF. The concept is supported with the listed qualifications.

Review changes: Set source metadata and review status; replaced generic hint with a source-specific cue; tightened summary and choice feedback to preserve handbook conditions.

Figure check: No figure needed; text passage was controlling.

### yellow-white-direction

Questions: `yellow-white-direction-1`, `yellow-white-direction-2`. PDF pages: [90](NC_DRIVER_HANDBOOK.md#pdf-page-90). Printed pages: 88.

Source checked against the official NC Driver Handbook, Revised May 2025 PDF. The concept is supported with the listed qualifications.

Review changes: Set source metadata and review status; replaced generic hint with a source-specific cue; tightened summary and choice feedback to preserve handbook conditions.

Figure check: Rendered and inspected rendered PDF page 90; pavement-marking text and diagram confirm yellow/white meanings and two-way left-turn lane markings.

### broken-yellow

Questions: `broken-yellow-1`, `broken-yellow-2`. PDF pages: [90](NC_DRIVER_HANDBOOK.md#pdf-page-90). Printed pages: 88.

Source checked against the official NC Driver Handbook, Revised May 2025 PDF. The concept is supported with the listed qualifications.

Review changes: Set source metadata and review status; replaced generic hint with a source-specific cue; tightened summary and choice feedback to preserve handbook conditions.

Figure check: Rendered and inspected rendered PDF page 90; pavement-marking text and diagram confirm yellow/white meanings and two-way left-turn lane markings.

### solid-side

Questions: `solid-side-1`, `solid-side-2`. PDF pages: [90](NC_DRIVER_HANDBOOK.md#pdf-page-90). Printed pages: 88.

Source checked against the official NC Driver Handbook, Revised May 2025 PDF. The concept is supported with the listed qualifications.

Review changes: Set source metadata and review status; replaced generic hint with a source-specific cue; tightened summary and choice feedback to preserve handbook conditions.

Figure check: Rendered and inspected rendered PDF page 90; pavement-marking text and diagram confirm yellow/white meanings and two-way left-turn lane markings.

- solid-side-2: independently reviewed and corrected for precise scope, safety instruction, or stem/choice alignment.

### crosswalk-no-pass

Questions: `crosswalk-no-pass-1`, `crosswalk-no-pass-2`. PDF pages: [57](NC_DRIVER_HANDBOOK.md#pdf-page-57). Printed pages: 55.

Source checked against the official NC Driver Handbook, Revised May 2025 PDF. The concept is supported with the listed qualifications.

Review changes: Set source metadata and review status; replaced generic hint with a source-specific cue; tightened summary and choice feedback to preserve handbook conditions.

Figure check: No figure needed; text passage was controlling.

- crosswalk-no-pass-1: independently reviewed and corrected for precise scope, safety instruction, or stem/choice alignment.

### passing-return

Questions: `passing-return-1`, `passing-return-2`. PDF pages: [57](NC_DRIVER_HANDBOOK.md#pdf-page-57). Printed pages: 55.

Source checked against the official NC Driver Handbook, Revised May 2025 PDF. The concept is supported with the listed qualifications.

Review changes: Set source metadata and review status; replaced generic hint with a source-specific cue; tightened summary and choice feedback to preserve handbook conditions.

Figure check: No figure needed; text passage was controlling.

- passing-return-1: independently reviewed and corrected for precise scope, safety instruction, or stem/choice alignment.

### being-passed

Questions: `being-passed-1`, `being-passed-2`. PDF pages: [57](NC_DRIVER_HANDBOOK.md#pdf-page-57). Printed pages: 55.

Source checked against the official NC Driver Handbook, Revised May 2025 PDF. The concept is supported with the listed qualifications.

Review changes: Set source metadata and review status; replaced generic hint with a source-specific cue; tightened summary and choice feedback to preserve handbook conditions.

Figure check: No figure needed; text passage was controlling.

- being-passed-1: independently reviewed and corrected for precise scope, safety instruction, or stem/choice alignment.

### right-pass-one-way

Questions: `right-pass-one-way-1`, `right-pass-one-way-2`. PDF pages: [57](NC_DRIVER_HANDBOOK.md#pdf-page-57). Printed pages: 55.

Source checked against the official NC Driver Handbook, Revised May 2025 PDF. The concept is supported with the listed qualifications.

Review changes: Set source metadata and review status; replaced generic hint with a source-specific cue; tightened summary and choice feedback to preserve handbook conditions. Added “otherwise lawful and safe” wording so the exception is not overbroad.

Figure check: No figure needed; text passage was controlling.

### right-pass-turning

Questions: `right-pass-turning-1`, `right-pass-turning-2`. PDF pages: [57](NC_DRIVER_HANDBOOK.md#pdf-page-57). Printed pages: 55.

Source checked against the official NC Driver Handbook, Revised May 2025 PDF. The concept is supported with the listed qualifications.

Review changes: Set source metadata and review status; replaced generic hint with a source-specific cue; tightened summary and choice feedback to preserve handbook conditions. Added “otherwise lawful and safe” wording so the exception is not overbroad.

Figure check: No figure needed; text passage was controlling.

### right-pass-multilane

Questions: `right-pass-multilane-1`, `right-pass-multilane-2`. PDF pages: [57](NC_DRIVER_HANDBOOK.md#pdf-page-57). Printed pages: 55.

Source checked against the official NC Driver Handbook, Revised May 2025 PDF. The concept is supported with the listed qualifications.

Review changes: Set source metadata and review status; replaced generic hint with a source-specific cue; tightened summary and choice feedback to preserve handbook conditions. Added “otherwise lawful and safe” wording so the exception is not overbroad.

Figure check: No figure needed; text passage was controlling.

- right-pass-multilane-1: independently reviewed and corrected for precise scope, safety instruction, or stem/choice alignment.

### turn-signal-distance

Questions: `turn-signal-distance-1`, `turn-signal-distance-2`. PDF pages: [71](NC_DRIVER_HANDBOOK.md#pdf-page-71). Printed pages: 69.

Source checked against the official NC Driver Handbook, Revised May 2025 PDF. The concept is supported with the listed qualifications.

Review changes: Set source metadata and review status; replaced generic hint with a source-specific cue; tightened summary and choice feedback to preserve handbook conditions.

Figure check: No figure needed; text passage was controlling.

### acceleration-lane

Questions: `acceleration-lane-1`, `acceleration-lane-2`. PDF pages: [66](NC_DRIVER_HANDBOOK.md#pdf-page-66). Printed pages: 64.

Source checked against the official NC Driver Handbook, Revised May 2025 PDF. The concept is supported with the listed qualifications.

Review changes: Set source metadata and review status; replaced generic hint with a source-specific cue; tightened summary and choice feedback to preserve handbook conditions.

Figure check: No figure needed; text passage was controlling.

### deceleration-lane

Questions: `deceleration-lane-1`, `deceleration-lane-2`. PDF pages: [66](NC_DRIVER_HANDBOOK.md#pdf-page-66). Printed pages: 64.

Source checked against the official NC Driver Handbook, Revised May 2025 PDF. The concept is supported with the listed qualifications.

Review changes: Set source metadata and review status; replaced generic hint with a source-specific cue; tightened summary and choice feedback to preserve handbook conditions.

Figure check: No figure needed; text passage was controlling.

- Preserved the normal handbook exit sequence without implying that drivers must maintain freeway speed despite hazards or drive exactly at an exit limit.

### missed-exit

Questions: `missed-exit-1`, `missed-exit-2`. PDF pages: [67](NC_DRIVER_HANDBOOK.md#pdf-page-67). Printed pages: 65.

Source checked against the official NC Driver Handbook, Revised May 2025 PDF. The concept is supported with the listed qualifications.

Review changes: Set source metadata and review status; replaced generic hint with a source-specific cue; tightened summary and choice feedback to preserve handbook conditions.

Figure check: No figure needed; text passage was controlling.

### moving-emergency

Questions: `moving-emergency-1`, `moving-emergency-2`. PDF pages: [50](NC_DRIVER_HANDBOOK.md#pdf-page-50). Printed pages: 48.

Source checked against the official NC Driver Handbook, Revised May 2025 PDF. The concept is supported with the listed qualifications.

Review changes: Set source metadata and review status; replaced generic hint with a source-specific cue; tightened summary and choice feedback to preserve handbook conditions.

Figure check: No figure needed; text passage was controlling.

### emergency-divided-exception

Questions: `emergency-divided-exception-1`, `emergency-divided-exception-2`. PDF pages: [50](NC_DRIVER_HANDBOOK.md#pdf-page-50). Printed pages: 48.

Source checked against the official NC Driver Handbook, Revised May 2025 PDF. The concept is supported with the listed qualifications.

Review changes: Set source metadata and review status; replaced generic hint with a source-specific cue; tightened summary and choice feedback to preserve handbook conditions.

Figure check: No figure needed; text passage was controlling.

### move-over-multilane

Questions: `move-over-multilane-1`, `move-over-multilane-2`. PDF pages: [51](NC_DRIVER_HANDBOOK.md#pdf-page-51). Printed pages: 49.

Source checked against the official NC Driver Handbook, Revised May 2025 PDF. The concept is supported with the listed qualifications.

Review changes: Set source metadata and review status; replaced generic hint with a source-specific cue; tightened summary and choice feedback to preserve handbook conditions. Added “within 12 feet of the roadway” and emergency/service vehicle scope from the source.

Figure check: No figure needed; text passage was controlling.

- move-over-multilane-1: independently reviewed and corrected for precise scope, safety instruction, or stem/choice alignment.
- move-over-multilane-2: independently reviewed and corrected for precise scope, safety instruction, or stem/choice alignment.

### move-over-single

Questions: `move-over-single-1`, `move-over-single-2`. PDF pages: [51](NC_DRIVER_HANDBOOK.md#pdf-page-51). Printed pages: 49.

Supported by the one-lane Move Over instruction on printed page 49.

Review changes: Added the 12-foot/activated-light qualifier to the concept summary and replaced generic hints with the one-lane source condition.

Figure check: No figure needed; reviewed the Move Over text block on PDF page 51.

- move-over-single-1: made the relevant vehicle, signal, or roadway condition explicit in the stem.
- move-over-single-2: made the relevant vehicle, signal, or roadway condition explicit in the stem.

### roundabout-emergency

Questions: `roundabout-emergency-1`, `roundabout-emergency-2`. PDF pages: [61](NC_DRIVER_HANDBOOK.md#pdf-page-61). Printed pages: 59.

Supported by the roundabout tips on printed page 59.

Review changes: Made the concept summary track the handbook's enter-vs-already-inside distinction and replaced generic hints.

Figure check: No figure needed; reviewed the roundabout text on PDF page 61.

- roundabout-emergency-2: made the relevant vehicle, signal, or roadway condition explicit in the stem.

### fire-hose

Questions: `fire-hose-1`, `fire-hose-2`. PDF pages: [50](NC_DRIVER_HANDBOOK.md#pdf-page-50). Printed pages: 48.

Supported by the emergency-vehicle guidelines on printed page 48.

Review changes: Tightened the summary and hints to the handbook's literal 'never drive' wording.

Figure check: No figure needed; reviewed the emergency-vehicle text on PDF page 50.

### emergency-parking-distance

Questions: `emergency-parking-distance-1`, `emergency-parking-distance-2`. PDF pages: [50](NC_DRIVER_HANDBOOK.md#pdf-page-50). Printed pages: 48.

Supported by the emergency-vehicle guidelines on printed page 48.

Review changes: Restored the handbook's 'investigate an accident or give assistance' phrasing and replaced generic hints.

Figure check: No figure needed; reviewed the emergency-vehicle text on PDF page 50.

### fire-truck-distance

Questions: `fire-truck-distance-1`, `fire-truck-distance-2`. PDF pages: [50](NC_DRIVER_HANDBOOK.md#pdf-page-50). Printed pages: 48.

Supported by the emergency-vehicle guidelines on printed page 48.

Review changes: Kept the one-block answer and made the hint distinguish it from the nearby 100-foot parking rule.

Figure check: No figure needed; reviewed the emergency-vehicle text on PDF page 50.

### tire-blowout

Questions: `tire-blowout-1`, `tire-blowout-2`. PDF pages: [78](NC_DRIVER_HANDBOOK.md#pdf-page-78). Printed pages: 76.

Supported by the blowout instructions on printed page 76.

Review changes: Expanded the summary and hints to preserve the order of the handbook's blowout steps.

Figure check: No figure needed; reviewed the blowout text on PDF page 78.

### run-off-pavement

Questions: `run-off-pavement-1`, `run-off-pavement-2`. PDF pages: [79](NC_DRIVER_HANDBOOK.md#pdf-page-79). Printed pages: 77.

Supported by the run-off-pavement instructions on printed page 77.

Review changes: Clarified that the handbook says stopped or nearly stopped before gradually returning, and replaced generic hints.

Figure check: Rendered PDF page 79. It contains highlighted text, not a separate diagram; the rendered page confirms the shoulder-recovery sequence.

- run-off-pavement-1: independently reviewed and corrected for precise scope, safety instruction, or stem/choice alignment.
- run-off-pavement-2: independently reviewed and corrected for precise scope, safety instruction, or stem/choice alignment.

### stuck-accelerator

Questions: `stuck-accelerator-1`, `stuck-accelerator-2`. PDF pages: [77](NC_DRIVER_HANDBOOK.md#pdf-page-77). Printed pages: 75.

Supported by the gas-pedal-sticks instructions on printed page 75.

Review changes: Kept the emergency sequence and replaced generic hints with source-specific order.

Figure check: No figure needed; reviewed the emergency text on PDF page 77.

### automatic-brake-failure

Questions: `automatic-brake-failure-1`, `automatic-brake-failure-2`. PDF pages: [77](NC_DRIVER_HANDBOOK.md#pdf-page-77). Printed pages: 75.

Supported by the brake-failure instructions on printed page 75.

Review changes: Kept the answer and revised hints to highlight the automatic-transmission branch.

Figure check: No figure needed; reviewed the emergency text on PDF page 77.

### manual-brake-failure

Questions: `manual-brake-failure-1`, `manual-brake-failure-2`. PDF pages: [77](NC_DRIVER_HANDBOOK.md#pdf-page-77). Printed pages: 75.

Supported by the brake-failure instructions on printed page 75.

Review changes: Kept the answer and revised hints to highlight the manual-transmission branch.

Figure check: No figure needed; reviewed the emergency text on PDF page 77.

### abs-stop

Questions: `abs-stop-1`, `abs-stop-2`. PDF pages: [68](NC_DRIVER_HANDBOOK.md#pdf-page-68). Printed pages: 66.

Supported by the ABS section on printed page 66.

Review changes: Kept the answer and added a source-specific hint about pumping reducing ABS effectiveness.

Figure check: No figure needed; reviewed the ABS text on PDF page 68.

- abs-stop-1: independently reviewed and corrected for precise scope, safety instruction, or stem/choice alignment.
- abs-stop-2: independently reviewed and corrected for precise scope, safety instruction, or stem/choice alignment.

### non-abs-slippery

Questions: `non-abs-slippery-1`, `non-abs-slippery-2`. PDF pages: [79](NC_DRIVER_HANDBOOK.md#pdf-page-79). Printed pages: 77.

Supported by the skid-avoidance instructions on printed page 77.

Review changes: Kept the answer and revised summary/hints to preserve the ABS contrast.

Figure check: Rendered PDF page 79. It contains highlighted skid instructions, not a separate skid diagram; the rendered page confirms the ABS/non-ABS contrast.

### oncoming-in-lane

Questions: `oncoming-in-lane-1`, `oncoming-in-lane-2`. PDF pages: [78](NC_DRIVER_HANDBOOK.md#pdf-page-78), [79](NC_DRIVER_HANDBOOK.md#pdf-page-79). Printed pages: 76, 77.

Supported by the unusual-emergency instructions spanning printed pages 76-77.

Review changes: Kept the correct action and changed the hint to flag that the source passage spans two pages.

Figure check: Rendered PDF page 79 for the continuation. It confirms the keep-right instruction; no separate diagram is present.

- oncoming-in-lane-1: independently reviewed and corrected for precise scope, safety instruction, or stem/choice alignment.
- oncoming-in-lane-2: independently reviewed and corrected for precise scope, safety instruction, or stem/choice alignment.

### police-safe-stop

Questions: `police-safe-stop-1`, `police-safe-stop-2`. PDF pages: [51](NC_DRIVER_HANDBOOK.md#pdf-page-51). Printed pages: 49.

Supported by the law-enforcement-stop guidance on printed page 49.

Review changes: Added the handbook's obey-all-traffic-laws condition to the summary and replaced generic hints.

Figure check: No figure needed; reviewed the law-enforcement-stop text on PDF page 51.

### railroad-evacuate

Questions: `railroad-evacuate-1`, `railroad-evacuate-2`. PDF pages: [64](NC_DRIVER_HANDBOOK.md#pdf-page-64). Printed pages: 62.

Supported by the railroad-emergency instructions on printed page 62.

Review changes: Preserved the handbook's evacuation-before-reporting order in hints and feedback.

Figure check: Rendered PDF page 64. The Blue Sign figure is on the same page, but this concept rests on the adjacent evacuation text.

### railroad-ens

Questions: `railroad-ens-1`, `railroad-ens-2`. PDF pages: [64](NC_DRIVER_HANDBOOK.md#pdf-page-64). Printed pages: 62.

Supported by the ENS text and figure on printed page 62.

Review changes: Rewrote the correct answer text for question 1 so it directly answers 'what should you use,' and added source-specific hints.

Figure check: Rendered PDF page 64. The figure shows the blue ENS sign with emergency phone number and crossing ID, circled on the crossing equipment.

- railroad-ens-1: independently reviewed and corrected for precise scope, safety instruction, or stem/choice alignment.

### train-priority

Questions: `train-priority-1`, `train-priority-2`. PDF pages: [62](NC_DRIVER_HANDBOOK.md#pdf-page-62). Printed pages: 60.

Supported by the railroad-crossing text on printed page 60.

Review changes: Rewrote one correct answer so it answers 'which has right of way' directly.

Figure check: No figure needed; reviewed the railroad-crossing text on PDF page 62.

### tire-change-passengers

Questions: `tire-change-passengers-1`, `tire-change-passengers-2`. PDF pages: [78](NC_DRIVER_HANDBOOK.md#pdf-page-78). Printed pages: 76.

Supported by the flat-tire precautions on printed page 76.

Review changes: Expanded the summary to include both the passenger-side exit and the front/rear exclusion.

Figure check: No figure needed; reviewed the blowout/tire-change text on PDF page 78.

### rain-headlights

Questions: `rain-headlights-1`, `rain-headlights-2`. PDF pages: [75](NC_DRIVER_HANDBOOK.md#pdf-page-75). Printed pages: 73.

Supported by the windshield-wipers/headlights section on printed page 73.

Review changes: Rewrote one correct answer so it answers the 'when' stem directly and labeled the rule as required.

Figure check: No figure needed; reviewed the weather text on PDF page 75.

### first-rain

Questions: `first-rain-1`, `first-rain-2`. PDF pages: [74](NC_DRIVER_HANDBOOK.md#pdf-page-74). Printed pages: 72.

Supported by the rain section on printed page 72.

Review changes: Rewrote one correct answer to answer the 'why' stem directly and added the handbook's 10-15 minute qualifier.

Figure check: No figure needed; reviewed the rain text on PDF page 74.

### hydroplaning

Questions: `hydroplaning-1`, `hydroplaning-2`. PDF pages: [74](NC_DRIVER_HANDBOOK.md#pdf-page-74). Printed pages: 72.

Supported by the hydroplaning section on printed page 72.

Review changes: Kept the answer and revised hints to the handbook's recovery wording.

Figure check: No figure needed; reviewed the hydroplaning text on PDF page 74.

### wet-brakes

Questions: `wet-brakes-1`, `wet-brakes-2`. PDF pages: [77](NC_DRIVER_HANDBOOK.md#pdf-page-77). Printed pages: 75.

Supported by the wet-brakes instructions on printed page 75.

Review changes: Kept the answer and replaced generic hints with the source's friction/heat explanation.

Figure check: No figure needed; reviewed the emergency text on PDF page 77.

### rear-skid

Questions: `rear-skid-1`, `rear-skid-2`. PDF pages: [79](NC_DRIVER_HANDBOOK.md#pdf-page-79). Printed pages: 77.

Supported by the skid-recovery instructions on printed page 77.

Review changes: Kept the answer and added the return-steering qualifier to the summary.

Figure check: Rendered PDF page 79. The skid instructions are highlighted text; no separate skid diagram is present.

### follow-two-seconds

Questions: `follow-two-seconds-1`, `follow-two-seconds-2`. PDF pages: [56](NC_DRIVER_HANDBOOK.md#pdf-page-56). Printed pages: 54.

Supported by the following section on printed page 54.

Review changes: Kept the answer and replaced generic hints with the fixed-point measurement method.

Figure check: No figure needed; reviewed the following-distance text on PDF page 56.

### wet-following

Questions: `wet-following-1`, `wet-following-2`. PDF pages: [74](NC_DRIVER_HANDBOOK.md#pdf-page-74). Printed pages: 72.

Supported by the rain section on printed page 72.

Review changes: Expanded the summary to include the handbook's two-to-10-times stopping-distance qualifier.

Figure check: No figure needed; reviewed the rain text on PDF page 74.

### city-speed

Questions: `city-speed-1`, `city-speed-2`. PDF pages: [55](NC_DRIVER_HANDBOOK.md#pdf-page-55). Printed pages: 53.

Supported by the speed-limit text and table on printed page 53.

Review changes: Kept the answer and replaced generic hints with a table-specific hint.

Figure check: Rendered PDF page 55. The maximum-speed table confirms 35 mph for cities and towns.

### stopping-distance-55

Questions: `stopping-distance-55-1`, `stopping-distance-55-2`. PDF pages: [55](NC_DRIVER_HANDBOOK.md#pdf-page-55). Printed pages: 53.

Supported by the speed section on printed page 53.

Review changes: Kept the answer and clarified in hints/summary that the 211 feet is approximate and ideal-condition.

Figure check: Rendered PDF page 55. There is no stopping-distance chart on this page; the 211-foot claim appears as body text.

### motorcycle-pass

Questions: `motorcycle-pass-1`, `motorcycle-pass-2`. PDF pages: [94](NC_DRIVER_HANDBOOK.md#pdf-page-94). Printed pages: 92.

Supported by the motorcycles-and-mopeds section on printed page 92.

Review changes: Rewrote one correct answer so it answers a 'how should you pass' stem without beginning with 'No.'

Figure check: No figure needed; reviewed the motorcycle text on PDF page 94.

### bicycle-pass

Questions: `bicycle-pass-1`, `bicycle-pass-2`. PDF pages: [92](NC_DRIVER_HANDBOOK.md#pdf-page-92). Printed pages: 90.

Supported by the bicycle pass-with-care section on printed page 90.

Review changes: Added 'no oncoming traffic in the opposing lane' to the correct answer/summary and replaced generic hints.

Figure check: No figure needed; reviewed the bicycle passing text on PDF page 92.

### wrong-way-edge-lines

Questions: `wrong-way-edge-lines-1`, `wrong-way-edge-lines-2`. PDF pages: [90](NC_DRIVER_HANDBOOK.md#pdf-page-90). Printed pages: 88.

Supported by the pavement-markings section on printed page 88.

Review changes: Kept the answer and replaced generic hints with the color-position rule.

Figure check: Rendered PDF page 90. The page includes a pavement-marking diagram for two-way left-turn lanes and the adjacent text confirms the edge-line wrong-way rule.

### red-reflectors

Questions: `red-reflectors-1`, `red-reflectors-2`. PDF pages: [90](NC_DRIVER_HANDBOOK.md#pdf-page-90). Printed pages: 88.

Supported by the pavement-markings section on printed page 88.

Review changes: Kept the answer and made the hint distinguish red wrong-way markers from blue fire-supply markers.

Figure check: Rendered PDF page 90. The relevant red/blue marker claim is text on the rendered page; no separate reflector figure is present.

- red-reflectors-2: made the relevant vehicle, signal, or roadway condition explicit in the stem.

### sign-stop

Questions: `sign-stop-1`, `sign-stop-2`. PDF pages: [88](NC_DRIVER_HANDBOOK.md#pdf-page-88). Printed pages: 86.

Confirmed against current handbook figure; existing meaning, choices, feedback, key, and local artwork are defensible.

Review changes: Updated source citation from the older standalone sign sheet to the current handbook page and replaced the generic hint with a sign-recognition hint; no factual or key changes.

Figure check: Official page 88 shows the red octagonal STOP sign; local SVG renders as a red octagon with STOP text and matches the recognizable shape and legend.

### sign-yield

Questions: `sign-yield-1`, `sign-yield-2`. PDF pages: [88](NC_DRIVER_HANDBOOK.md#pdf-page-88). Printed pages: 86.

Confirmed against current handbook figure; existing meaning, choices, feedback, key, and local artwork are defensible.

Review changes: Updated source citation from the older standalone sign sheet to the current handbook page and replaced the generic hint with a sign-recognition hint; no factual or key changes.

Figure check: Official page 88 shows the red-and-white downward triangle YIELD sign; local SVG renders the same shape and legend.

### sign-do-not-enter

Questions: `sign-do-not-enter-1`, `sign-do-not-enter-2`. PDF pages: [88](NC_DRIVER_HANDBOOK.md#pdf-page-88). Printed pages: 86.

Confirmed against current handbook figure; existing meaning, choices, feedback, key, and local artwork are defensible.

Review changes: Updated source citation from the older standalone sign sheet to the current handbook page and replaced the generic hint with a sign-recognition hint; no factual or key changes.

Figure check: Official page 88 shows DO NOT ENTER with a red circle and white horizontal bar on a white rectangle; local SVG renders the same elements.

- sign-do-not-enter-1: independently reviewed and corrected for precise scope, safety instruction, or stem/choice alignment.
- sign-do-not-enter-2: independently reviewed and corrected for precise scope, safety instruction, or stem/choice alignment.

### sign-no-left

Questions: `sign-no-left-1`, `sign-no-left-2`. PDF pages: [88](NC_DRIVER_HANDBOOK.md#pdf-page-88). Printed pages: 86.

Confirmed against current handbook figure; existing meaning, choices, feedback, key, and local artwork are defensible.

Review changes: Updated source citation from the older standalone sign sheet to the current handbook page and replaced the generic hint with a sign-recognition hint; no factual or key changes.

Figure check: Official page 88 shows a left-turn arrow crossed by a red circle and slash; local SVG renders the same prohibited movement.

### sign-no-uturn

Questions: `sign-no-uturn-1`, `sign-no-uturn-2`. PDF pages: [88](NC_DRIVER_HANDBOOK.md#pdf-page-88). Printed pages: 86.

Confirmed against current handbook figure; existing meaning, choices, feedback, key, and local artwork are defensible.

Review changes: Updated source citation from the older standalone sign sheet to the current handbook page and replaced the generic hint with a sign-recognition hint; no factual or key changes.

Figure check: Official page 88 shows the No U Turns symbol with a U-turn arrow crossed by a red circle and slash; local SVG renders the same prohibited movement.

### sign-left-only

Questions: `sign-left-only-1`, `sign-left-only-2`. PDF pages: [88](NC_DRIVER_HANDBOOK.md#pdf-page-88). Printed pages: 86.

Confirmed against current handbook figure; existing meaning, choices, feedback, key, and local artwork are defensible.

Review changes: Updated source citation from the older standalone sign sheet to the current handbook page and replaced the generic hint with a sign-recognition hint; no factual or key changes.

Figure check: Official page 88 labels this sign Left Turn Only, with a left-turn arrow and ONLY; local SVG renders the arrow and ONLY text.

### sign-straight-left

Questions: `sign-straight-left-1`, `sign-straight-left-2`. PDF pages: [88](NC_DRIVER_HANDBOOK.md#pdf-page-88). Printed pages: 86.

Confirmed against current handbook figure; minor wording/label mismatch corrected.

Review changes: Updated source citation to the current handbook page; aligned title, summary, feedback, and asset description with the handbook label THRU & LEFT; replaced generic sign hints.

Figure check: Official page 88 labels this sign Thru & Left, with a through arrow and a left branch; local SVG renders that combined movement symbol.

### sign-keep-right

Questions: `sign-keep-right-1`, `sign-keep-right-2`. PDF pages: [88](NC_DRIVER_HANDBOOK.md#pdf-page-88). Printed pages: 86.

Confirmed against current handbook figure; existing meaning, choices, feedback, key, and local artwork are defensible.

Review changes: Updated source citation from the older standalone sign sheet to the current handbook page and replaced the generic hint with a sign-recognition hint; no factual or key changes.

Figure check: Official page 88 shows Keep Right with the arrow passing to the right of the divider; local SVG renders the same direction around the divider.

### sign-one-way

Questions: `sign-one-way-1`, `sign-one-way-2`. PDF pages: [88](NC_DRIVER_HANDBOOK.md#pdf-page-88). Printed pages: 86.

Confirmed against current handbook figure; existing meaning, choices, feedback, key, and local artwork are defensible.

Review changes: Updated source citation from the older standalone sign sheet to the current handbook page and replaced the generic hint with a sign-recognition hint; no factual or key changes.

Figure check: Official page 88 includes a black ONE WAY sign with a right-pointing arrow; local SVG renders a right-pointing ONE WAY sign.

### sign-no-pass

Questions: `sign-no-pass-1`, `sign-no-pass-2`. PDF pages: [88](NC_DRIVER_HANDBOOK.md#pdf-page-88). Printed pages: 86.

Confirmed against current handbook figure; existing meaning, choices, feedback, key, and local artwork are defensible.

Review changes: Updated source citation from the older standalone sign sheet to the current handbook page and replaced the generic hint with a sign-recognition hint; no factual or key changes.

Figure check: Official page 88 shows a white DO NOT PASS sign; local SVG renders the same legend.

### sign-keep-off-median

Questions: `sign-keep-off-median-1`, `sign-keep-off-median-2`. PDF pages: [88](NC_DRIVER_HANDBOOK.md#pdf-page-88). Printed pages: 86.

Confirmed against current handbook figure; existing meaning, choices, feedback, key, and local artwork are defensible.

Review changes: Updated source citation from the older standalone sign sheet to the current handbook page and replaced the generic hint with a sign-recognition hint; no factual or key changes.

Figure check: Official page 88 shows KEEP OFF MEDIAN; local SVG renders the same legend.

### sign-no-stop-tracks

Questions: `sign-no-stop-tracks-1`, `sign-no-stop-tracks-2`. PDF pages: [88](NC_DRIVER_HANDBOOK.md#pdf-page-88). Printed pages: 86.

Confirmed against current handbook figure; existing meaning, choices, feedback, key, and local artwork are defensible.

Review changes: Updated source citation from the older standalone sign sheet to the current handbook page and replaced the generic hint with a sign-recognition hint; no factual or key changes.

Figure check: Official page 88 shows DO NOT STOP ON TRACKS and the text below states it reminds drivers not to stop on the railroad track for any reason; local SVG renders the same legend.

### sign-rr-ahead

Questions: `sign-rr-ahead-1`, `sign-rr-ahead-2`. PDF pages: [89](NC_DRIVER_HANDBOOK.md#pdf-page-89). Printed pages: 87.

Confirmed against current handbook figure; existing meaning, choices, feedback, key, and local artwork are defensible.

Review changes: Updated source citation from the older standalone sign sheet to the current handbook page and replaced the generic hint with a sign-recognition hint; no factual or key changes.

Figure check: Official page 89 labels the yellow circular RR/X sign Railroad Crossing; local SVG renders a yellow circle with black crossbuck and R R letters.

### sign-no-passing-zone

Questions: `sign-no-passing-zone-1`, `sign-no-passing-zone-2`. PDF pages: [89](NC_DRIVER_HANDBOOK.md#pdf-page-89). Printed pages: 87.

Confirmed against current handbook figure; existing meaning, choices, feedback, key, and local artwork are defensible.

Review changes: Updated source citation from the older standalone sign sheet to the current handbook page and replaced the generic hint with a sign-recognition hint; no factual or key changes.

Figure check: Official page 89 shows a yellow pennant labeled NO PASSING ZONE; local SVG renders the same pennant and legend.

### sign-stop-ahead

Questions: `sign-stop-ahead-1`, `sign-stop-ahead-2`. PDF pages: [89](NC_DRIVER_HANDBOOK.md#pdf-page-89). Printed pages: 87.

Confirmed against current handbook figure; existing meaning, choices, feedback, key, and local artwork are defensible.

Review changes: Updated source citation from the older standalone sign sheet to the current handbook page and replaced the generic hint with a sign-recognition hint; no factual or key changes.

Figure check: Official page 89 shows Stop Ahead as a yellow diamond with an arrow over a red octagon; local SVG renders the same warning symbol.

### sign-signal-ahead

Questions: `sign-signal-ahead-1`, `sign-signal-ahead-2`. PDF pages: [89](NC_DRIVER_HANDBOOK.md#pdf-page-89). Printed pages: 87.

Confirmed against current handbook figure; existing meaning, choices, feedback, key, and local artwork are defensible.

Review changes: Updated source citation from the older standalone sign sheet to the current handbook page and replaced the generic hint with a sign-recognition hint; no factual or key changes.

Figure check: Official page 89 shows Signal Ahead as a yellow diamond with a traffic signal; local SVG renders the signal colors inside a yellow diamond.

### sign-merge

Questions: `sign-merge-1`, `sign-merge-2`. PDF pages: [89](NC_DRIVER_HANDBOOK.md#pdf-page-89). Printed pages: 87.

Confirmed against current handbook figure; existing meaning, choices, feedback, key, and local artwork are defensible.

Review changes: Updated source citation from the older standalone sign sheet to the current handbook page and replaced the generic hint with a sign-recognition hint; no factual or key changes.

Figure check: Official page 89 labels the joining-arrow warning Merging Traffic; local SVG renders a branch joining the through movement.

### sign-lane-drop

Questions: `sign-lane-drop-1`, `sign-lane-drop-2`. PDF pages: [89](NC_DRIVER_HANDBOOK.md#pdf-page-89). Printed pages: 87.

Confirmed against current handbook figure; existing meaning, choices, feedback, key, and local artwork are defensible.

Review changes: Updated source citation from the older standalone sign sheet to the current handbook page and replaced the generic hint with a sign-recognition hint; no factual or key changes.

Figure check: Official page 89 labels the tapering lane symbol Lane Drop; local SVG renders the same lane-ending geometry.

### sign-two-way

Questions: `sign-two-way-1`, `sign-two-way-2`. PDF pages: [89](NC_DRIVER_HANDBOOK.md#pdf-page-89). Printed pages: 87.

Confirmed against current handbook figure; existing meaning, choices, feedback, key, and local artwork are defensible.

Review changes: Updated source citation from the older standalone sign sheet to the current handbook page and replaced the generic hint with a sign-recognition hint; no factual or key changes.

Figure check: Official page 89 labels opposing up/down arrows Two Way Traffic; local SVG renders opposing vertical arrows.

### sign-soft-shoulder

Questions: `sign-soft-shoulder-1`, `sign-soft-shoulder-2`. PDF pages: [89](NC_DRIVER_HANDBOOK.md#pdf-page-89). Printed pages: 87.

Confirmed against current handbook figure; existing meaning, choices, feedback, key, and local artwork are defensible.

Review changes: Updated source citation from the older standalone sign sheet to the current handbook page and replaced the generic hint with a sign-recognition hint; no factual or key changes.

Figure check: Official page 89 shows SOFT SHOULDER text on a yellow diamond; local SVG renders the same legend.

### sign-low-clearance

Questions: `sign-low-clearance-1`, `sign-low-clearance-2`. PDF pages: [89](NC_DRIVER_HANDBOOK.md#pdf-page-89). Printed pages: 87.

Confirmed against current handbook figure; minor wording/label mismatch corrected.

Review changes: Updated source citation to the current handbook page; corrected wording to vertical clearance and asset description to the official 12'-6" notation; replaced generic sign hints.

Figure check: Official page 89 shows Low Clearance with vertical arrows and 12'-6"; local SVG renders the same symbol and posted height.

### sign-crossroad

Questions: `sign-crossroad-1`, `sign-crossroad-2`. PDF pages: [89](NC_DRIVER_HANDBOOK.md#pdf-page-89). Printed pages: 87.

Confirmed against current handbook figure; minor wording/label mismatch corrected.

Review changes: Updated source citation to the current handbook page; aligned title, summary, answer text, feedback, and tags with the handbook label Cross Road; replaced generic sign hints.

Figure check: Official page 89 labels the black cross on a yellow diamond Cross Road; local SVG renders the same cross symbol.

