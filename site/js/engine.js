/* Pure, dependency-free learning engine. Browser + Node. No storage or network. */
(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.RoadReady = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';
  const TOPICS = {
    'signs': 'Signs', 'signals': 'Signals', 'school-buses': 'School buses',
    'right-of-way': 'Right of way', 'lane-use': 'Lanes & merging', 'passing': 'Passing',
    'emergencies': 'Emergencies', 'weather': 'Rain & traction',
    'sharing': 'Bikes & motorcycles', 'speed-distance': 'Speed & spacing'
  };
  const MAX_PACK_BYTES = 5 * 1024 * 1024;
  const norm = s => String(s).toLowerCase().normalize('NFKC').replace(/[’']/g,'').replace(/[^a-z0-9]+/g,' ').trim();
  const fingerprint = q => norm(q.stem) + '|' + (q.asset || '');
  const validId = s => typeof s === 'string' && /^[a-z0-9][a-z0-9_-]{0,95}$/.test(s);
  const validText = (s, max=4000) => typeof s === 'string' && s.trim().length > 0 && s.length <= max;
  function sourceUrl(s) {
    try { const u=new URL(s); return u.protocol === 'https:' && (u.hostname === 'www.ncdot.gov' || u.hostname === 'ncdot.gov') && /^\/dmv\/license-id\/driver-licenses\/new-drivers\/Documents\/(?:nc-driver-handbook|driver-handbook|regulatory-signs|warning-signs)\.pdf$/.test(u.pathname) && !u.username && !u.password && !u.port; }
    catch { return false; }
  }
  function shuffle(a, rng=Math.random) {
    const b=[...a]; for (let i=b.length-1;i>0;i--) { const j=Math.floor(rng()*(i+1)); [b[i],b[j]]=[b[j],b[i]]; } return b;
  }
  /** Structural and provenance-shape validation; NOT a factual-accuracy certification. */
  function validatePack(pack, base=null) {
    const errors=[];
    if (!pack || typeof pack!=='object' || Array.isArray(pack)) return ['A pack must be a JSON object.'];
    if (pack.schemaVersion!==1) errors.push('schemaVersion must be 1.');
    if (!validId(pack.packId)) errors.push('packId must be a short lowercase identifier.');
    if (!validText(pack.title,200)) errors.push('A title of at most 200 characters is required.');
    if (!pack.sources || typeof pack.sources!=='object' || Array.isArray(pack.sources)) errors.push('sources must be an object.');
    if (!Array.isArray(pack.concepts)) errors.push('concepts must be an array.');
    if (!Array.isArray(pack.questions) || !pack.questions.length || pack.questions.length>5000) errors.push('questions must contain 1–5000 entries.');
    if (errors.length) return errors;
    const sources={...(base?.sources || {})};
    for (const [id,s] of Object.entries(pack.sources)) {
      if (!validId(id) || !s || !sourceUrl(s.url) || !validText(s.title,300)) { errors.push(`Source ${id}: an official HTTPS ncdot.gov URL and title are required.`); continue; }
      if (sources[id] && JSON.stringify(sources[id])!==JSON.stringify(s)) errors.push(`Source ${id} would overwrite existing metadata.`);
      sources[id]=s;
    }
    const concepts=new Map((base?.concepts || []).map(c=>[c.id,c]));
    for (const c of pack.concepts) {
      if (!c || !validId(c.id)) { errors.push('Every concept needs a valid id.'); continue; }
      if (concepts.has(c.id)) errors.push(`Duplicate concept id: ${c.id}. Reuse the existing id in questions without redefining it.`);
      if (!Object.hasOwn(TOPICS,c.topic)) errors.push(`${c.id}: unknown topic.`);
      if (!validText(c.title,200) || !validText(c.summary) || !validText(c.section,300)) errors.push(`${c.id}: title, summary, and source section are required.`);
      if (!validId(c.sourceId) || !Object.hasOwn(sources,c.sourceId)) errors.push(`${c.id}: unknown sourceId.`);
      if (c.pdfPage!==null && c.pdfPage!==undefined && (!Number.isInteger(c.pdfPage) || c.pdfPage<1 || c.pdfPage>1000)) errors.push(`${c.id}: pdfPage must be null or a one-based PDF page.`);
      if (!['source-checked','needs-source-review'].includes(c.reviewStatus)) errors.push(`${c.id}: invalid reviewStatus.`);
      if (!Array.isArray(c.tags) || c.tags.some(t=>!validText(t,100))) errors.push(`${c.id}: tags must be short strings.`);
      if (c.priority!==undefined && (typeof c.priority!=='number' || !Number.isFinite(c.priority) || c.priority<=0 || c.priority>5)) errors.push(`${c.id}: priority must be between 0 and 5.`);
      concepts.set(c.id,c);
    }
    const ids=new Set((base?.questions || []).map(q=>q.id));
    const stems=new Set((base?.questions || []).map(fingerprint));
    for (const q of pack.questions) {
      if (!q || !validId(q.id)) { errors.push('Every question needs a valid id.'); continue; }
      if (ids.has(q.id)) errors.push(`Duplicate question id: ${q.id}.`); ids.add(q.id);
      if (!concepts.has(q.concept)) errors.push(`${q.id}: unknown concept.`);
      if (![1,2,3].includes(q.difficulty)) errors.push(`${q.id}: difficulty must be 1, 2, or 3.`);
      if (!validText(q.stem,1600)) errors.push(`${q.id}: stem is missing or too long.`);
      if (!validText(q.hint,600)) errors.push(`${q.id}: hint is required.`);
      if (q.asset && (!/^assets\/sign-[a-z0-9-]+\.svg$/.test(q.asset) || !validText(q.assetDescription,500))) errors.push(`${q.id}: use a bundled sign illustration and a descriptive text alternative.`);
      if (!Array.isArray(q.choices) || q.choices.length!==4) { errors.push(`${q.id}: exactly four choices are required.`); continue; }
      const choiceIds=new Set(), labels=new Set();
      for (const ch of q.choices) {
        if (!ch || !validId(ch.id) || !validText(ch.text,1000) || !validText(ch.feedback,2000)) { errors.push(`${q.id}: every choice needs an id, text, and specific feedback.`); continue; }
        if (choiceIds.has(ch.id) || labels.has(norm(ch.text))) errors.push(`${q.id}: duplicate choice.`);
        choiceIds.add(ch.id); labels.add(norm(ch.text));
      }
      if (!choiceIds.has(q.correctId)) errors.push(`${q.id}: correctId must identify one choice.`);
      const fp=fingerprint(q); if (stems.has(fp)) errors.push(`${q.id}: an identical stem/illustration is already present.`); stems.add(fp);
      if (q.reviewStatus && !['source-checked','needs-source-review'].includes(q.reviewStatus)) errors.push(`${q.id}: invalid reviewStatus.`);
    }
    return errors;
  }
  const ALIASES = {
    'signs':['sign','signs','shapes','colors','colours','regulatory','warning signs'],
    'signals':['signal','signals','traffic lights','arrows','traffic light'],
    'school-buses':['school bus','school buses','buses','bus'],
    'right-of-way':['right of way','right-of-way','yielding','intersections','pedestrians','pedestrian'],
    'lane-use':['lanes','lane use','merging','merge','freeway','interstate','lane changes'],
    'passing':['passing','overtaking','pass'],
    'emergencies':['emergencies','emergency','brake failure','blowouts','breakdowns'],
    'weather':['rain','weather','wet roads','snow','ice','traction','hydroplaning'],
    'sharing':['bikes','bicycles','bicycle','motorcycles','motorcycle','cyclists'],
    'speed-distance':['speed limits','speed','following','stopping distance','spacing']
  };
  const SPECIFIC = [
    [/(?:^| )non abs(?: |$)/,['non-abs-slippery']],
    [/(?:^| )abs(?: |$)/,['abs-stop']],
    [/(?:^| )manual(?: |$)/,['manual-brake-failure']],
    [/(?:^| )automatic(?: |$)/,['automatic-brake-failure']],
    [/(?:^| )ramp meters?(?: |$)/,['ramp-dark','ramp-red']],
    [/(?:^| )roundabouts?(?: |$)/,['roundabout-entry','roundabout-exit-pedestrian','roundabout-emergency']],
    [/(?:^| )move over(?: |$)/,['move-over-single','move-over-multilane']],
    [/(?:^| )one way(?: |$)/,['one-way-through','missed-turn-lane','right-pass-one-way','sign-one-way']],
    [/(?:^| )(?:railroad|railway|tracks|trains?)(?: |$)/,['bus-tracks','railroad-evacuate','railroad-ens','train-priority','sign-rr-ahead','sign-no-stop-tracks']],
    [/(?:^| )hydroplan(?:ing|e)(?: |$)/,['hydroplaning']],
    [/(?:^| )clutch(?: |$)/,['manual-brake-failure']]
  ];
  function phraseIn(text, phrase) { return (' '+text+' ').includes(' '+norm(phrase)+' '); }
  /** A transparent local command parser, deliberately not a chatbot/LLM. */
  function parseRequest(text, defaults={}) {
    const n=norm(text), topics=[], excludeTopics=[], focusConcepts=[];
    for (const [topic,words] of Object.entries(ALIASES)) for(const word of words) {
      if (!phraseIn(n,word)) continue;
      const escaped=norm(word).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
      const neg=new RegExp('(?:^| )(?:no|not|without|skip|exclude|excluding) (?:any |the |more )?'+escaped+'(?: |$)');
      if (neg.test(n)) excludeTopics.push(topic); else topics.push(topic);
    }
    for (const [pattern,ids] of SPECIFIC) if(pattern.test(n)) {
      if (ids[0]==='abs-stop' && /non abs/.test(n)) continue;
      focusConcepts.push(...ids);
    }
    // Specific subjects narrow a matching broad category, not unrelated topics.
    const conceptTopics={'abs-stop':'emergencies','non-abs-slippery':'weather','manual-brake-failure':'emergencies','automatic-brake-failure':'emergencies','ramp-dark':'signals','ramp-red':'signals','hydroplaning':'weather'};
    const narrowTopics=new Set(focusConcepts.map(id=>conceptTopics[id]).filter(Boolean));
    const dedup=a=>[...new Set(a)];
    const countMatch=n.match(/(?:^| )(\d{1,3})(?: |$)/);
    const difficulty=/\b(harder|hard|challenging|advanced|stretch)\b/.test(n)?3:/\b(easier|easy|basic|basics)\b/.test(n)?1:defaults.difficulty || 'adaptive';
    const weak=/\b(weak|weaknesses|missed|mistakes|wrong|struggle|struggling)\b/.test(n);
    const review=/\b(review|repeat|revisit)\b/.test(n) && !/\b(no repeats|dont repeat|do not repeat|fresh|new only)\b/.test(n);
    const mix=/\b(mix|mixed|everything|any topic|all topics)\b/.test(n);
    const generic=/\b(more|questions|quiz|practice|again|continue)\b/.test(n);
    // Rule metadata makes newly imported subjects discoverable without new code.
    if (!topics.length && !focusConcepts.length && !excludeTopics.length && !mix && !weak) {
      const matches=(defaults.concepts || []).map(c=>({id:c.id,matches:[c.title,...c.tags].filter(t=>phraseIn(n,t))})).filter(x=>x.matches.length);
      if(matches.length){const longest=Math.max(...matches.flatMap(x=>x.matches.map(t=>norm(t).length)));focusConcepts.push(...matches.filter(x=>x.matches.some(t=>norm(t).length===longest)).map(x=>x.id));}
    }
    const residual=n.replace(/\b\d+\b/g,'').replace(/\b(give|me|my|please|some|more|additional|fresh|new|only|questions?|quiz|practice|again|continue|on|about|regarding|harder|hard|challenging|advanced|stretch|easier|easy|basic|basics|standard|adaptive|level|exam|test|mode)\b/g,'').trim();
    const result={ count:countMatch?Math.max(1,Math.min(50,Number(countMatch[1]))):(defaults.count||5),
      topics:mix?[]:dedup(topics).filter(t=>!narrowTopics.has(t)&&!excludeTopics.includes(t)),
      excludeTopics:dedup(excludeTopics), focusConcepts:mix?[]:dedup(focusConcepts), difficulty,
      weakOnly:weak, allowSeen:review, mode:/\b(mock|exam|test mode)\b/.test(n)?'mock':'learn',
      recognized:!!(topics.length || excludeTopics.length || focusConcepts.length || mix || weak || review || (!residual && (generic || countMatch))), raw:text
    };
    return result;
  }
  class Session {
    constructor(bank, rng=Math.random) {
      const errors=validatePack(bank); if(errors.length) throw new Error(errors.join('\n'));
      this.bank=structuredClone(bank); this.rng=rng; this.reset(); this.reindex();
    }
    reindex(){this.concepts=new Map(this.bank.concepts.map(c=>[c.id,c]));this.questions=new Map(this.bank.questions.map(q=>[q.id,q]));}
    reset(){this.stats=Object.create(null);this.exposed=new Set();this.records=[];this.recent=[];this.startedAt=new Date().toISOString();this.batch=null;}
    info(q){const c=this.concepts.get(q.concept);return {concept:c,source:this.bank.sources[c.sourceId],reviewStatus:q.reviewStatus||c.reviewStatus};}
    ensure(id){return this.stats[id] ||= {attempts:0,correct:0,wrong:0,unassistedCorrect:0,streak:0,lastAt:-100,successAt:[],variants:[]};}
    level(id){const s=this.stats[id];if(!s)return 'Not tried';if(s.wrong>0&&s.streak===0)return 'Needs review';if(s.unassistedCorrect>=2&&new Set(s.variants).size>=2&&s.successAt.at(-1)-s.successAt[0]>=3)return 'Practiced';return 'Building';}
    weakConcepts(){return new Set(Object.entries(this.stats).filter(([,s])=>s.wrong>0&&s.streak<2).map(([id])=>id));}
    candidates(config={}) {
      const weak=this.weakConcepts();
      return this.bank.questions.filter(q=>{
        const c=this.concepts.get(q.concept);
        if(config.excludeTopics?.includes(c.topic))return false;
        if((config.topics?.length||config.focusConcepts?.length) && !config.topics?.includes(c.topic)&&!config.focusConcepts?.includes(c.id))return false;
        if(config.weakOnly&&!weak.has(c.id))return false;
        if(config.difficulty && config.difficulty!=='adaptive'&&config.difficulty!=='any'&&q.difficulty!==Number(config.difficulty))return false;
        if(!config.allowSeen&&this.exposed.has(q.id))return false;
        return true;
      });
    }
    score(q,config){
      const c=this.concepts.get(q.concept),s=this.stats[c.id],weak=s&&s.wrong>0&&s.streak<2;
      let w=(c.priority||1)*(s?1:1.7)*(weak?4:1);
      if(this.level(c.id)==='Practiced')w*=.35;
      if(this.exposed.has(q.id))w*=.08;
      if(this.recent.slice(-3).includes(c.id))w*=.05;
      const recent=this.records.slice(-6),acc=recent.length?recent.filter(r=>r.correct).length/recent.length:.6;
      const target=recent.length>=4?(acc>=.8?3:acc<.5?1:2):2;
      if(config.difficulty==='adaptive')w*=q.difficulty===target?1.8:.75;
      const topicCount=this.records.filter(r=>r.topic===c.topic).length;
      w*=1/(1+.08*topicCount);
      return w;
    }
    start(config={}) {
      const cfg={count:5,topics:[],excludeTopics:[],focusConcepts:[],difficulty:'adaptive',weakOnly:false,allowSeen:false,mode:'learn',...config};
      cfg.count=Math.max(1,Math.min(50,Math.floor(Number(cfg.count))||5));
      const candidates=this.candidates(cfg);
      if(!candidates.length) return {ok:false,available:0,reason:cfg.weakOnly&&!this.weakConcepts().size?'No unresolved mistakes yet. Try a mixed round first.':'No matching unasked questions remain at these settings. Broaden the topic or level, import a pack, or explicitly allow review.'};
      this.batch={config:cfg,target:Math.min(cfg.count,candidates.length),requested:cfg.count,answers:[],current:null,finished:false,queue:[],presented:new Set()};
      if(cfg.mode==='mock'){
        let pool=shuffle(candidates,this.rng),used=new Set(),counts={};
        while(this.batch.queue.length<this.batch.target){
          let eligible=pool.filter(q=>!used.has(q.concept));if(!eligible.length)eligible=pool;
          eligible.sort((a,b)=>(counts[this.concepts.get(a.concept).topic]||0)-(counts[this.concepts.get(b.concept).topic]||0));
          const q=eligible[0];this.batch.queue.push(q);used.add(q.concept);const t=this.concepts.get(q.concept).topic;counts[t]=(counts[t]||0)+1;pool=pool.filter(p=>p.id!==q.id);
        }
      }
      return {ok:true,available:candidates.length,target:this.batch.target,requested:cfg.count};
    }
    next(){
      const b=this.batch;if(!b||b.finished)return null;
      if(b.current&&!b.current.submitted)return b.current;
      if(b.answers.length>=b.target){this.finish();return null;}
      let q;
      if(b.config.mode==='mock')q=b.queue[b.answers.length];
      else {
        let pool=this.candidates(b.config).filter(p=>!b.presented.has(p.id));
        if(!pool.length){this.finish();return null;}
        // Prefer unexposed variants before any explicit review repetitions.
        const fresh=pool.filter(p=>!this.exposed.has(p.id));if(fresh.length)pool=fresh;
        const cooled=pool.filter(p=>!this.recent.slice(-3).includes(p.concept));if(cooled.length)pool=cooled;
        const weights=pool.map(p=>this.score(p,b.config));let pick=this.rng()*weights.reduce((a,v)=>a+v,0);q=pool[pool.length-1];
        for(let i=0;i<pool.length;i++){pick-=weights[i];if(pick<0){q=pool[i];break;}}
      }
      const repeat=this.exposed.has(q.id);this.exposed.add(q.id);b.presented.add(q.id);
      b.current={question:q,choices:shuffle(q.choices,this.rng),submitted:false,hintUsed:false,repeat};return b.current;
    }
    hint(){if(this.batch?.current&&this.batch.config.mode!=='mock'&&!this.batch.current.submitted)this.batch.current.hintUsed=true;}
    submit(choiceId){
      const b=this.batch,v=b?.current;
      if(!v||v.submitted)throw new Error('This question is not awaiting an answer.');
      if(!v.question.choices.some(c=>c.id===choiceId))throw new Error('Choose one of the displayed answers.');
      v.submitted=true;v.choiceId=choiceId;
      const q=v.question,r={questionId:q.id,concept:q.concept,topic:this.concepts.get(q.concept).topic,choiceId,correct:choiceId===q.correctId,hintUsed:v.hintUsed,mode:b.config.mode,repeat:v.repeat};
      b.answers.push(r);
      if(b.config.mode!=='mock')this.record(r);
      // Mock records and results are withheld until the entire check is complete.
      if(b.answers.length===b.target)this.finish();
      return b.config.mode==='mock'&&!b.finished?{deferred:true}:{...r};
    }
    record(r){
      const s=this.ensure(r.concept),i=this.records.length;
      s.attempts++;s.lastAt=i;
      if(r.correct){s.correct++;if(!r.hintUsed){s.streak++;s.unassistedCorrect++;s.successAt.push(i);s.variants.push(r.questionId);}}
      else{s.wrong++;s.streak=0;s.successAt=[];s.variants=[];s.unassistedCorrect=0;}
      this.records.push({...r,index:i});this.recent.push(r.concept);
    }
    finish(){const b=this.batch;if(!b||b.finished)return;b.finished=true;if(b.config.mode==='mock')for(const r of b.answers)this.record(r);}
    summary(){const n=this.records.length;return {answered:n,correct:this.records.filter(r=>r.correct).length,accuracy:n?Math.round(100*this.records.filter(r=>r.correct).length/n):null,attemptedConcepts:Object.keys(this.stats).length,practiced:Object.keys(this.stats).filter(id=>this.level(id)==='Practiced').length,seen:this.exposed.size,remaining:this.bank.questions.length-this.exposed.size};}
    addPack(pack){
      const errors=validatePack(pack,this.bank);if(errors.length)throw new Error(errors.join('\n'));
      // Imported claims of review are never trusted as an automatic certification.
      const p=structuredClone(pack);for(const c of p.concepts)c.reviewStatus='needs-source-review';for(const q of p.questions)q.reviewStatus='needs-source-review';
      Object.assign(this.bank.sources,p.sources);this.bank.concepts.push(...p.concepts);this.bank.questions.push(...p.questions);this.reindex();return p.questions.length;
    }
    generationPrompt(request='More fresh handbook-based questions'){
      const tried=this.records.map(r=>({id:r.questionId,correct:r.correct,concept:r.concept}));
      const existing=this.bank.questions.map(q=>({id:q.id,concept:q.concept,stem:q.stem,illustration:q.assetDescription||null}));
      return `Create an original JSON question pack for Road Ready. Request: ${request}\n\nUse ONLY the current official NCDOT North Carolina Driver Handbook at ${this.bank.sources.handbook.url}. Fetch and read it before authoring. If it is unavailable, say so; do not claim verification. Questions should be single-select, four plausible choices, one defensible correct answer, and specific explanatory feedback for EVERY choice. Preserve exceptions and distinguish handbook recommendations from legal absolutes. Do not duplicate existing question scenarios merely by changing names. No arbitrary new numeric rules. No emergency directions beyond the source. No claims about my DMV readiness.\n\nReturn only a JSON object with schemaVersion:1, packId (unique lowercase identifier), title, sources (object; reuse source ids without redefining them), concepts (array; define only NEW concept ids), and questions. You may reuse the existing concept ids below without redefining them. Every new concept needs id,title,topic,tags,summary,sourceId,section,pdfPage (one-based PDF page only when verified; otherwise null),reviewStatus ('needs-source-review'),priority (1). New source URLs must be an official handbook or regulatory/warning-sign PDF under https://www.ncdot.gov/dmv/license-id/driver-licenses/new-drivers/Documents/. Reuse the existing handbook source rather than adding other websites. Every question needs id,concept,difficulty (1=basic,2=standard,3=applied),stem,hint,choices (four objects: id,text,feedback),correctId. Do not add external images, scripts, HTML, or API keys. Imported content will remain marked unverified pending review.\n\nTopics: ${JSON.stringify(TOPICS)}\nExisting source ids: ${JSON.stringify(Object.keys(this.bank.sources))}\nExisting concepts: ${JSON.stringify(this.bank.concepts.map(c=>({id:c.id,topic:c.topic,summary:c.summary})))}\n\nActual answers in THIS browser session only: ${JSON.stringify(tried)}\n\nExisting questions to avoid duplicating: ${JSON.stringify(existing)}`;
    }
    exportReport(){return {format:'road-ready-session-report',version:1,startedAt:this.startedAt,exportedAt:new Date().toISOString(),note:'Manually exported; the app did not persist or transmit this session. No earlier chat scores are included.',summary:this.summary(),records:this.records.map(r=>({...r,stem:this.questions.get(r.questionId).stem})),stats:this.stats};}
  }
  return {TOPICS,MAX_PACK_BYTES,norm,fingerprint,sourceUrl,shuffle,validatePack,parseRequest,Session};
});
