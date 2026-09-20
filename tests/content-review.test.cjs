'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const bank = require('../content/core.json');
const audit = require('../docs/CONTENT_AUDIT.json');
const source = require('../docs/handbook-source.json');
const {validateEvidence} = require('../scripts/review-evidence.cjs');
const root = path.resolve(__dirname, '..');

test('every core question has a documented review tied to the retrieved handbook and current wording', () => {
 assert.equal(audit.source.sha256, source.sha256);
 assert.equal(audit.source.pdfPages, 108);
 assert.ok(audit.questions.length >= bank.questions.length);
 assert.ok(audit.reviews.length >= bank.concepts.length);
 const reviewedIds = new Set(audit.questions.map(q => q.id));
 assert.ok(bank.questions.every(q => reviewedIds.has(q.id)));
 assert.deepEqual(validateEvidence(bank, audit, root), []);
});

test('review evidence rejects changed keys, feedback, hints, summaries, citations, and artwork', () => {
 const mutate = [
  b => { b.questions[0].correctId = 'b'; },
  b => { b.questions[0].choices[1].feedback += ' Changed claim.'; },
  b => { b.questions[0].hint += ' Changed advice.'; },
  b => { b.concepts[0].summary += ' Changed rule.'; },
  b => { b.concepts[0].pdfPage += 1; },
  b => { b.questions.find(q => q.asset).asset = 'assets/sign-yield.svg'; }
 ];
 for (const change of mutate) {
  const edited = structuredClone(bank); change(edited);
  assert.match(validateEvidence(edited, audit, root).join('\n'), /changed|cited PDF page/);
 }
 const incomplete = structuredClone(audit); incomplete.questions.shift();
 assert.match(validateEvidence(bank, incomplete, root).join('\n'), /lacks editorial review evidence/);
});

test('handbook Markdown accounts for all PDF pages and identifies its exact source', () => {
 const markdown = fs.readFileSync(path.join(root, 'docs/NC_DRIVER_HANDBOOK.md'), 'utf8');
 assert.ok(markdown.includes(source.sha256));
 const pages = [...markdown.matchAll(/^## PDF page (\d+)\b/gm)].map(m => Number(m[1]));
 assert.deepEqual(pages, Array.from({length: source.pdfPages}, (_, i) => i + 1));
});

test('a permanent pack cannot claim or inherit source-checked status without its own review evidence', () => {
 const merged = structuredClone(bank), added = structuredClone(bank.questions[0]);
 added.id = 'unreviewed-permanent-pack-question';
 merged.questions.push(added);
 assert.match(validateEvidence(merged, audit, root).join('\n'), /lacks editorial review evidence/);
 added.reviewStatus = 'source-checked';
 assert.match(validateEvidence(merged, audit, root).join('\n'), /lacks editorial review evidence/);
 added.reviewStatus = 'needs-source-review';
 assert.deepEqual(validateEvidence(merged, audit, root), []);
});
