'use strict';

const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const bank = require('../content/core.json');
const submission = require('../scripts/submit-question-pack.cjs');
const {formatSubmissionJSON, MAX_SUBMISSION_BYTES} = require('../site/js/submission.js');

function fixturePack() {
  return {
    schemaVersion: 1,
    packId: 'submission-workflow-pack',
    title: 'Submission workflow fixture',
    sources: {},
    concepts: [{
      id: 'submission-workflow-rule',
      title: 'Submission workflow rule',
      topic: 'signs',
      tags: ['submission workflow fixture'],
      summary: 'A test-only rule used to validate submission automation.',
      sourceId: 'handbook',
      section: 'Test fixture section',
      pdfPage: null,
      reviewStatus: 'source-checked',
      priority: 1
    }],
    questions: [{
      id: 'submission-workflow-question',
      concept: 'submission-workflow-rule',
      difficulty: 1,
      stem: 'Test fixture only: which answer validates the submission workflow?',
      hint: 'Pick the answer that is explicitly marked as the workflow fixture.',
      choices: [
        {id: 'a', text: 'The workflow fixture answer.', feedback: 'This is the intended test fixture answer.'},
        {id: 'b', text: 'A duplicate built-in rule.', feedback: 'The fixture is deliberately separate from built-in rules.'},
        {id: 'c', text: 'A source-checked import.', feedback: 'Submitted content must remain pending review.'},
        {id: 'd', text: 'A browser API call.', feedback: 'Question pack submission is handled by repository automation.'}
      ],
      correctId: 'a',
      reviewStatus: 'source-checked'
    }]
  };
}

function issueBody(json) {
  return `### Question pack JSON\n\n\`\`\`json\n${json}\`\`\`\n\n### Notes\nReviewer note.`;
}

test('issue body parser accepts exactly one JSON fence and forces pending review status', () => {
  const parsed = submission.parseIssueSubmission(issueBody(formatSubmissionJSON(fixturePack())), bank);
  assert.equal(parsed.packId, 'submission-workflow-pack');
  assert.equal(parsed.concepts[0].reviewStatus, 'needs-source-review');
  assert.equal(parsed.questions[0].reviewStatus, 'needs-source-review');
});

test('issue body parser rejects multiple fences, missing fences, wrong languages, and oversized bodies', () => {
  assert.throws(() => submission.extractSubmissionJSON('no code here'), /exactly one/i);
  assert.throws(() => submission.extractSubmissionJSON('```json\n{}\n```\n```json\n{}\n```'), /exactly one/i);
  assert.throws(() => submission.extractSubmissionJSON('```js\n{}\n```'), /json/i);
  assert.throws(() => submission.extractSubmissionJSON(`${'x'.repeat(MAX_SUBMISSION_BYTES + 12001)}\n\`\`\`json\n{}\n\`\`\``), /Issue body exceeds/);
});

test('changed-file policy allows only the generated submission files as regular files', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'road-ready-policy-'));
  for (const file of submission.expectedFiles('submission-workflow-pack')) {
    const full = path.join(dir, file);
    fs.mkdirSync(path.dirname(full), {recursive: true});
    fs.writeFileSync(full, 'fixture\n');
  }
  assert.doesNotThrow(() => submission.assertAllowedChangedFiles(submission.expectedFiles('submission-workflow-pack'), 'submission-workflow-pack', dir));
  assert.throws(() => submission.assertAllowedChangedFiles([...submission.expectedFiles('submission-workflow-pack'), 'scripts/pwn.cjs'], 'submission-workflow-pack', dir), /Unexpected changed files/);
  assert.throws(() => submission.assertAllowedChangedFiles(['content/packs/submission-workflow-pack.json', 'site/js/bank.js'], 'submission-workflow-pack', dir), /missing/);
});

