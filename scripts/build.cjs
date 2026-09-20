#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
const {validatePack}=require('../site/js/engine.js');
const root=path.resolve(__dirname,'..');
let bank=JSON.parse(fs.readFileSync(path.join(root,'content/core.json'),'utf8'));
let errors=validatePack(bank);
if(errors.length){console.error(errors.join('\n'));process.exit(1);}
const extras=fs.readdirSync(path.join(root,'content/packs')).filter(f=>f.endsWith('.json')).sort();
for(const file of extras){
 const p=JSON.parse(fs.readFileSync(path.join(root,'content/packs',file),'utf8'));
 errors=validatePack(p,bank);if(errors.length){console.error(file,errors);process.exit(1);}
 Object.assign(bank.sources,p.sources);bank.concepts.push(...p.concepts);bank.questions.push(...p.questions);
}
for(const q of bank.questions)if(q.asset&&!fs.existsSync(path.join(root,'site',q.asset))){console.error('Missing asset',q.asset);process.exit(1);}
const stats={concepts:bank.concepts.length,questions:bank.questions.length,sourceCheckedQuestions:bank.questions.filter(q=>(q.reviewStatus||bank.concepts.find(c=>c.id===q.concept).reviewStatus)==='source-checked').length};
bank.buildStats=stats;
const js='/* Generated from content/core.json and content/packs/*.json. Run npm run build. */\nwindow.ROAD_READY_BANK = '+JSON.stringify(bank,null,0).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029')+';\n';
const dest=path.join(root,'site/js/bank.js');
if(process.argv.includes('--check')){
 if(!fs.existsSync(dest)||fs.readFileSync(dest,'utf8')!==js){console.error('Compiled bank is stale. Run npm run build.');process.exit(1);}
}else{
 fs.writeFileSync(dest,js);
 const lines=['# Question source-review queue','','This is not a certification of current driving law. Full-handbook entries were adapted from the preceding quiz conversation. The full PDF was unavailable during the build; no page numbers or edition were invented. The sign excerpts were inspected directly.','','| Rule | Topic | Variants | Source status | Source section |','|---|---|---:|---|---|'];
 for(const c of bank.concepts)lines.push(`| ${c.id} | ${c.topic} | ${bank.questions.filter(q=>q.concept===c.id).length} | ${c.reviewStatus} | ${c.section} |`);
 fs.writeFileSync(path.join(root,'docs/CONTENT_REVIEW.md'),lines.join('\n')+'\n');
}
console.log(`Bank: ${stats.questions} question variants / ${stats.concepts} rule families / ${stats.sourceCheckedQuestions} questions checked against official sign excerpts. ${stats.questions-stats.sourceCheckedQuestions} require a fresh handbook-source review.`);
