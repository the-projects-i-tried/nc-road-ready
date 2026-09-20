# Security

The application is a static site with no credentials, account, backend, or runtime connection endpoint. All imported/user content is rendered as text. Source links and assets are allowlisted; script execution from question packs is not supported. A content security policy restricts scripts/styles to the bundled code and prohibits network connections and form submissions.

Keep secrets and API keys out of this public repository. Do not add an LLM API key to browser JavaScript. Structural pack validation does not certify safety, legal correctness, or originality of the material.

For security defects, use the repository's private vulnerability reporting mechanism if the maintainer enables it. Otherwise contact the maintainer privately through a channel they publish. Do not include live credentials or personal information in public issues. Content inaccuracies without sensitive details can use the question-report issue template.

The Node development server binds only to 127.0.0.1 and is for local preview, not production hosting. GitHub Pages serves only `site/`. GitHub workflow actions execute during CI/deployment rather than in visitors' browsers; organization policies may require additional approval or pinned action revisions.
