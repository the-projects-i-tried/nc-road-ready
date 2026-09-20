'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const Submission=require('../site/js/submission.js');
const RR=require('../site/js/engine.js');
const bank=require('../content/core.json');

const clone=x=>structuredClone(x);
const handbookUrl=bank.sources.handbook.url;

function basePack(suffix='base') {
  return {
    schemaVersion: 1,
    packId: `submission-${suffix}`,
    title: `Submission fixture ${suffix}`,
    sources: {},
    concepts: [],
    questions: [{
      id: `submission-${suffix}-q1`,
      concept: bank.concepts[0].id,
      difficulty: 2,
      stem: `Submission fixture ${suffix}: what should the driver do in this source-review test?`,
      hint: 'Use the relevant handbook rule before choosing.',
      choices: [
        { id: 'a', text: 'Choose the source-grounded action.', feedback: 'This is the keyed fixture answer with specific feedback.' },
        { id: 'b', text: 'Ignore the handbook rule.', feedback: 'The feedback explains why this tempting option is wrong.' },
        { id: 'c', text: 'Rely on an unrelated rule.', feedback: 'This option is wrong because the cited rule does not control this scenario.' },
        { id: 'd', text: 'Treat all choices as correct.', feedback: 'The item must have one defensible correct answer.' }
      ],
      correctId: 'a',
      reviewStatus: 'source-checked'
    }]
  };
}

function withNewConcept(suffix='new-concept') {
  const p=basePack(suffix);
  p.sources['handbook-extra']={title:'NCDOT North Carolina Driver Handbook',url:handbookUrl};
  p.concepts=[{
    id:`submission-${suffix}-concept`,
    title:'Submission test concept',
    topic:'signals',
    tags:['submission test','safe json'],
    summary:'A source-grounded summary used only for submission normalization tests.',
    sourceId:'handbook-extra',
    section:'Submission test section',
    pdfPage:null,
    reviewStatus:'source-checked',
    priority:1
  }];
  p.questions[0].concept=p.concepts[0].id;
  return p;
}

test('createSubmission returns canonical pending JSON data without mutating input',()=>{
  const pack=basePack('shell-html');
  pack.questions[0].stem='Submission fixture shell-html: </script><img src=x onerror=alert(1)> $(rm -rf /) stays text.';
  pack.questions[0].choices[0].text='Literal shell-looking text: `$(curl example.org)`';
  const original=clone(pack);
  const submission=Submission.createSubmission(pack,bank);

  assert.deepEqual(pack,original);
  assert.equal(submission.questions[0].reviewStatus,'needs-source-review');
  assert.equal(submission.concepts.length,0);
  assert.equal(submission.questions[0].stem,pack.questions[0].stem);
  assert.equal(submission.questions[0].choices[0].text,pack.questions[0].choices[0].text);
  assert.deepEqual(RR.validatePack(submission,bank),[]);

  const json=Submission.formatSubmissionJSON(submission);
  assert.ok(json.toLowerCase().includes('<\\/script>'));
  assert.equal(JSON.parse(json).questions[0].stem,pack.questions[0].stem);
});

test('new source and concept definitions are canonicalized and forced pending',()=>{
  const submission=Submission.createSubmission(withNewConcept('pending'),bank);
  assert.equal(Object.getPrototypeOf(submission.sources),null);
  assert.deepEqual(Object.keys(submission.sources),['handbook-extra']);
  assert.equal(submission.sources['handbook-extra'].url,handbookUrl);
  assert.equal(submission.concepts[0].reviewStatus,'needs-source-review');
  assert.equal(submission.questions[0].reviewStatus,'needs-source-review');
  assert.deepEqual(RR.validatePack(submission,bank),[]);
});

test('unknown nested fields and source review metadata are rejected clearly',()=>{
  const nested=basePack('unknown-choice');
  nested.questions[0].choices[0].html='<b>not allowed</b>';
  assert.throws(()=>Submission.createSubmission(nested,bank),/questions\[0\]\.choices\[0\]\.html: unknown field/);

  const sourceClaim=withNewConcept('source-claim');
  sourceClaim.sources['handbook-extra'].status='source-checked';
  assert.throws(()=>Submission.createSubmission(sourceClaim,bank),/sources\.handbook-extra\.status: unknown field/);
});

test('prototype-shaped keys and ids are not accepted in source definitions',()=>{
  const poisonedJson=`{"schemaVersion":1,"packId":"submission-poison","title":"Poison","sources":{},"concepts":[],"questions":[],"__proto__":{"polluted":true}}`;
  assert.throws(()=>Submission.parseSubmissionJSON(poisonedJson,bank),/unsafe property name "__proto__"/);

  const constructorSource=withNewConcept('constructor-source');
  constructorSource.sources={constructor:{title:'NCDOT North Carolina Driver Handbook',url:handbookUrl}};
  constructorSource.concepts[0].sourceId='constructor';
  assert.throws(()=>Submission.createSubmission(constructorSource,bank),/unsafe property name "constructor"|unsafe id "constructor"/);
});

test('source URLs and submitted assets must match approved current-bank data',()=>{
  const badSource=withNewConcept('bad-source');
  badSource.sources['handbook-extra'].url='https://example.org/nc-driver-handbook.pdf';
  assert.throws(()=>Submission.createSubmission(badSource,bank),/official HTTPS ncdot\.gov URL/);

  const badAsset=basePack('bad-asset');
  badAsset.questions[0].asset='assets/sign-not-bundled.svg';
  badAsset.questions[0].assetDescription='A made-up sign asset';
  assert.throws(()=>Submission.createSubmission(badAsset,bank),/asset is not bundled/);

  const okAsset=basePack('ok-asset');
  okAsset.questions[0].asset='assets/sign-stop.svg';
  okAsset.questions[0].assetDescription='A red octagonal sign with the word STOP';
  const submission=Submission.createSubmission(okAsset,bank);
  assert.equal(submission.questions[0].asset,'assets/sign-stop.svg');
});

test('byte limits use UTF-8 bytes and apply to parsed and formatted JSON',()=>{
  assert.equal(Submission.byteLength('😀'),4);
  const tooLargeText='😀'.repeat(Math.ceil(Submission.MAX_SUBMISSION_BYTES/4)+10);
  assert.throws(()=>Submission.parseSubmissionJSON(tooLargeText,bank),/exceeds 50000 bytes/);
  assert.throws(()=>Submission.formatSubmissionJSON({text:tooLargeText}),/exceeds 50000 bytes/);
});

test('array metadata and asset descriptions without assets are rejected',()=>{
  const arrayField=basePack('array-field');
  arrayField.questions.note='hidden metadata';
  assert.throws(()=>Submission.createSubmission(arrayField,bank),/pack\.questions\.note: unknown array field/);

  const orphanAlt=basePack('orphan-alt');
  orphanAlt.questions[0].assetDescription='Description without an asset';
  assert.throws(()=>Submission.createSubmission(orphanAlt,bank),/assetDescription requires asset/);
});
