#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
const {validatePack,MAX_PACK_BYTES}=require('../site/js/engine.js');
const file=process.argv[2]||path.join(__dirname,'../content/core.json');
try{
 if(fs.statSync(file).size>MAX_PACK_BYTES)throw new Error('Pack exceeds 5 MB.');
 const p=JSON.parse(fs.readFileSync(file,'utf8'));
 const base=process.argv.includes('--against-core')?JSON.parse(fs.readFileSync(path.join(__dirname,'../content/core.json'),'utf8')):null;
 const errors=validatePack(p,base);if(errors.length)throw new Error(errors.join('\n'));
 console.log(`Format valid: ${p.questions.length} questions. This is NOT a factual-accuracy check.`);
}catch(e){console.error(e.message);process.exit(1);}
