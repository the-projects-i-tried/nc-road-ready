# Privacy and session lifetime

Road Ready does not create an account, cookie, tracking identifier, localStorage record, sessionStorage record, analytics event, or service worker. It has no database or runtime API calls. The browser downloads static app files and original illustrations from the chosen host.

Answers, hints, scores, question exposure, and temporary imports live only in the JavaScript state of the current page. A new page or refresh creates a fresh session. Browser back/forward navigation can preserve a live page in a browser cache; explicitly refresh or use “Start a fresh session” when a guaranteed reset is needed.

The app offers manual JSON session-report downloads, authoring-prompt downloads/copying, and issue-report copying. Those actions happen only when selected. Authoring prompts include the actual answers given during the current session and the question catalogue so an external author can avoid repetition. Review the prompt before pasting it into another service; that service has its own data policy.

Imported packs stay in the current page until reset or refresh, unless a maintainer separately adds them to the public repository. Do not put personal information or confidential text into a public pack or issue. No earlier chat scores, personal names, or private conversation history are embedded in the app.

The hosting provider, including GitHub Pages, may maintain ordinary network/access logs. Official-source and GitHub links navigate outside the app. Downloads remain wherever the browser saves them; clearing this session does not delete already downloaded files. Privacy claims here concern app behavior, not all browser, operating-system, extension, or hosting behavior.
