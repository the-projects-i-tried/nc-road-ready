#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),cp=require('node:child_process');
const {validatePack,MAX_PACK_BYTES}=require('../site/js/engine.js');
try{
 const file=process.argv[2];if(!file)throw new Error('Usage: npm run add-pack -- /path/to/pack.json');
 if(fs.statSync(file).size>MAX_PACK_BYTES)throw new Error('Pack exceeds 5 MB.');
 const p=JSON.parse(fs.readFileSync(file,'utf8'));
 // Regenerate before merging so existing extra packs are included in validation.
 cp.execFileSync(process.execPath,[path.join(__dirname,'build.cjs')],{stdio:'inherit'});
 const context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../site/js/bank.js'),'utf8'),context);
 const errors=validatePack(p,context.window.ROAD_READY_BANK);if(errors.length)throw new Error(errors.join('\n'));
 for(const q of p.questions){if(q.asset&&!fs.existsSync(path.join(__dirname,'../site',q.asset)))throw new Error(`Missing illustration: ${q.asset}`);q.reviewStatus='needs-source-review';}
 for(const c of p.concepts)c.reviewStatus='needs-source-review';
 const dest=path.join(__dirname,'../content/packs',p.packId+'.json');if(fs.existsSync(dest))throw new Error('Pack filename already exists.');
 fs.writeFileSync(dest,JSON.stringify(p,null,2)+'\n');
 try{cp.execFileSync(process.execPath,[path.join(__dirname,'build.cjs')],{stdio:'inherit'});}catch(e){fs.unlinkSync(dest);throw e;}
 console.log('Pack added as needs-source-review. Review it, then commit content/ and site/js/bank.js.');
}catch(e){console.error(e.message);process.exit(1);}
