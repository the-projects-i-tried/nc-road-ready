#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const cp = require('node:child_process');
const {parseSubmissionJSON, formatSubmissionJSON, MAX_SUBMISSION_BYTES, byteLength} = require('../site/js/submission.js');

const OWNER = 'the-projects-i-tried';
const REPO = 'nc-road-ready';
const BASE_BRANCH = 'main';
const SUBMISSION_LABEL = 'question-pack';
const STATUS_CONTEXT = 'Build and tests';
const BODY_LIMIT_BYTES = MAX_SUBMISSION_BYTES + 12000;
const ROOT = path.resolve(__dirname, '..');
const ALLOWED_STATIC_FILES = new Set(['site/js/bank.js', 'docs/CONTENT_REVIEW.md']);
const ACTIONS_SETTINGS_DOC = 'https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository';

function loadEvent(file = process.env.GITHUB_EVENT_PATH) {
  if (!file) throw new Error('GITHUB_EVENT_PATH is required.');
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function hasSubmissionLabel(issue) {
  return Array.isArray(issue?.labels) && issue.labels.some(label => (typeof label === 'string' ? label : label?.name) === SUBMISSION_LABEL);
}

function branchForIssue(number) {
  const n = Number(number);
  if (!Number.isInteger(n) || n <= 0) throw new Error('Issue number is required.');
  return `submission/issue-${n}`;
}

function extractSubmissionJSON(body) {
  if (typeof body !== 'string') throw new Error('Issue body is missing.');
  if (byteLength(body) > BODY_LIMIT_BYTES) throw new Error(`Issue body exceeds ${BODY_LIMIT_BYTES} bytes.`);
  const matches = [...body.matchAll(/```([^\n`]*)\r?\n([\s\S]*?)```/g)];
  if (matches.length !== 1) throw new Error('Submit exactly one fenced JSON code block.');
  const language = matches[0][1].trim().toLowerCase();
  if (language && language !== 'json') throw new Error('The fenced code block must be labeled json or left unlabeled.');
  const json = matches[0][2].trim();
  if (!json) throw new Error('The JSON code block is empty.');
  if (byteLength(json) > MAX_SUBMISSION_BYTES) throw new Error(`Submission JSON exceeds ${MAX_SUBMISSION_BYTES} bytes.`);
  return json;
}

function loadCurrentBank() {
  cp.execFileSync(process.execPath, [path.join(ROOT, 'scripts/build.cjs')], {cwd: ROOT, stdio: 'inherit', env: trustedSubprocessEnv()});
  const context = {window: {}};
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'site/js/bank.js'), 'utf8'), context);
  return context.window.ROAD_READY_BANK;
}

function parseIssueSubmission(issueBody, bank) {
  return parseSubmissionJSON(extractSubmissionJSON(issueBody), bank);
}

function runTrustedBuild(submission) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'road-ready-submission-'));
  const file = path.join(dir, 'pack.json');
  fs.writeFileSync(file, formatSubmissionJSON(submission));
  cp.execFileSync(process.execPath, [path.join(ROOT, 'scripts/add-pack.cjs'), file], {cwd: ROOT, stdio: 'inherit', env: trustedSubprocessEnv()});
  cp.execFileSync('npm', ['run', 'check'], {cwd: ROOT, stdio: 'inherit', env: trustedSubprocessEnv()});
}

function trustedSubprocessEnv() {
  const env = {...process.env};
  delete env.GITHUB_TOKEN;
  delete env.GH_TOKEN;
  return env;
}

function changedFiles() {
  const output = cp.execFileSync('git', ['status', '--porcelain=v1', '-z'], {cwd: ROOT, encoding: 'utf8'});
  const entries = output.split('\0').filter(Boolean);
  const files = [];
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const status = entry.slice(0, 2);
    const file = entry.slice(3);
    if (status.includes('R') || status.includes('C')) {
      i++;
      if (entries[i]) files.push(entries[i]);
    } else {
      files.push(file);
    }
  }
  return files.sort();
}

function expectedFiles(packId) {
  return [`content/packs/${packId}.json`, 'docs/CONTENT_REVIEW.md', 'site/js/bank.js'].sort();
}

function assertRegularFile(file, root = ROOT) {
  const full = path.join(root, file);
  const relative = path.relative(root, full);
  if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error(`Changed path escapes repository: ${file}`);
  const stat = fs.lstatSync(full);
  if (!stat.isFile() || stat.isSymbolicLink()) throw new Error(`Changed path is not a regular file: ${file}`);
}

function assertAllowedChangedFiles(files, packId, root = ROOT) {
  const expected = expectedFiles(packId);
  const allowed = new Set([...ALLOWED_STATIC_FILES, `content/packs/${packId}.json`]);
  const unexpected = files.filter(file => !allowed.has(file));
  if (unexpected.length) throw new Error(`Unexpected changed files: ${unexpected.join(', ')}`);
  for (const file of expected) {
    if (!files.includes(file)) throw new Error(`Expected generated change is missing: ${file}`);
    assertRegularFile(file, root);
  }
}

function safeMessage(error) {
  return String(error?.message || error || 'Unknown error')
    .replace(/@/g, '[at]')
    .replace(/```/g, "'''")
    .replace(/[^\x20-\x7e\n]/g, '?')
    .replace(/[^a-zA-Z0-9 .,:;_/\-\n()[\]]/g, '?')
    .slice(0, 1800);
}

