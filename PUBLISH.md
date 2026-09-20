# Publish Road Ready in the-projects-i-tried

This repository is published at [the-projects-i-tried/nc-road-ready](https://github.com/the-projects-i-tried/nc-road-ready), with [GitHub Pages](https://the-projects-i-tried.github.io/nc-road-ready/) deploying from `main`. For an existing clone, validate changes, commit, and push to its configured remote. The initial-setup instructions below apply only to a new unversioned copy; do not recreate the repository or reinitialize an existing clone.

## 1. Verify locally

```sh
cd /path/to/nc-road-ready
npm run check
npm start
```

Open `http://127.0.0.1:8080`, then stop the server with Control-C. Review the content-status notice and [source records](docs/SOURCES.md) before describing the site publicly. Newly added material still requires its own source review.

## 2. Create and push an empty repository

In GitHub, create **an empty public repository** named `nc-road-ready` owned by `the-projects-i-tried`. Do not initialize it with a README, license, or gitignore; those files are already in this bundle.

Then run:

```sh
git init -b main
git add .
git commit -m "Add Road Ready adaptive practice game"
git remote add origin https://github.com/the-projects-i-tried/nc-road-ready.git
git push -u origin main
```

Use your normal GitHub authentication flow. Do not put an access token in these files, a remote URL, or the website. The commands assume you are starting from this unversioned bundle; do not rerun `git remote add` inside an existing clone.

An optional GitHub CLI alternative, after the local commit and with the CLI already authenticated, is:

```sh
gh repo create the-projects-i-tried/nc-road-ready --public --source=. --remote=origin --push
```

Use either the browser-created-repository route or the CLI route, not both.

## 3. Enable GitHub Pages

In the new repository, open **Settings → Pages → Build and deployment → Source**, and select **GitHub Actions**. The deploy workflow is included at `.github/workflows/pages.yml`.

The first push may have attempted deployment before Pages was enabled. After choosing the source, open **Actions → Deploy Pages → Run workflow** on `main`, or rerun the failed workflow. A successful deployment supplies the actual site URL in the Pages settings and workflow output.

The intended address is:

```text
https://the-projects-i-tried.github.io/nc-road-ready/
```

An organization policy can require extra approval or restrict allowed Actions. Only an authorized organization administrator can change those settings. The workflow has no personal token: GitHub supplies the deployment token and OIDC identity for the Pages job.

## 4. Add a link to the shared front page

Add a project entry to the existing organization front-page repository. For plain HTML, the essential link is:

```html
<a href="/nc-road-ready/">Road Ready — North Carolina driving practice</a>
```

The project uses relative CSS, script, and image paths, so it works under `/nc-road-ready/` without changing a base URL. It does not replace the organization's front page and does not need a repository named `nc-road-ready.github.io`.

For an embedded view rather than a normal link:

```html
<iframe
  src="/nc-road-ready/?embed=1"
  title="Road Ready: North Carolina driving practice"
  loading="lazy"
  style="width:100%;height:1000px;border:0">
</iframe>
```

A regular link provides more room on a phone. The iframe is a convenience, not required for deployment. To put the app in a folder of the front-page repository instead, copy the **contents** of `site/` into that folder and use the front page's deployment mechanism; keep this repository as the editable source.

## Updates and moving your local copy

After modifying `content/core.json` or adding packs, run `npm run build` and `npm run check`, commit the generated `site/js/bank.js` together with the data, and push. The Pages workflow redeploys from `main`.

Once the first push has succeeded, the local directory is not the website's server. You may move the entire local repository wherever you work, or delete it and later clone:

```sh
git clone https://github.com/the-projects-i-tried/nc-road-ready.git
```

Do not delete uncommitted or unpushed changes. Browser session progress is not stored in the repository; save a session report separately when needed.

## Troubleshooting

**Blank screen:** keep `site/` intact and run `npm run build`; check the browser console. Serve it with `npm start` rather than relying on a restrictive local-file policy.

**404:** verify that Pages is set to GitHub Actions, that the deploy job succeeded, and that the path contains the repository name.

**Stale-bank CI failure:** run `npm run build`, then commit the changed generated bundle.

**No questions for a request:** that is not a deployment failure. Broaden the topic/level, permit review explicitly, or add an authored pack. A topic can exhaust its finite fresh variants.

Official GitHub references, checked when assembling this bundle:
- https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
- https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