test('changed-file policy rejects symlinked generated paths', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'road-ready-symlink-'));
  for (const file of submission.expectedFiles('submission-workflow-pack')) {
    const full = path.join(dir, file);
    fs.mkdirSync(path.dirname(full), {recursive: true});
    fs.writeFileSync(full, 'fixture\n');
  }
  fs.unlinkSync(path.join(dir, 'site/js/bank.js'));
  fs.symlinkSync(path.join(dir, 'content/packs/submission-workflow-pack.json'), path.join(dir, 'site/js/bank.js'));
  assert.throws(() => submission.assertAllowedChangedFiles(submission.expectedFiles('submission-workflow-pack'), 'submission-workflow-pack', dir), /regular file/);
});

test('existing-branch retry policy rejects extra paths, renamed files, bad modes, and altered generated output', () => {
  const files = [
    {filename: 'content/packs/submission-workflow-pack.json', status: 'added'},
    {filename: 'docs/CONTENT_REVIEW.md', status: 'modified'},
    {filename: 'site/js/bank.js', status: 'modified'}
  ];
  assert.equal(submission.assertRemoteDiffFiles(files), 'content/packs/submission-workflow-pack.json');
  assert.throws(() => submission.assertRemoteDiffFiles([...files, {filename: 'scripts/pwn.cjs', status: 'added'}]), /exactly three files|unexpected/i);
  assert.throws(() => submission.assertRemoteDiffFiles([{filename: 'content/packs/submission-workflow-pack.json', status: 'renamed', previous_filename: 'x'}, files[1], files[2]]), /unsupported file status/);
  assert.throws(() => submission.assertRemoteTreeModes({tree: [{path: files[0].filename, type: 'blob', mode: '120000'}, {path: files[1].filename, type: 'blob', mode: '100644'}, {path: files[2].filename, type: 'blob', mode: '100644'}]}, files.map(file => file.filename)), /regular blob/);

  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'road-ready-remote-compare-'));
  for (const file of files.map(f => f.filename)) {
    const full = path.join(dir, file);
    fs.mkdirSync(path.dirname(full), {recursive: true});
    fs.writeFileSync(full, `${file}\n`);
  }
  const remote = new Map(files.map(file => [file.filename, fs.readFileSync(path.join(dir, file.filename), 'utf8')]));
  assert.doesNotThrow(() => submission.assertRemoteFileContents(remote, dir, files.map(file => file.filename)));
  remote.set('site/js/bank.js', 'altered\n');
  assert.throws(() => submission.assertRemoteFileContents(remote, dir, files.map(file => file.filename)), /trusted regenerated output/);
});

test('branch names, status context, comments, and PR text are fixed and do not include hostile issue text', () => {
  assert.equal(submission.branchForIssue(42), 'submission/issue-42');
  assert.equal(submission.STATUS_CONTEXT, 'Build and tests');
  assert.match(submission.buildIssueComment('setup'), /GitHub Actions/);
  assert.match(submission.buildIssueComment('setup'), /edit this issue to retry/i);
  assert.doesNotMatch(submission.safeMessage('bad @team ``` <script>'), /@team|```|<script>/);

  const pr = submission.buildPullRequestText({number: 42, title: 'malicious user title'}, {packId: 'submission-workflow-pack'});
  assert.equal(pr.title, 'Add question pack submission-workflow-pack');
  assert.doesNotMatch(pr.body, /malicious user title/);
  assert.match(pr.body, /native Check workflow and owner review must be repeated/);
});

test('ignored issues are not commented on or processed', async () => {
  const calls = [];
  const api = {
    get: async () => { throw new Error('unexpected get'); },
    post: async (...args) => { calls.push(args); return {}; }
  };
  const result = await submission.handleSubmission({
    api,
    checkHead: false,
    event: {repository: {full_name: 'the-projects-i-tried/nc-road-ready'}, issue: {number: 12, labels: [], body: ''}}
  });
  assert.deepEqual(result, {outcome: 'ignored'});
  assert.deepEqual(calls, []);
});
