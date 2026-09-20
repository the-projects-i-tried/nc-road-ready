'use strict';
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

// Bind an editorial review to its actual wording, key, citation, and illustration.
// A matching hash establishes that reviewed material has not changed; it does
// not establish that the review was correct.
function stable(value) {
 if (Array.isArray(value)) return value.map(stable);
 if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(k => [k, stable(value[k])]));
 return value;
}
function digest(value) {
 return crypto.createHash('sha256').update(JSON.stringify(stable(value))).digest('hex');
}
function reviewDigest(bank, question, root) {
 const concept = bank.concepts.find(c => c.id === question.concept);
 const source = bank.sources[concept.sourceId];
 const fields = (object, keys) => Object.fromEntries(keys.filter(k => object[k] !== undefined).map(k => [k, object[k]]));
 return digest({
  question: fields(question, ['id', 'concept', 'stem', 'choices', 'correctId', 'hint', 'asset', 'assetDescription']),
  concept: fields(concept, ['id', 'title', 'summary', 'sourceId', 'section', 'pdfPage']),
  source: fields(source, ['url', 'sha256', 'printedRevision']),
  assetSha256: question.asset ? crypto.createHash('sha256').update(fs.readFileSync(path.join(root, 'site', question.asset))).digest('hex') : null
 });
}
function validateEvidence(bank, audit, root) {
 const errors = [], entries = new Map(), reviews = new Map();
 for (const r of audit.reviews || []) {
  if (reviews.has(r.conceptId)) errors.push(`Duplicate concept review: ${r.conceptId}.`);
  reviews.set(r.conceptId, r);
 }
 for (const entry of audit.questions || []) {
  if (entries.has(entry.id)) errors.push(`Duplicate question review: ${entry.id}.`);
  entries.set(entry.id, entry);
 }
 for (const q of bank.questions) {
  const c = bank.concepts.find(c => c.id === q.concept);
  if ((q.reviewStatus || c.reviewStatus) !== 'source-checked') continue;
  const entry = entries.get(q.id), review = reviews.get(c.id), source = bank.sources[c.sourceId];
  if (!entry || !review) { errors.push(`${q.id}: source-checked question lacks editorial review evidence.`); continue; }
  if (entry.digest !== reviewDigest(bank, q, root)) errors.push(`${q.id}: reviewed wording, answer, citation, or asset changed; review it again or mark it pending.`);
  if (!review.questionIds?.includes(q.id) || !review.pdfPages?.includes(c.pdfPage)) errors.push(`${q.id}: review does not cover its question id and cited PDF page.`);
  if (source.sha256 !== audit.source.sha256 || source.url !== audit.source.url) errors.push(`${q.id}: source does not match the reviewed document.`);
  if (!review.finding || !Array.isArray(review.pdfPages) || review.pdfPages.some(p => !Number.isInteger(p) || p < 1 || p > audit.source.pdfPages)) errors.push(`${q.id}: incomplete review finding or invalid PDF pagination.`);
 }
 return errors;
}
module.exports = { reviewDigest, validateEvidence };
