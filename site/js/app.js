/* UI layer: all user and pack strings are rendered as text, never as HTML. */
(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const node=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
  let session,selectedTopics=new Set(),pendingPack=null,toastTimer,lastConfig=null;
  const RR=window.RoadReady,base=window.ROAD_READY_BANK;
  if(!RR||!base){$('fatal').hidden=false;$('fatal').textContent='The local question bank could not load. Keep the site/ folder together and run npm run build from the repository if it has been edited.';return;}
  try{session=new RR.Session(base);}catch(e){$('fatal').hidden=false;$('fatal').textContent='Question bank validation failed: '+e.message;return;}
  if(new URLSearchParams(location.search).get('embed')==='1')document.body.classList.add('embed');
  function toast(text){clearTimeout(toastTimer);$('toast').textContent=text;$('toast').hidden=false;toastTimer=setTimeout(()=>$('toast').hidden=true,5500);}
  function status(text,error=false){$('request-status').textContent=text;$('request-status').className='inline-status'+(error?' error':'');$('request-status').hidden=false;}
  function showPane(name){
    if(!['practice','session','lab','about'].includes(name))return;
    for(const p of document.querySelectorAll('.pane'))p.hidden=p.id!=='pane-'+name;
    for(const b of document.querySelectorAll('.nav-button')){b.classList.toggle('active',b.dataset.pane===name);if(b.dataset.pane===name)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');}
    if(name==='session')renderHistory();if(name==='lab')renderLibrary();if(name==='about')renderAbout();
    window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  }
  document.querySelectorAll('[data-pane]').forEach(b=>b.addEventListener('click',()=>showPane(b.dataset.pane)));
  function download(name,text,type='application/json'){
    const url=URL.createObjectURL(new Blob([text],{type})),a=node('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  async function copy(text,fallbackName){
    try{await navigator.clipboard.writeText(text);toast('Copied. Nothing was sent anywhere.');}
    catch{
      const t=node('textarea');t.value=text;t.className='sr-only';document.body.append(t);t.select();
      let ok=false;try{ok=document.execCommand('copy');}catch{}t.remove();
      if(ok)toast('Copied. Nothing was sent anywhere.');else{download(fallbackName,text,'text/plain');toast('Clipboard unavailable here. Downloaded a text file instead.');}
    }
  }
  function sourceLine(q){
    const {concept:c,source:s,reviewStatus}=session.info(q),box=node('div',undefined,'source-line');
    const badge=node('span',reviewStatus==='source-checked'?'SOURCE CHECKED':'SOURCE REVIEW PENDING','badge'+(reviewStatus==='source-checked'?'':' amber'));box.append(badge);
    const a=node('a',s.title+' · '+c.section+(c.pdfPage?' · PDF p. '+c.pdfPage:'')+' ↗');
    a.href=s.url+(c.pdfPage?'#page='+c.pdfPage:'');a.target='_blank';a.rel='noopener noreferrer';box.append(a);
    if(reviewStatus!=='source-checked')box.append(node('span','Source link provided; current PDF verification is pending.'));
    return box;
  }
  function describe(cfg){
    const topics=(cfg.topics||[]).map(t=>RR.TOPICS[t]);
    if(cfg.focusConcepts?.length)topics.push(...cfg.focusConcepts.map(id=>session.concepts.get(id)?.title||id));
    const excluded=(cfg.excludeTopics||[]).map(t=>RR.TOPICS[t]);
    return [(topics.length?topics.join(', '):'Mixed topics'),excluded.length?'excluding '+excluded.join(', '):'',
      cfg.weakOnly?'Unresolved mistakes':'',cfg.difficulty==='adaptive'?'Adaptive level':cfg.difficulty==='any'?'Any level':['','Basics','Standard','Applied scenarios'][Number(cfg.difficulty)],
      cfg.allowSeen?'Review permitted':'Fresh variants only',cfg.mode==='mock'?'Feedback at the end':'Feedback after every answer'].filter(Boolean).join(' · ');
  }
  function startRound(cfg){
    if(session.batch?.config.mode==='mock'&&!session.batch.finished&&session.batch.answers.length){
      if(!confirm('Leave this unfinished check? Its ungraded answers will be discarded.'))return;
    }
    const result=session.start(cfg);
    if(!result.ok){status(result.reason,true);showPane('practice');return;}
    lastConfig={...session.batch.config};
    status(describe(lastConfig)+(result.target<result.requested?` · Only ${result.target} matching questions available, so this round is shorter.`:''));
    $('welcome-card').hidden=true;$('round-summary').hidden=true;showPane('practice');renderNext();
  }
  function renderNext(){
    const view=session.next();if(!view){showRoundSummary();return;}
    const q=view.question,b=session.batch,c=session.concepts.get(q.concept);
    $('question-card').hidden=false;$('round-summary').hidden=true;
    $('round-label').textContent=(b.config.mode==='mock'?'PRACTICE CHECK':'LEARNING ROUND')+' · '+(b.answers.length+1)+' OF '+b.target;
    $('question-topic').textContent=RR.TOPICS[c.topic];$('round-progress').max=b.target;$('round-progress').value=b.answers.length;
    $('question-level').textContent=['','Basics','Standard','Applied scenario'][q.difficulty];
    const s=session.stats[q.concept];
    $('selection-note').textContent=view.repeat?'Previously seen · review':s?.wrong&&s.streak<2?'Another angle on a missed rule':s?'New variant of a familiar rule':'New rule for this session';
    $('question-stem').textContent=q.stem;
    $('question-figure').hidden=!q.asset;
    if(q.asset){$('question-image').src=window.ROAD_READY_IMAGES?.[q.asset]||q.asset;$('question-image').alt=q.assetDescription;}else{$('question-image').removeAttribute('src');$('question-image').alt='';}
    $('choices').replaceChildren();
    view.choices.forEach((ch,i)=>{
      const label=node('label',undefined,'choice');label.dataset.choiceId=ch.id;
      const input=node('input');input.type='radio';input.name='answer';input.value=ch.id;input.id='answer-'+i;
      input.addEventListener('change',()=>{$('check-button').disabled=false;});
      const letter=node('span',String.fromCharCode(65+i),'choice-letter');letter.setAttribute('aria-hidden','true');
      const body=node('span',undefined,'choice-body');body.append(node('span',ch.text,'choice-text'));
      label.append(input,letter,body);$('choices').append(label);
    });
    $('answer-result').hidden=true;$('source-line').hidden=true;$('source-line').replaceChildren();$('after-answer').hidden=true;$('hint-text').hidden=true;
    document.querySelector('.answer-actions').hidden=false;$('hint-button').hidden=b.config.mode==='mock';$('hint-button').disabled=false;
    $('check-button').disabled=true;$('check-button').textContent=b.config.mode==='mock'?'Record answer':'Check answer';
    renderStats();
    if(b.answers.length)$('question-stem').focus({preventScroll:true});
    $('question-card').scrollIntoView({block:'nearest',behavior:'smooth'});
  }
  $('answer-form').addEventListener('submit',event=>{
    event.preventDefault();const selected=document.querySelector('input[name=answer]:checked');if(!selected)return;
    try{
      session.submit(selected.value);
      const b=session.batch,v=b.current,q=v.question,isMock=b.config.mode==='mock';
      for(const label of $('choices').children){
        const ch=q.choices.find(c=>c.id===label.dataset.choiceId);label.classList.add('answered');label.querySelector('input').disabled=true;
        if(!isMock){
          const correct=ch.id===q.correctId,chosen=ch.id===selected.value;
          if(correct)label.classList.add('correct');else if(chosen)label.classList.add('incorrect');
          const body=label.querySelector('.choice-body');
          if(correct||chosen)body.append(node('span',correct?(chosen?'Your answer · correct':'Correct answer'):'Your answer · not correct','choice-status'));
          body.append(node('span',ch.feedback,'choice-feedback'));
        }
      }
      document.querySelector('.answer-actions').hidden=true;
      const correct=selected.value===q.correctId;
      $('answer-result').className='answer-result'+(!isMock&&!correct?' incorrect':'');
      $('answer-result').textContent=isMock?'Answer recorded. Explanations will appear at the end of the check.':correct?(v.hintUsed?'Correct with a hint. This helps practice, but does not count as an unassisted success.':'Correct. Read the alternatives to see why the distinction matters.'):'Not quite. The correct answer and the reason for every choice are shown above.';
      $('answer-result').hidden=false;
      if(!isMock){$('source-line').replaceChildren(...sourceLine(q).childNodes);$('source-line').hidden=false;}
      $('after-answer').hidden=false;$('report-question').hidden=isMock&&!b.finished;
      $('next-button').textContent=b.finished?'See round results →':'Next question →';
      $('round-progress').value=b.answers.length;renderStats();
    }catch(e){toast(e.message);}
  });
  $('hint-button').addEventListener('click',()=>{session.hint();$('hint-text').textContent=session.batch.current.question.hint;$('hint-text').hidden=false;$('hint-button').disabled=true;});
  $('next-button').addEventListener('click',renderNext);
  function reviewEntry(r,idx){
    const q=session.questions.get(r.questionId),d=node('details',undefined,'review-entry');
    const title=node('summary',`${r.correct?'✓':'×'} ${idx+1}. ${q.stem}`);d.append(title);
    const c=session.concepts.get(q.concept);d.append(node('p',RR.TOPICS[c.topic]+' · '+(r.hintUsed?'Hint used · ':'')+q.id,'review-label'));
    // Deliberately display every distractor explanation, not just the selected choice.
    q.choices.forEach(ch=>{const correct=ch.id===q.correctId,chosen=ch.id===r.choiceId;const div=node('div',undefined,'review-choice'+(correct?' right-answer':chosen?' wrong-answer':''));div.append(node('strong',ch.text+(correct?' — correct':'')+(chosen?' · your answer':'')),node('span',ch.feedback));d.append(div);});
    d.append(sourceLine(q));return d;
  }
  function showRoundSummary(){
    const b=session.batch;if(!b)return;
    $('question-card').hidden=true;$('round-summary').hidden=false;
    const correct=b.answers.filter(a=>a.correct).length,n=b.answers.length;
    $('round-summary-title').textContent=`${correct} of ${n}. Keep the understanding.`;
    const misses=[...new Set(b.answers.filter(a=>!a.correct).map(a=>session.concepts.get(a.concept).title))];
    $('round-summary-copy').textContent=misses.length?'Worth another look: '+misses.join(', ')+'. A fresh round will give unresolved mistakes extra attention when another matching question is available.':'No misses in this round. Keep exploring; one successful round is not proof that every rule is mastered.';
    if(n<b.requested)$('round-summary-copy').append(' This round ended with '+n+' matching questions rather than the requested '+b.requested+'.');
    $('batch-review').replaceChildren(...b.answers.map(reviewEntry));
    $('weak-round').disabled=!session.weakConcepts().size;
    $('round-summary-title').focus({preventScroll:true});$('round-summary').scrollIntoView({block:'nearest',behavior:'smooth'});renderStats();
  }
  function renderStats(){
    const s=session.summary();$('stat-accuracy').textContent=s.accuracy===null?'—':s.accuracy+'%';$('stat-answered').textContent=s.answered;$('stat-practiced').textContent=s.practiced;$('stat-fresh').textContent=s.remaining;
    $('bank-count').textContent=session.bank.questions.length+' questions · '+session.bank.concepts.length+' rules';
    $('weak-list').replaceChildren();const weak=[...session.weakConcepts()].sort((a,b)=>session.stats[b].wrong-session.stats[a].wrong).slice(0,4);
    if(!weak.length)$('weak-list').append(node('p',s.answered?'No unresolved mistakes yet. Keep exploring new rules.':'Your first round will give us something to work with.','muted'));
    for(const id of weak){const item=node('div',undefined,'weak-item');item.append(node('span',session.concepts.get(id).title));const b=node('button','Try again');b.addEventListener('click',()=>startRound({count:5,focusConcepts:[id],difficulty:'adaptive',allowSeen:false}));item.append(b);$('weak-list').append(item);}
  }
  function renderHistory(){
    const s=session.summary();$('session-topics').replaceChildren();
    for(const [id,title]of Object.entries(RR.TOPICS)){
      const rs=session.records.filter(r=>r.topic===id);if(!rs.length)continue;
      const card=node('div',undefined,'topic-summary');card.append(node('strong',title),node('span',`${rs.filter(r=>r.correct).length} / ${rs.length} correct · ${new Set(rs.map(r=>r.concept)).size} rules tried`));$('session-topics').append(card);
    }
    const records=session.records.map((r,i)=>({r,i})).filter(({r})=>!$('only-missed').checked||!r.correct).reverse();
    $('session-history').replaceChildren(...records.map(({r,i})=>reviewEntry(r,i)));
    if(!records.length)$('session-history').append(node('p',s.answered?'No mistakes to show with this filter.':'No answers yet. Start a practice round to build your learning trail.','empty-state'));
  }
  function renderAbout(){
    const checked=session.bank.questions.filter(q=>session.info(q).reviewStatus==='source-checked').length;
    const pending=session.bank.questions.length-checked;
    $('source-notice-copy').textContent=`${checked} of ${session.bank.questions.length} questions are source checked. ${pending?`${pending} ${pending===1?'question still needs':'questions still need'} source review.`:'The built-in bank includes handbook page references and reviewed sign illustrations.'}`;
    $('source-notice-badge').className='badge'+(pending?' amber':'');
    $('review-status-copy').textContent=`This bank contains ${session.bank.questions.length} authored question variants grouped into ${session.bank.concepts.length} rule families. ${checked} questions were checked against official NCDOT sources; ${pending} questions remain marked “Source review pending.” Built-in handbook review: ${base.sources.handbook.checkedOn}.`;
    $('finite-copy').textContent=`There are ${session.bank.questions.length} question formulations, not an infinite set of distinct facts. Several questions apply the same rule in different scenarios. New question packs can extend the collection indefinitely, but their content must be reviewed.`;
  }
  function renderLibrary(){
    const term=RR.norm($('library-search').value),rules=session.bank.concepts.filter(c=>RR.norm([c.title,c.summary,RR.TOPICS[c.topic],...c.tags].join(' ')).includes(term));
    $('library-total').textContent=rules.length+' RULES';$('rule-library').replaceChildren();
    for(const c of rules){
      const d=node('details',undefined,'library-rule'),sm=node('summary');sm.append(node('span',c.title),node('span',RR.TOPICS[c.topic],'rule-label'));d.append(sm,node('p',c.summary));
      const q=session.bank.questions.find(q=>q.concept===c.id);d.append(sourceLine(q));
      const b=node('button','Practice this rule →','text-button');b.addEventListener('click',()=>startRound({count:5,focusConcepts:[c.id],difficulty:'adaptive'}));d.append(b);$('rule-library').append(d);
    }
    if(!rules.length)$('rule-library').append(node('p','No matching rules. Try a broader word such as “bus” or “brake.”','empty-state'));
  }
  function settings(){return {count:Number($('round-length').value),difficulty:$('difficulty').value,topics:[...selectedTopics],allowSeen:$('allow-review').checked,mode:'learn'};}
  for(const[id,title]of Object.entries(RR.TOPICS)){
    const b=node('button',title,'topic-chip');b.type='button';b.setAttribute('aria-pressed','false');b.dataset.topic=id;b.addEventListener('click',()=>{if(selectedTopics.has(id))selectedTopics.delete(id);else selectedTopics.add(id);b.setAttribute('aria-pressed',String(selectedTopics.has(id)));});$('topic-chips').append(b);
  }
  $('settings-form').addEventListener('submit',e=>{e.preventDefault();startRound(settings());});
  $('request-form').addEventListener('submit',e=>{
    e.preventDefault();const text=$('request-input').value.trim();if(!text){startRound(settings());return;}
    const cfg=RR.parseRequest(text,{count:Number($('round-length').value),difficulty:'adaptive',concepts:session.bank.concepts});
    if(!cfg.recognized){status('I could not match that request to a topic. Try “5 questions on school buses,” “ABS,” or choose topics below. This is a local keyword matcher, not a chatbot.',true);return;}
    if(!cfg.topics.length&&!cfg.focusConcepts.length&&!cfg.excludeTopics.length&&!/\b(mix|mixed|everything|all topics|any topic)\b/i.test(text)&&!cfg.weakOnly&&lastConfig){cfg.topics=lastConfig.topics;cfg.focusConcepts=lastConfig.focusConcepts;}
    startRound(cfg);
  });
  document.querySelectorAll('[data-prompt]').forEach(b=>b.addEventListener('click',()=>{$('request-input').value=b.dataset.prompt;$('request-form').requestSubmit();}));
  $('quick-start').addEventListener('click',()=>startRound({count:5}));
  $('mock-start').addEventListener('click',()=>startRound({count:25,mode:'mock',difficulty:'any'}));
  $('another-round').addEventListener('click',()=>startRound({count:5}));
  $('weak-round').addEventListener('click',()=>startRound({count:5,weakOnly:true,difficulty:'adaptive',allowSeen:false}));
  $('only-missed').addEventListener('change',renderHistory);
  $('download-report').addEventListener('click',()=>download('road-ready-session.json',JSON.stringify(session.exportReport(),null,2)));
  $('reset-session').addEventListener('click',()=>{
    if(!confirm('Clear this session’s answers, exposure history, and imported packs? Nothing has been saved automatically.'))return;
    session=new RR.Session(base);lastConfig=null;pendingPack=null;
    $('welcome-card').hidden=false;$('question-card').hidden=true;$('round-summary').hidden=true;$('request-status').hidden=true;$('pack-preview').hidden=true;$('import-controls').hidden=true;$('issue-panel').hidden=true;
    renderStats();renderAbout();showPane('practice');toast('Fresh session. No past answers are assumed.');
  });
  $('copy-prompt').addEventListener('click',()=>copy(session.generationPrompt($('lab-request').value.trim()||'Add 20 genuinely new Class C practice scenarios.'),'road-ready-authoring-prompt.md'));
  $('download-prompt').addEventListener('click',()=>{download('road-ready-authoring-prompt.md',session.generationPrompt($('lab-request').value.trim()||'Add 20 genuinely new Class C practice scenarios.'),'text/markdown');toast('Prompt downloaded. It includes this session’s answers only.');});
  function previewPack(){
    pendingPack=null;$('import-controls').hidden=true;$('pack-ack').checked=false;$('import-pack').disabled=true;
    try{
      const text=$('pack-json').value;if(new Blob([text]).size>RR.MAX_PACK_BYTES)throw new Error('This pack exceeds the 5 MB limit.');
      const pack=JSON.parse(text),errors=RR.validatePack(pack,session.bank);
      const assets=new Set(base.questions.filter(q=>q.asset).map(q=>q.asset));
      for(const q of pack.questions||[])if(q?.asset&&!assets.has(q.asset))errors.push('Only existing bundled sign illustrations may be used: '+q.asset);
      if(errors.length)throw new Error(errors.slice(0,20).join('\n')+(errors.length>20?'\nMore errors omitted.':''));
      pendingPack=pack;$('pack-preview').className='pack-preview';$('pack-preview').textContent=`Format valid: ${pack.title}\n${pack.questions.length} new question variants; ${pack.concepts.length} new rule families.\n\nPreview:\n`+pack.questions.slice(0,3).map((q,i)=>`${i+1}. ${q.stem}`).join('\n')+'\n\nAll imported questions will remain unverified. Structure checks cannot determine whether the answers are true.';
      $('pack-preview').hidden=false;$('import-controls').hidden=false;
    }catch(e){$('pack-preview').className='pack-preview error';$('pack-preview').textContent=e.message;$('pack-preview').hidden=false;}
  }
  $('validate-pack').addEventListener('click',previewPack);
  $('pack-file').addEventListener('change',async()=>{
    const f=$('pack-file').files[0];if(!f)return;
    if(f.size>RR.MAX_PACK_BYTES){$('pack-preview').className='pack-preview error';$('pack-preview').textContent='This pack exceeds the 5 MB limit.';$('pack-preview').hidden=false;return;}
    try{$('pack-json').value=await f.text();previewPack();}catch(e){toast('Could not read the file: '+e.message);}
  });
  $('pack-json').addEventListener('input',()=>{pendingPack=null;$('import-controls').hidden=true;});
  $('pack-ack').addEventListener('change',()=>$('import-pack').disabled=!$('pack-ack').checked);
  $('import-pack').addEventListener('click',()=>{
    if(!pendingPack||!$('pack-ack').checked)return;
    try{const n=session.addPack(pendingPack);pendingPack=null;$('import-controls').hidden=true;$('pack-preview').textContent=`Added ${n} unverified questions to this session. A refresh removes this imported pack; adding it to the repository makes it permanent for future visits.`;renderStats();renderLibrary();renderAbout();toast(n+' questions added to this session.');}catch(e){toast(e.message);}
  });
  $('library-search').addEventListener('input',renderLibrary);
  $('report-question').addEventListener('click',()=>{
    const q=session.batch?.current?.question;if(!q)return;const {concept:c,source:s}=session.info(q);
    $('issue-text').value=`Question report\n\nQuestion id: ${q.id}\nRule: ${q.concept}\nPrompt: ${q.stem}\n\nChoices:\n${q.choices.map(ch=>'- '+ch.text+(ch.id===q.correctId?' [keyed correct]':'')+'\n  '+ch.feedback).join('\n')}\n\nCited source: ${s.url}\nSection: ${c.section}\nReview status: ${session.info(q).reviewStatus}\n\nWhat appears wrong or ambiguous:\n[Add your explanation and the relevant handbook page.]\n`;
    $('issue-panel').hidden=false;showPane('lab');$('issue-panel').scrollIntoView({block:'start',behavior:'smooth'});
  });
  $('copy-issue').addEventListener('click',()=>copy($('issue-text').value,'road-ready-question-report.md'));
  document.addEventListener('keydown',e=>{
    if(e.altKey||e.ctrlKey||e.metaKey||e.repeat||$('pane-practice').hidden||$('question-card').hidden)return;
    if(['TEXTAREA','SELECT'].includes(e.target.tagName)||e.target.tagName==='INPUT'&&e.target.type!=='radio')return;
    const v=session.batch?.current;if(!v)return;
    if(/^[1-4]$/.test(e.key)&&!v.submitted){const input=$('answer-'+(Number(e.key)-1));if(input){input.checked=true;input.focus();$('check-button').disabled=false;e.preventDefault();}}
    else if(e.key==='Enter'&&e.target.tagName!=='BUTTON'){
      if(v.submitted){e.preventDefault();renderNext();}else if(!$('check-button').disabled){e.preventDefault();$('answer-form').requestSubmit();}
    }
  });
  renderStats();renderAbout();
})();