function buildIssueComment(kind, details = {}) {
  if (kind === 'invalid') return `Question pack submission could not be accepted.\n\nReason:\n${safeMessage(details.error)}\n\nEdit this issue with one valid fenced JSON code block to retry.`;
  if (kind === 'existing') return `A pull request already exists for this issue: ${details.url || details.branch}. No files were changed or revalidated. To submit a different snapshot, open a new issue.`;
  if (kind === 'created') return `Question pack submission validated and a pull request was opened: ${details.url}\n\nThe pack remains source-review pending. It still needs native repository checks and owner review before merge.`;
  if (kind === 'setup') return `Question pack submission validated, but automation could not open the pull request yet.\n\nAn owner may need to enable the repository or organization setting that allows GitHub Actions to create pull requests: ${ACTIONS_SETTINGS_DOC}\n\nAfter that setting is enabled, edit this issue to retry. The existing immutable submission branch will be reused without changing its commit snapshot.`;
  if (kind === 'stale') return 'Question pack automation found an existing submission branch for this issue, but it could not safely verify that branch as the current trusted bot snapshot.\n\nNo pull request was opened. Close this issue and prepare a new submission against the latest bank.';
  throw new Error(`Unknown comment kind: ${kind}`);
}

function buildPullRequestText(issue, submission) {
  const hasPackId = submission?.packId && /^[a-z0-9][a-z0-9_-]{0,95}$/.test(submission.packId);
  const subject = hasPackId ? `question pack \`${submission.packId}\`` : `question pack submission from #${issue.number}`;
  const title = hasPackId ? `Add question pack ${submission.packId}` : `Add question pack from issue #${issue.number}`;
  const body = [
    `Adds unverified ${subject}.`,
    '',
    'This PR was generated from a public issue by trusted default-branch automation. The submitted JSON was normalized, forced to `needs-source-review`, built with the current bank, and checked before this branch was created.',
    '',
    'Only content-pack source, the generated bank, and the generated review inventory should change here. The pack still needs owner review and any required native repository checks before merge.',
    '',
    'If this branch is manually pushed after creation, the native Check workflow and owner review must be repeated for the new head before merge.'
  ].join('\n');
  return {title, body};
}

function apiClient(token = process.env.GITHUB_TOKEN, fetchImpl = globalThis.fetch) {
  if (!token) throw new Error('GITHUB_TOKEN is required.');
  if (typeof fetchImpl !== 'function') throw new Error('fetch is required.');
  const root = `https://api.github.com/repos/${OWNER}/${REPO}`;
  async function request(method, endpoint, body) {
    const response = await fetchImpl(`${root}${endpoint}`, {
      method,
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28'
      },
      body: body === undefined ? undefined : JSON.stringify(body)
    });
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;
    if (!response.ok) {
      const message = data?.message || text || `${method} ${endpoint} failed`;
      const error = new Error(message);
      error.status = response.status;
      error.data = data;
      throw error;
    }
    return data;
  }
  return {
    get: endpoint => request('GET', endpoint),
    post: (endpoint, body) => request('POST', endpoint, body)
  };
}

