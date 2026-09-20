'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const RR=require('../site/js/engine.js');
const bank=require('../content/core.json');
const clone=x=>structuredClone(x);
const rng=()=>{let a=2463534242;return ()=>{a^=a<<13;a^=a>>>17;a^=a<<5;return (a>>>0)/4294967296;};};
const fresh=()=>new RR.Session(bank,rng());
function finishRound(s,choose=q=>q.correctId){let v;while((v=s.next()))s.submit(choose(v.question));}
function record(s,c,id,correct=true,hintUsed=false){s.record({questionId:id,concept:c,topic:s.concepts.get(c).topic,choiceId:'a',correct,hintUsed,mode:'learn',repeat:false});}
function extra(){const q=clone(bank.questions[0]);q.id='test-added-variant';q.stem='Test fixture only: '+q.stem;q.reviewStatus='source-checked';return {schemaVersion:1,packId:'test-extra',title:'Test fixture',sources:{},concepts:[],questions:[q]};}

test('core bank has 226 unique authored variants, 113 rule families, and 44 source-checked sign questions',()=>{
 assert.deepEqual(RR.validatePack(bank),[]);assert.equal(bank.questions.length,226);assert.equal(bank.concepts.length,113);
 assert.equal(new Set(bank.questions.map(RR.fingerprint)).size,226);
 const s=fresh();assert.equal(bank.questions.filter(q=>s.info(q).reviewStatus==='source-checked').length,44);
 for(const q of bank.questions){assert.equal(q.choices.length,4);assert.ok(q.choices.every(c=>c.feedback.length>15));if(q.asset)assert.ok(fs.existsSync(path.join(__dirname,'../site',q.asset)));}
});
test('source URLs accept only official handbook/sign-sheet PDFs',()=>{
 assert.equal(RR.sourceUrl(bank.sources.handbook.url),true);
 for(const u of ['http://www.ncdot.gov/a','https://evil.ncdot.gov/','https://www.ncdot.gov.evil.test/a','javascript:alert(1)','https://example.org/handbook.pdf','https://www.ncdot.gov/unrelated.pdf','https://person:password@www.ncdot.gov/dmv/license-id/driver-licenses/new-drivers/Documents/nc-driver-handbook.pdf'])assert.equal(RR.sourceUrl(u),false,u);
});
test('validation rejects duplicate ids, duplicate stems, missing correct options, and malformed feedback',()=>{
 const a=clone(bank);a.questions.push(clone(a.questions[0]));assert.match(RR.validatePack(a).join(' '),/Duplicate question id/);
 const b=extra();b.questions[0].id='different-id';b.questions[0].stem=bank.questions[0].stem;assert.match(RR.validatePack(b,bank).join(' '),/identical stem/);
 const c=extra();c.questions[0].correctId='missing';assert.match(RR.validatePack(c,bank).join(' '),/correctId/);
 const d=extra();d.questions[0].choices[1].feedback='';assert.match(RR.validatePack(d,bank).join(' '),/feedback/);
});
test('validation rejects duplicate options, invalid topics, unrecognized sources, and invalid pages',()=>{
 const a=extra();a.questions[0].choices[1]=clone(a.questions[0].choices[0]);assert.match(RR.validatePack(a,bank).join(' '),/duplicate choice/);
 for(const [field,value,re] of [['topic','constructor',/unknown topic/],['sourceId','constructor',/unknown sourceId/],['pdfPage',0,/pdfPage/]]){const b=clone(bank);b.concepts[0][field]=value;assert.match(RR.validatePack(b).join(' '),re);}
});
test('validation rejects an existing source or concept metadata override',()=>{
 const p=extra();p.sources.handbook={...bank.sources.handbook,title:'Overwritten'};assert.match(RR.validatePack(p,bank).join(' '),/overwrite/);
 const x=extra();x.concepts=[clone(bank.concepts[0])];assert.match(RR.validatePack(x,bank).join(' '),/Duplicate concept/);
});
test('validation rejects an external image asset and an oversized question list',()=>{
 const p=extra();p.questions[0].asset='https://example.org/track.svg';assert.match(RR.validatePack(p,bank).join(' '),/illustration/);
 const p2=extra();p2.questions=Array(5001).fill(p2.questions[0]);assert.match(RR.validatePack(p2,bank).join(' '),/1–5000/);
});
test('malformed packs produce errors rather than acceptance',()=>{
 for(const p of [null,[],{},3,{schemaVersion:1}, {schemaVersion:1,packId:'a',title:'b',sources:{},concepts:[],questions:[null]}])assert.ok(RR.validatePack(p).length>0);
});
test('fresh session contains no fabricated history or scores',()=>{
 const s=fresh();assert.equal(s.summary().answered,0);assert.equal(s.summary().accuracy,null);assert.equal(s.summary().remaining,226);assert.equal(s.weakConcepts().size,0);
 assert.match(s.exportReport().note,/No earlier chat scores/);
});
test('rounds contain no exact repetitions until the entire bank is exhausted',()=>{
 const s=fresh(),seen=new Set();while(s.exposed.size<bank.questions.length){assert.equal(s.start({count:50,difficulty:'any'}).ok,true);let v;while((v=s.next())){assert.ok(!seen.has(v.question.id));seen.add(v.question.id);s.submit(v.question.correctId);}}
 assert.equal(seen.size,226);assert.equal(s.start().ok,false);assert.equal(s.summary().answered,226);
});
test('review requires explicit permission and never repeats one question twice in a batch',()=>{
 const s=fresh(),c=bank.concepts[0].id;assert.equal(s.start({count:5,focusConcepts:[c]}).target,2);finishRound(s);
 assert.equal(s.start({focusConcepts:[c]}).ok,false);assert.equal(s.start({count:5,focusConcepts:[c],allowSeen:true}).target,2);
 const ids=[];let v;while((v=s.next())){assert.equal(v.repeat,true);ids.push(v.question.id);s.submit(v.question.correctId);}assert.equal(new Set(ids).size,2);
});
test('topic and excluded-topic filters remain hard constraints',()=>{
 const s=fresh();s.start({count:20,topics:['signs','school-buses'],excludeTopics:['signs']});let v;while((v=s.next())){assert.equal(s.concepts.get(v.question.concept).topic,'school-buses');s.submit(v.question.correctId);}
});
test('explicit difficulty is respected and a narrow pool shortens the round',()=>{
 const s=fresh();const id=bank.questions.find(q=>q.difficulty===3).concept;const x=s.start({count:50,focusConcepts:[id],difficulty:3});assert.equal(x.ok,true);assert.ok(x.target<50);let v;while((v=s.next())){assert.equal(v.question.difficulty,3);s.submit(v.question.correctId);}
});
test('next returns the unanswered view, double submit and unknown choice throw',()=>{
 const s=fresh();s.start();const v=s.next();assert.equal(s.next(),v);assert.throws(()=>s.submit('not-an-option'),/displayed/);assert.equal(s.records.length,0);s.submit(v.question.correctId);assert.throws(()=>s.submit(v.question.correctId),/awaiting/);
});
test('hints count as assisted correct, not unassisted mastery or a recovery streak',()=>{
 const s=fresh();s.start({focusConcepts:['abs-stop'],count:2});let v=s.next();s.submit(v.question.choices.find(c=>c.id!==v.question.correctId).id);v=s.next();s.hint();s.submit(v.question.correctId);
 const st=s.stats['abs-stop'];assert.equal(st.correct,1);assert.equal(st.unassistedCorrect,0);assert.equal(st.streak,0);assert.equal(s.weakConcepts().has('abs-stop'),true);assert.equal(s.level('abs-stop'),'Needs review');
});
test('a mistake raises the rule selection weight and creates a weak-rule target',()=>{
 const s=fresh(),q=bank.questions.find(q=>q.concept==='abs-stop'),before=s.score(q,{difficulty:'any'});
 record(s,q.concept,q.id,false);s.recent=[];const after=s.score(q,{difficulty:'any'});assert.ok(after>before);assert.ok(s.weakConcepts().has(q.concept));
});
test('practiced requires distinct variants and spaced unassisted successes',()=>{
 const s=fresh(),id='abs-stop',qs=bank.questions.filter(q=>q.concept===id),other=bank.questions.find(q=>q.concept!==id);
 record(s,id,qs[0].id);record(s,id,qs[1].id);assert.equal(s.level(id),'Building');
 record(s,other.concept,other.id);record(s,other.concept,other.id);record(s,id,qs[1].id);assert.equal(s.level(id),'Practiced');
 record(s,id,qs[0].id,false);assert.equal(s.level(id),'Needs review');
});
test('repeated success on the same variant is not enough for practiced status',()=>{
 const s=fresh(),q=bank.questions[0],other=bank.questions[2];record(s,q.concept,q.id);for(let i=0;i<4;i++)record(s,other.concept,other.id);record(s,q.concept,q.id);assert.equal(s.level(q.concept),'Building');
});
test('two unassisted recovery successes remove the weak-rule target',()=>{
 const s=fresh(),q=bank.questions[0];record(s,q.concept,q.id,false);record(s,q.concept,q.id);assert.ok(s.weakConcepts().has(q.concept));record(s,q.concept,q.id);assert.equal(s.weakConcepts().has(q.concept),false);
});
test('recent rules get a cooldown when alternatives are available',()=>{
 const s=fresh();s.start({count:20,difficulty:'any'});let v,previous=[];while((v=s.next())){assert.ok(!previous.slice(-3).includes(v.question.concept));previous.push(v.question.concept);s.submit(v.question.correctId);}
});
test('adaptive difficulty moves toward harder questions after repeated correct answers',()=>{
 const s=fresh(),q=bank.questions.find(q=>q.difficulty===3),simple={...q,difficulty:1};for(let i=0;i<5;i++){const other=bank.questions.find(x=>x.concept!==q.concept);record(s,other.concept,other.id);}
 assert.ok(s.score(q,{difficulty:'adaptive'})>s.score(simple,{difficulty:'adaptive'}));
});
test('mock mode has 25 different rules, topic balance, deferred scores, and no hints',()=>{
 const s=fresh();s.start({count:25,mode:'mock',difficulty:'any'});assert.equal(new Set(s.batch.queue.map(q=>q.concept)).size,25);
 assert.equal(new Set(s.batch.queue.map(q=>s.concepts.get(q.concept).topic)).size,10);
 for(let i=0;i<25;i++){const v=s.next();s.hint();assert.equal(v.hintUsed,false);const result=s.submit(v.question.correctId);if(i<24){assert.equal(s.records.length,0);assert.equal(result.deferred,true);}}
 assert.equal(s.summary().correct,25);s.finish();assert.equal(s.records.length,25);
});
test('abandoning an incomplete mock preserves exposure but does not invent graded answers',()=>{
 const s=fresh();s.start({count:25,mode:'mock'});const q=s.next().question;s.submit(q.correctId);assert.equal(s.records.length,0);s.start({count:5});assert.equal(s.records.length,0);assert.ok(s.exposed.has(q.id));
});
test('imported packs reuse concepts, are forcibly unverified, and do not mutate original data',()=>{
 const s=fresh(),p=extra();assert.equal(s.addPack(p),1);assert.equal(s.bank.questions.length,227);assert.equal(bank.questions.length,226);assert.equal(p.questions[0].reviewStatus,'source-checked');assert.equal(s.info(s.questions.get(p.questions[0].id)).reviewStatus,'needs-source-review');assert.throws(()=>s.addPack(p),/Duplicate/);
});
test('newly created sessions do not retain imported packs or previous answers',()=>{
 const a=fresh();a.addPack(extra());a.start();a.submit(a.next().question.correctId);const b=fresh();assert.equal(b.bank.questions.length,226);assert.equal(b.records.length,0);
});
test('session reset clears records, exposure, and learning statistics',()=>{const s=fresh();s.start();s.submit(s.next().question.correctId);s.reset();assert.equal(s.summary().answered,0);assert.equal(s.exposed.size,0);assert.equal(s.batch,null);});
test('stats keys named constructor do not inherit Object.prototype members',()=>{const s=fresh();assert.equal(s.ensure('constructor').attempts,0);assert.equal(Object.getPrototypeOf(s.stats),null);});
test('generation prompt includes request, rule definitions, exclusion stems, and actual history',()=>{
 const s=fresh();s.start();const q=s.next().question;s.submit(q.correctId);const p=s.generationPrompt('20 new questions about headlights');for(const fragment of ['20 new questions about headlights',q.stem,q.id,'schemaVersion:1','Fetch and read it','THIS browser session only'])assert.ok(p.includes(fragment));
});
test('shuffling preserves all choice ids and changes displayed order across seeds',()=>{
 const a=['a','b','c','d'],orders=new Set();const r=rng();for(let i=0;i<20;i++){const x=RR.shuffle(a,r);assert.deepEqual([...x].sort(),a);orders.add(x.join(''));}assert.ok(orders.size>5);assert.deepEqual(a,['a','b','c','d']);
});
test('requests understand topics, difficulty, exclusions, counts, and weak areas',()=>{
 let p=RR.parseRequest('5 harder questions on school buses and right of way');assert.deepEqual(new Set(p.topics),new Set(['school-buses','right-of-way']));assert.equal(p.difficulty,3);assert.equal(p.count,5);
 p=RR.parseRequest('10 mixed questions, no signs');assert.deepEqual(p.topics,[]);assert.deepEqual(p.excludeTopics,['signs']);assert.equal(p.count,10);
 assert.equal(RR.parseRequest('my weak spots').weakOnly,true);assert.equal(RR.parseRequest('200 questions').count,50);assert.equal(RR.parseRequest('0 questions').count,1);
});
test('specific requests distinguish ABS from non-ABS, broad categories, and unknown text',()=>{
 assert.deepEqual(RR.parseRequest('5 questions on ABS').focusConcepts,['abs-stop']);assert.deepEqual(RR.parseRequest('non-ABS braking').focusConcepts,['non-abs-slippery']);
 assert.deepEqual(RR.parseRequest('manual brake failure').topics,[]);assert.deepEqual(RR.parseRequest('manual brake failure').focusConcepts,['manual-brake-failure']);
 assert.ok(RR.parseRequest('railroad').focusConcepts.includes('railroad-ens'));assert.equal(RR.parseRequest('favorite dessert').recognized,false);
});
test('review words never override explicit fresh-only requests',()=>{assert.equal(RR.parseRequest('review signs').allowSeen,true);for(const text of ['review signs but no repeats','review signs but do not repeat','fresh review questions'])assert.equal(RR.parseRequest(text).allowSeen,false);});
test('requested batch lengths are bounded integers',()=>{for(const [x,n]of [[4.9,4],[-2,1],[200,50]]){const s=fresh();s.start({count:x});assert.equal(s.batch.requested,n);}});
test('runtime source contains no network API or persistent browser storage calls',()=>{
 const code=fs.readFileSync(path.join(__dirname,'../site/js/engine.js'),'utf8')+fs.readFileSync(path.join(__dirname,'../site/js/app.js'),'utf8');
 for(const re of [/\bfetch\s*\(/,/new\s+XMLHttpRequest/,/new\s+WebSocket/,/\blocalStorage\./,/\bsessionStorage\./,/document\.cookie\s*=/,/serviceWorker\.register/,/\beval\s*\(/,/\.innerHTML\s*=/])assert.equal(re.test(code),false,re.toString());
});

test('new rule metadata is discoverable and unknown subjects do not silently become mixed rounds',()=>{assert.deepEqual(RR.parseRequest('5 questions about headlights',{concepts:bank.concepts}).focusConcepts,['rain-headlights']);assert.equal(RR.parseRequest('5 questions about cooking',{concepts:bank.concepts}).recognized,false);assert.equal(RR.parseRequest('5 more').recognized,true);});
