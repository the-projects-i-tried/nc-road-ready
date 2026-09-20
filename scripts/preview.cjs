#!/usr/bin/env node
'use strict';
// Distribution convenience: a single offline HTML file with exact CSP hashes.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),site=path.join(root,'site');
const hash=s=>"'sha256-"+crypto.createHash('sha256').update(s).digest('base64')+"'";
const data=f=>'data:image/svg+xml;base64,'+fs.readFileSync(path.join(site,f)).toString('base64');
let html=fs.readFileSync(path.join(site,'index.html'),'utf8');
const css=fs.readFileSync(path.join(site,'styles.css'),'utf8');
const images={};for(const f of fs.readdirSync(path.join(site,'assets')))if(f.endsWith('.svg'))images['assets/'+f]=data('assets/'+f);
const scripts=['engine.js','bank.js','submission.js'].map(f=>fs.readFileSync(path.join(site,'js',f),'utf8'));
scripts.push('window.ROAD_READY_IMAGES = '+JSON.stringify(images)+';');
scripts.push(fs.readFileSync(path.join(site,'js/app.js'),'utf8'));
html=html.replace(/<script defer src="[^"]+"><\/script>/g,'');
html=html.replace('<link rel="stylesheet" href="styles.css">','<style>'+css+'</style>');
html=html.replace(/(?:href|src)="(assets\/[^\"]+\.svg)"/g,(m,f)=>m.replace(f,images[f]));
html=html.replace(/<meta http-equiv="Content-Security-Policy"[^>]+>/,
 '<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; script-src '+scripts.map(hash).join(' ')+'; style-src '+hash(css)+'; img-src data:; connect-src \'none\'; object-src \'none\'; base-uri \'none\'; form-action \'none\'">');
html=html.replace('</body>',()=>scripts.map(s=>'<script>'+s+'</script>').join('\n')+'\n</body>');
const out=path.resolve(process.argv[2]||path.join(root,'road-ready.html'));fs.writeFileSync(out,html);console.log('Standalone preview: '+out);
