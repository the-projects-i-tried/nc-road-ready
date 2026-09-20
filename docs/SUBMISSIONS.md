# Permanent Question Submissions

Road Ready's permanent-submission design accepts question-pack submissions without giving the browser write access to GitHub and without trusting submitted JSON as executable code. The workflow requires repository and organization Actions permissions that allow trusted workflows to create pull requests. If those permissions are disabled, submitted issues remain public records but the bot pull request will not be created until an owner enables the policy and retries the workflow.

The permanent path is:

1. Prepare and preview a pack in Question lab.
2. Copy the prepared submission JSON.
3. Paste it into the explicit GitHub issue form. A GitHub account is required, and the issue body is public.
4. A trusted issue workflow validates the issue snapshot and opens a bot pull request when repository and organization policy allow it.
5. The repository owner reviews the pull request, verifies the content as needed, and approves before merge.
6. GitHub Pages deploys from `main` after merge.

Session imports are still temporary. A permanent submission does not become part of the public site until it is merged into `main`.

## What Is Submitted

The submission JSON is a question pack, not a session report. It contains authored sources, concepts, questions, choices, hints, feedback, and optional references to already bundled sign illustrations. It does not include answers, scores, hint use, weak areas, or other practice history from the current browser session.

The issue body and pack data are durable public GitHub records. Do not include personal information, private driving history, confidential notes, secrets, access tokens, or anything that should not be public.

## Normalization Rules

Prepared submissions use strict JSON normalization before they are copied:

- Maximum submission JSON size is 50,000 UTF-8 bytes.
- Only known schema fields are accepted.
- Unknown top-level, nested, source, concept, question, choice, and array metadata fields are rejected.
- Source URLs must be the allowed official NCDOT handbook or sign-sheet PDF URLs.
- Optional question assets must reference an illustration already bundled in the current bank.
- Submitted `source-checked` claims are not trusted; concepts and questions are forced to `needs-source-review`.
- Text remains data. Shell-looking strings, HTML-looking strings, and closing `script` text are not executed by the normalizer.

These checks reduce accidental metadata carryover and common injection risks. They do not prove that every possible renderer, tool, or future workflow is immune to all injection attacks, and they do not prove that the driving facts are correct.

## Bot Pull Request Scope

The trusted issue workflow treats the issue-created snapshot as the submission. Later issue edits do not overwrite an existing bot pull request. To revise a submission, open a new issue unless a maintainer asks you to edit the pull request directly.

If PR creation failed after the branch was created, editing the issue retries that saved snapshot. The bot checks its parent against current `main`, its exact file changes, and the regenerated contents again. If `main` advanced or the branch was altered, recovery fails closed; prepare a new submission against the latest bank. A closed PR is linked rather than silently reopened.

For a valid submission, the bot pull request is limited to:

- `content/packs/<packId>.json`
- `site/js/bank.js`
- `docs/CONTENT_REVIEW.md`

The bot does not automatically merge. The pull request still needs repository review, required checks, and owner approval. The bot is not a CODEOWNER and cannot satisfy a required owner review for its own pull request.

## Review And Trust Boundaries

There are two separate reviews:

- **Submission safety review:** checks that the JSON is small, canonical, limited to known fields, references only allowed source URLs and bundled assets, and builds without executing submitted code.
- **Factual source review:** checks the stem, correct choice, every distractor, feedback, hint, source section, page reference, and any figure against the official source.

Passing validation and CI means the pack has the right shape and does not break the generated bank. It is not a factual certification, NCDMV endorsement, legal advice, or a guarantee that the item should be marked source-checked.

## Repository Protections

The intended repository policy is:

- GitHub Pages deploys only from `main`.
- Permanent pack pull requests require `@volfovsky` CODEOWNER review before merge.
- Branch protection requires an owner review, dismisses stale approvals after changes, applies to administrators, and requires the `Build and tests` status.
- Organization and repository workflow permissions must allow GitHub Actions to create pull requests before the issue workflow can open a bot PR.
- The trusted workflow posts validation status after running the repository build and checks.
- Standard pull-request checks are read-only; the trusted `workflow_run` bridge does not execute pull-request code or consume pull-request artifacts.
- GitHub may require the owner to approve a bot pull request's check workflow before it runs, depending on repository policy.
- If the org permission was missing, the existing issue branch can be retried safely after the policy is enabled. Do not use a personal-access-token fallback for pack submissions; an owner-authored pull request still cannot satisfy the owner's required approval.

These protections are repository policy, not browser behavior. The browser does not hold repository credentials, does not call the GitHub API, and does not publish packs directly.

For ordinary code PRs, `Build and tests` reports the normal `Check` workflow result. Those tests execute the proposed code, including any proposed test changes. Owner review must therefore include changes to tests, build scripts, workflows, and this policy. A green check is not a security review. The question-submission workflow is narrower: it runs the existing default-branch validators and accepts only the three listed data/generated files.
