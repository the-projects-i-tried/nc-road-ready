'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const vm=require('node:vm');
const crypto=require('node:crypto');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
test('generated bank exactly matches validated source data',()=>{execFileSync(process.execPath,[path.join(root,'scripts/build.cjs'),'--check']);});
test('standalone preview embeds local resources with valid CSP hashes and unmodified JavaScript',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'road-ready-preview-'));
 try{
  const file=path.join(dir,'preview.html');execFileSync(process.execPath,[path.join(root,'scripts/preview.cjs'),file]);
  const html=fs.readFileSync(file,'utf8');
  assert.equal(/<script[^>]+src=/.test(html),false);assert.equal(/<link[^>]+href="styles.css"/.test(html),false);
  const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);assert.equal(scripts.length,4);
  const style=html.match(/<style>([\s\S]*?)<\/style>/)[1];
  for(const content of [...scripts,style]){const hash=crypto.createHash('sha256').update(content).digest('base64');assert.ok(html.includes("'sha256-"+hash+"'"));}
  assert.equal(scripts[0],fs.readFileSync(path.join(root,'site/js/engine.js'),'utf8'));
  assert.equal(scripts[3],fs.readFileSync(path.join(root,'site/js/app.js'),'utf8'));
  const context={window:{}};vm.runInNewContext(scripts[1],context);assert.ok(context.window.ROAD_READY_BANK.questions.length>=226);
  assert.ok(html.includes('data:image/svg+xml;base64,'));
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('site uses relative bundle paths suitable for an organization project subpath',()=>{
 const html=fs.readFileSync(path.join(root,'site/index.html'),'utf8');
 assert.equal(/(?:src|href)="\/(?!\/)/.test(html),false);
 for(const m of html.matchAll(/(?:src|href)="((?:js|assets)\/[^\"]+|styles\.css)"/g))assert.ok(fs.existsSync(path.join(root,'site',m[1])),m[1]);
 assert.ok(fs.existsSync(path.join(root,'site/.nojekyll')));
});
test('adding a pack permanently validates, demotes review status, compiles, and refuses duplicates',()=>{
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'road-ready-add-'));
 try{
  for(const dir of ['site','scripts','content','docs'])fs.cpSync(path.join(root,dir),path.join(tmp,dir),{recursive:true});
  const script=path.join(tmp,'scripts/add-pack.cjs'),sample=path.join(tmp,'docs/example-pack.json');
  execFileSync(process.execPath,[script,sample]);
  const pack=JSON.parse(fs.readFileSync(path.join(tmp,'content/packs/example-bus-pack.json'),'utf8'));
  assert.equal(pack.questions[0].reviewStatus,'needs-source-review');
  const context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(tmp,'site/js/bank.js'),'utf8'),context);
  assert.equal(context.window.ROAD_READY_BANK.questions.length,227);
  assert.throws(()=>execFileSync(process.execPath,[script,sample],{stdio:'pipe'}));
 }finally{fs.rmSync(tmp,{recursive:true,force:true});}
});
test('development server serves static files, returns MIME types, and prevents encoded traversal',async()=>{
 const http=require('node:http'),net=require('node:net'),{spawn}=require('node:child_process');
 const reserver=net.createServer();await new Promise(r=>reserver.listen(0,'127.0.0.1',r));const port=reserver.address().port;await new Promise(r=>reserver.close(r));
 const child=spawn(process.execPath,[path.join(root,'scripts/serve.cjs')],{env:{...process.env,PORT:String(port)},stdio:['ignore','pipe','pipe']});
 const get=p=>new Promise((resolve,reject)=>{http.get({hostname:'127.0.0.1',port,path:p},res=>{let body='';res.setEncoding('utf8');res.on('data',c=>body+=c);res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,body}));}).on('error',reject);});
 try{
  await new Promise((resolve,reject)=>{const t=setTimeout(()=>reject(new Error('Server startup timeout')),5000);child.stdout.once('data',()=>{clearTimeout(t);resolve();});child.once('error',reject);});
  const index=await get('/');assert.equal(index.status,200);assert.match(index.body,/Road Ready/);
  const js=await get('/js/engine.js');assert.match(js.headers['content-type'],/javascript/);
  assert.equal((await get('/package.json')).status,404);
  assert.equal((await get('/%2e%2e%2fpackage.json')).status,403);
 }finally{child.kill();}
});