async function refExists(api, branch) {
  try {
    return await api.get(`/git/ref/heads/${branch}`);
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
}

async function existingOpenPr(api, branch) {
  const pulls = await api.get(`/pulls?state=all&head=${OWNER}:${encodeURIComponent(branch)}&base=${BASE_BRANCH}`);
  return pulls[0] || null;
}

async function readGithubFile(api, sha, file) {
  const result = await api.get(`/contents/${file}?ref=${sha}`);
  if (result.type !== 'file' || result.encoding !== 'base64' || typeof result.content !== 'string') throw new Error(`Could not read ${file} from ${sha}.`);
  return Buffer.from(result.content, 'base64').toString('utf8');
}

function assertRemoteDiffFiles(files) {
  if (!Array.isArray(files) || files.length !== 3) throw new Error('Existing submission branch must change exactly three files.');
  const names = files.map(file => file.filename).sort();
  const packFiles = names.filter(file => /^content\/packs\/[a-z0-9][a-z0-9_-]{0,95}\.json$/.test(file));
  if (packFiles.length !== 1) throw new Error('Existing submission branch must add exactly one safe content pack file.');
  const allowed = new Set([packFiles[0], 'docs/CONTENT_REVIEW.md', 'site/js/bank.js']);
  for (const file of files) {
    if (!allowed.has(file.filename)) throw new Error(`Existing branch changes unexpected file: ${file.filename}`);
    if (file.previous_filename || !['added', 'modified'].includes(file.status)) throw new Error(`Existing branch has unsupported file status: ${file.filename}`);
  }
  if (files.find(file => file.filename === packFiles[0]).status !== 'added') throw new Error('Existing submission branch must add its content pack file.');
  return packFiles[0];
}

function assertRemoteTreeModes(tree, files) {
  if (!Array.isArray(tree?.tree) || tree.truncated) throw new Error('Existing branch tree could not be fully inspected.');
  const entries = new Map(tree.tree.map(entry => [entry.path, entry]));
  for (const file of files) {
    const entry = entries.get(file);
    if (!entry || entry.type !== 'blob' || entry.mode !== '100644') throw new Error(`Existing branch path is not a regular blob: ${file}`);
  }
}

function assertRemoteFileContents(remoteContents, root, files) {
  for (const file of files) {
    const remote = remoteContents instanceof Map ? remoteContents.get(file) : remoteContents[file];
    const local = fs.readFileSync(path.join(root, file), 'utf8');
    if (remote !== local) throw new Error(`Existing branch file does not match trusted regenerated output: ${file}`);
  }
}

async function createPullRequest(api, issue, submission, branch) {
  const text = buildPullRequestText(issue, submission);
  return api.post('/pulls', {title: text.title, body: text.body, head: branch, base: BASE_BRANCH, maintainer_can_modify: false});
}

async function createCommitFromFiles(api, baseSha, files, message) {
  const baseCommit = await api.get(`/git/commits/${baseSha}`);
  const tree = await api.post('/git/trees', {
    base_tree: baseCommit.tree.sha,
    tree: files.map(file => ({
      path: file,
      mode: '100644',
      type: 'blob',
      content: fs.readFileSync(path.join(ROOT, file), 'utf8')
    }))
  });
  const commit = await api.post('/git/commits', {message, tree: tree.sha, parents: [baseSha]});
  return commit;
}

async function createBranchRef(api, branch, sha) {
  await api.post('/git/refs', {ref: `refs/heads/${branch}`, sha});
  return sha;
}

async function validateExistingBranchSnapshot(api, existingRef, branch, checkHead = true) {
  const sha = existingRef.object?.sha;
  if (!sha) throw new Error('Existing branch ref has no commit SHA.');
  const mainRef = await api.get(`/git/ref/heads/${BASE_BRANCH}`);
  const baseSha = mainRef.object.sha;
  if (checkHead) {
    const localHead = cp.execFileSync('git', ['rev-parse', 'HEAD'], {cwd: ROOT, encoding: 'utf8'}).trim();
    if (localHead !== baseSha) throw new Error(`Trusted checkout HEAD ${localHead} does not match remote ${BASE_BRANCH} ${baseSha}.`);
  }
  const commit = await api.get(`/git/commits/${sha}`);
  if (!Array.isArray(commit.parents) || commit.parents.length !== 1 || commit.parents[0].sha !== baseSha) throw new Error('Existing submission branch is not a single-commit snapshot of current main.');
  const compare = await api.get(`/compare/${baseSha}...${sha}`);
  if (compare.total_commits !== 1) throw new Error('Existing submission branch compare did not find exactly one commit.');
  const packFile = assertRemoteDiffFiles(compare.files);
  const expectedPackId = path.basename(packFile, '.json');
  const expected = expectedFiles(expectedPackId);
  if (JSON.stringify(compare.files.map(file => file.filename).sort()) !== JSON.stringify(expected)) throw new Error('Existing submission branch file set does not match its pack id.');
  const tree = await api.get(`/git/trees/${commit.tree.sha}?recursive=1`);
  assertRemoteTreeModes(tree, expected);
  const packText = await readGithubFile(api, sha, packFile);
  const normalized = parseSubmissionJSON(packText, loadCurrentBank());
  if (packFile !== `content/packs/${normalized.packId}.json`) throw new Error('Existing submission branch pack filename does not match normalized pack id.');
  runTrustedBuild(normalized);
  assertAllowedChangedFiles(changedFiles(), normalized.packId);
  const remoteContents = new Map();
  for (const file of expected) remoteContents.set(file, await readGithubFile(api, sha, file));
  assertRemoteFileContents(remoteContents, ROOT, expected);
  return {sha, submission: normalized};
}

async function setRepositoryValidationStatus(api, sha, targetUrl) {
  return api.post(`/statuses/${sha}`, {
    state: 'success',
    context: STATUS_CONTEXT,
    description: 'Trusted build and tests passed.',
    target_url: targetUrl
  });
}

async function commentOnIssue(api, issueNumber, body) {
  return api.post(`/issues/${issueNumber}/comments`, {body});
}

async function handleSubmission({event = loadEvent(), api = apiClient(), checkHead = true} = {}) {
  const issue = event.issue;
  if (!issue?.number) throw new Error('This workflow must run from an issue event.');
  if (event.repository?.full_name !== `${OWNER}/${REPO}`) throw new Error(`Unexpected repository: ${event.repository?.full_name || 'unknown'}`);
  if (!hasSubmissionLabel(issue)) {
    return {outcome: 'ignored'};
  }

  const branch = branchForIssue(issue.number);
  const existingRef = await refExists(api, branch);
  if (existingRef) {
    let pr = await existingOpenPr(api, branch);
    if (pr) {
      await commentOnIssue(api, issue.number, buildIssueComment('existing', {branch, url: pr.html_url}));
      return {outcome: 'existing', branch, pr: pr.html_url};
    }
    let verified;
    try {
      verified = await validateExistingBranchSnapshot(api, existingRef, branch, checkHead);
    } catch (error) {
      await commentOnIssue(api, issue.number, buildIssueComment('stale', {error}));
      throw error;
    }
    try {
      await setRepositoryValidationStatus(api, verified.sha, process.env.GITHUB_SERVER_URL && process.env.GITHUB_REPOSITORY && process.env.GITHUB_RUN_ID ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}` : issue.html_url);
      pr = await createPullRequest(api, issue, verified.submission, branch);
    } catch (error) {
      await commentOnIssue(api, issue.number, buildIssueComment('setup', {error}));
      throw error;
    }
    await commentOnIssue(api, issue.number, buildIssueComment('created', {url: pr.html_url}));
    return {outcome: 'created-from-existing', branch, pr: pr.html_url, sha: verified.sha};
  }

  let submission;
  let branchCreated = false;
  try {
    submission = parseIssueSubmission(issue.body || '', loadCurrentBank());
    runTrustedBuild(submission);
    const files = changedFiles();
    assertAllowedChangedFiles(files, submission.packId);
    const mainRef = await api.get(`/git/ref/heads/${BASE_BRANCH}`);
    const baseSha = mainRef.object.sha;
    if (checkHead) {
      const localHead = cp.execFileSync('git', ['rev-parse', 'HEAD'], {cwd: ROOT, encoding: 'utf8'}).trim();
      if (localHead !== baseSha) throw new Error(`Trusted checkout HEAD ${localHead} does not match remote ${BASE_BRANCH} ${baseSha}.`);
    }
    const commit = await createCommitFromFiles(api, baseSha, files, `Add question pack ${submission.packId}\n\nFrom issue #${issue.number}.`);
    await setRepositoryValidationStatus(api, commit.sha, process.env.GITHUB_SERVER_URL && process.env.GITHUB_REPOSITORY && process.env.GITHUB_RUN_ID ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}` : issue.html_url);
    await createBranchRef(api, branch, commit.sha);
    branchCreated = true;
    const pr = await createPullRequest(api, issue, submission, branch);
    await commentOnIssue(api, issue.number, buildIssueComment('created', {url: pr.html_url}));
    return {outcome: 'created', branch, pr: pr.html_url, sha: commit.sha};
  } catch (error) {
    await commentOnIssue(api, issue.number, buildIssueComment(branchCreated ? 'setup' : 'invalid', {error}));
    throw error;
  }
}

if (require.main === module) {
  handleSubmission().catch(error => {
    console.error(safeMessage(error));
    process.exit(1);
  });
}

module.exports = {
  OWNER,
  REPO,
  BASE_BRANCH,
  SUBMISSION_LABEL,
  STATUS_CONTEXT,
  BODY_LIMIT_BYTES,
  ACTIONS_SETTINGS_DOC,
  branchForIssue,
  extractSubmissionJSON,
  parseIssueSubmission,
  expectedFiles,
  assertAllowedChangedFiles,
  assertRegularFile,
  assertRemoteDiffFiles,
  assertRemoteTreeModes,
  assertRemoteFileContents,
  validateExistingBranchSnapshot,
  buildIssueComment,
  buildPullRequestText,
  safeMessage,
  apiClient,
  handleSubmission
};
