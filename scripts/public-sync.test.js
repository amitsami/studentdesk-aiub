const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{let listen;let store={};const api={runtime:{id:'own',onMessage:{addListener:f=>listen=f}},storage:{local:{get:async k=>({[k]:store[k]}),set:async o=>Object.assign(store,o)}}};vm.runInNewContext(fs.readFileSync('extension/public-sync.js','utf8'),{browser:api,URL,Promise,Date});
const sender=url=>({id:'own',url});
assert.equal(listen({t:'sd-public-cache-put',path:'/category/notices',data:{kind:'list',items:[]}},sender('https://portal.aiub.edu/Student'),()=>{}),undefined);
assert.equal(listen({t:'sd-public-cache-put',path:'/category/notices',data:{kind:'list'}},{id:'other',url:'https://www.aiub.edu/category/notices'},()=>{}),undefined);
assert.equal(listen({t:'sd-public-cache-put',path:'/wrong-path',data:{kind:'list'}},sender('https://www.aiub.edu/category/notices'),()=>{}),undefined);
assert.deepEqual(JSON.parse(JSON.stringify(await listen({t:'sd-public-cache-put',path:'/category/notices?pageNo=1&pageSize=20',data:{kind:'list',items:[]}},sender('https://www.aiub.edu/category/notices/'),()=>{}))),{ok:true});
const result=await listen({t:'sd-public-cache-get',path:'/category/notices?pageNo=1&pageSize=20'},sender('https://portal.aiub.edu/Student'),()=>{});assert.equal(result.cached.data.kind,'list');
assert.equal(listen({t:'sd-public-cache-get',path:'/category/notices'},sender('https://evil.test/'),()=>{}),undefined);
assert.equal((await listen({t:'sd-public-cache-get',path:'//evil.test'},sender('https://portal.aiub.edu'),()=>{})).err,'Invalid public path');
console.log('7 public cache boundary tests passed');})().catch(e=>{console.error(e);process.exit(1)})
