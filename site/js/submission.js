/* Pure submission normalizer. Browser + Node. No storage, network, eval, or DOM. */
(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./engine.js'));
  else root.RoadReadySubmission = factory(root.RoadReady);
})(typeof globalThis !== 'undefined' ? globalThis : this, function(RR) {
  'use strict';
  if (!RR || typeof RR.validatePack !== 'function') throw new Error('RoadReady engine is required.');

  const MAX_SUBMISSION_BYTES = 50000;
  const PENDING = 'needs-source-review';
  const ID_RE = /^[a-z0-9][a-z0-9_-]{0,95}$/;
  const UNSAFE_KEYS = new Set(['__proto__', 'prototype', 'constructor']);
  const TOP_KEYS = new Set(['schemaVersion', 'packId', 'title', 'sources', 'concepts', 'questions']);
  const SOURCE_KEYS = new Set(['title', 'url']);
  const CONCEPT_KEYS = new Set(['id', 'title', 'topic', 'tags', 'summary', 'sourceId', 'section', 'pdfPage', 'reviewStatus', 'priority']);
  const QUESTION_KEYS = new Set(['id', 'concept', 'difficulty', 'stem', 'hint', 'choices', 'correctId', 'asset', 'assetDescription', 'reviewStatus']);
  const CHOICE_KEYS = new Set(['id', 'text', 'feedback']);

  function byteLength(text) {
    const s = String(text);
    if (typeof TextEncoder === 'function') return new TextEncoder().encode(s).length;
    if (typeof Buffer === 'function') return Buffer.byteLength(s, 'utf8');
    return unescape(encodeURIComponent(s)).length;
  }

  function fail(path, message) {
    throw new Error(`${path}: ${message}`);
  }

  function isRecord(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
    const proto = Object.getPrototypeOf(value);
    return proto === Object.prototype || proto === null;
  }

  function ownJsonKeys(value, path) {
    if (!isRecord(value)) fail(path, 'expected a plain JSON object.');
    const keys = Reflect.ownKeys(value);
    for (const key of keys) {
      if (typeof key !== 'string') fail(path, 'symbol properties are not valid JSON.');
      if (!Object.prototype.propertyIsEnumerable.call(value, key)) fail(path, `non-enumerable field "${key}" is not allowed.`);
      if (UNSAFE_KEYS.has(key)) fail(path, `unsafe property name "${key}" is not allowed.`);
    }
    return keys;
  }

  function assertKnownFields(value, allowed, path) {
    for (const key of ownJsonKeys(value, path)) {
      if (!allowed.has(key)) fail(`${path}.${key}`, 'unknown field.');
    }
  }

  function assertDenseArray(value, path) {
    if (!Array.isArray(value)) fail(path, 'expected an array.');
    for (const key of Reflect.ownKeys(value)) {
      if (typeof key !== 'string') fail(path, 'symbol properties are not valid JSON.');
      if (key === 'length') continue;
      if (!/^(0|[1-9][0-9]*)$/.test(key)) fail(`${path}.${key}`, 'unknown array field.');
    }
    for (let i = 0; i < value.length; i++) if (!Object.hasOwn(value, i)) fail(`${path}[${i}]`, 'array holes are not valid JSON.');
  }

  function assertSafeId(value, path) {
    if (typeof value !== 'string' || !ID_RE.test(value)) fail(path, 'expected a safe lowercase id.');
    if (UNSAFE_KEYS.has(value)) fail(path, `unsafe id "${value}" is not allowed.`);
  }

  function copySources(sources) {
    const out = Object.create(null);
    for (const id of ownJsonKeys(sources, 'sources')) {
      assertSafeId(id, `sources.${id}`);
      const source = sources[id];
      assertKnownFields(source, SOURCE_KEYS, `sources.${id}`);
      out[id] = { title: source.title, url: source.url };
    }
    return out;
  }

  function copyConcept(concept, index) {
    const path = `concepts[${index}]`;
    assertKnownFields(concept, CONCEPT_KEYS, path);
    assertSafeId(concept.id, `${path}.id`);
    assertSafeId(concept.sourceId, `${path}.sourceId`);
    assertDenseArray(concept.tags, `${path}.tags`);
    return {
      id: concept.id,
      title: concept.title,
      topic: concept.topic,
      tags: concept.tags.map((tag, tagIndex) => {
        if (typeof tag !== 'string') fail(`${path}.tags[${tagIndex}]`, 'expected a string.');
        return tag;
      }),
      summary: concept.summary,
      sourceId: concept.sourceId,
      section: concept.section,
      pdfPage: Object.hasOwn(concept, 'pdfPage') ? concept.pdfPage : null,
      reviewStatus: PENDING,
      ...(Object.hasOwn(concept, 'priority') ? { priority: concept.priority } : {})
    };
  }

  function copyChoice(choice, qIndex, choiceIndex) {
    const path = `questions[${qIndex}].choices[${choiceIndex}]`;
    assertKnownFields(choice, CHOICE_KEYS, path);
    assertSafeId(choice.id, `${path}.id`);
    return { id: choice.id, text: choice.text, feedback: choice.feedback };
  }

  function copyQuestion(question, index) {
    const path = `questions[${index}]`;
    assertKnownFields(question, QUESTION_KEYS, path);
    assertSafeId(question.id, `${path}.id`);
    assertSafeId(question.concept, `${path}.concept`);
    assertDenseArray(question.choices, `${path}.choices`);
    const out = {
      id: question.id,
      concept: question.concept,
      difficulty: question.difficulty,
      stem: question.stem,
      hint: question.hint,
      choices: question.choices.map((choice, choiceIndex) => copyChoice(choice, index, choiceIndex)),
      correctId: question.correctId,
      reviewStatus: PENDING
    };
    assertSafeId(out.correctId, `${path}.correctId`);
    if (Object.hasOwn(question, 'asset')) {
      out.asset = question.asset;
      out.assetDescription = question.assetDescription;
    } else if (Object.hasOwn(question, 'assetDescription')) {
      fail(`${path}.assetDescription`, 'assetDescription requires asset.');
    }
    return out;
  }

  function bundledAssets(bank) {
    const assets = new Set();
    if (!bank || !Array.isArray(bank.questions)) fail('bank.questions', 'current bank is required.');
    for (const q of bank.questions) if (q && q.asset) assets.add(q.asset);
    return assets;
  }

  function canonicalize(pack) {
    assertKnownFields(pack, TOP_KEYS, 'pack');
    assertSafeId(pack.packId, 'pack.packId');
    assertDenseArray(pack.concepts, 'pack.concepts');
    assertDenseArray(pack.questions, 'pack.questions');
    return {
      schemaVersion: pack.schemaVersion,
      packId: pack.packId,
      title: pack.title,
      sources: copySources(pack.sources),
      concepts: pack.concepts.map(copyConcept),
      questions: pack.questions.map(copyQuestion)
    };
  }

  function validateAgainstBank(submission, bank) {
    const errors = RR.validatePack(submission, bank);
    if (errors.length) throw new Error(`Submission validation failed:\n${errors.join('\n')}`);
    const allowedAssets = bundledAssets(bank);
    for (const q of submission.questions) {
      if (q.asset && !allowedAssets.has(q.asset)) throw new Error(`${q.id}: asset is not bundled in the current bank.`);
    }
  }

  function formatSubmissionJSON(submission) {
    const json = JSON.stringify(submission, null, 2).replace(/<\/script/gi, '<\\/script') + '\n';
    if (byteLength(json) > MAX_SUBMISSION_BYTES) throw new Error(`Submission JSON exceeds ${MAX_SUBMISSION_BYTES} bytes.`);
    return json;
  }

  function createSubmission(pack, bank) {
    if (!bank || !Array.isArray(bank.questions) || !Array.isArray(bank.concepts)) fail('bank', 'current bank is required.');
    const submission = canonicalize(pack);
    validateAgainstBank(submission, bank);
    formatSubmissionJSON(submission);
    return submission;
  }

  function parseSubmissionJSON(text, bank) {
    if (typeof text !== 'string') fail('submission', 'expected JSON text.');
    if (byteLength(text) > MAX_SUBMISSION_BYTES) throw new Error(`Submission JSON exceeds ${MAX_SUBMISSION_BYTES} bytes.`);
    let parsed;
    try { parsed = JSON.parse(text); }
    catch (err) { throw new Error(`Submission JSON could not be parsed: ${err.message}`); }
    return createSubmission(parsed, bank);
  }

  return { MAX_SUBMISSION_BYTES, byteLength, createSubmission, parseSubmissionJSON, formatSubmissionJSON };
});
