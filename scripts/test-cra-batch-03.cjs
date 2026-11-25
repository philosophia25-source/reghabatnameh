// Run after npm run build. Includes both previous audit batches and all CRA pages.
require('./test-cra-batch-02.cjs');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {craResolutions,readCraResolutionHtml}=require('../lib/cra/data.ts');
const resolution=slug=>craResolutions.find(r=>r.slug===slug);
const read=slug=>readCraResolutionHtml(resolution(slug));
const plain=s=>s.replace(/<[^>]+>/g,'');
const count=(s,v)=>s.split(v).length-1;
const fa=v=>String(v).replace(/\d/g,n=>'۰۱۲۳۴۵۶۷۸۹'[Number(n)]);
const money=(slug,values)=>{
  const html=read(slug);
  for(const value of values) assert.ok(html.includes(`<bdi dir="ltr">${fa(value)}</bdi>`),`${slug} ${value}`);
};
money('146-2',['50٬000٬000٬000','10٬000٬000٬000']);
money('147-2',['3٬000']);
money('166-1',['200٬000','300٬000']);
money('166-4',['50٬000٬000٬000','10٬000٬000٬000']);
money('166-5',['360٬000','1٬200٬000']);
money('167-1',['10٬000٬000','15٬000٬000','20٬000٬000']);
money('167-6',['100٬000٬000']);
money('167-8',['50٬000٬000','200٬000٬000','1٬000٬000','5٬000٬000','10٬000٬000']);
for(const slug of ['146-2','166-4']) assert.ok(plain(read(slug)).includes('۰٫۲۵'));
for(const [slug,n] of [['147-1',21],['148-3',20],['149-3',32],['163-1',15],['165-3',22],['166-1',30],['167-8',30]]) {
  assert.equal(count(read(slug),'class="cra-clause-number"'),n,slug);
}
for(const [slug,heads] of [['147-1',['۱- تعاریف و اختصارات','۲- مقررات ارائه خدمات ارزش افزوده محتوایی پیامکی','۳- سایر مقررات']],['166-1',['۱- تعاریف و اصطلاحات','۲- نحوه برخورد دارنده پروانه با مشترکین بدهکار','۳- فرایند قطع خط تلفن مشترک بدهکار','۴- مقررات عمومی']]]) {
  const h3=[...read(slug).matchAll(/<h3>([\s\S]*?)<\/h3>/g)].map(x=>plain(x[1]));
  assert.deepEqual(h3,heads,slug);
  assert.ok(!/<li>\s*<h3>/.test(read(slug)),slug);
}
const postalDefinitions=plain(read('148-3'));
for(const label of ['۴-۱','۴-۲','۶-۴','۷-۱','۷-۲','۱۴-']) assert.ok(postalDefinitions.includes(label),label);
const dns=read('149-3');
for(const code of ['IPv۴','IPv۶','۱۰.x.x.x','(.ir)','.Com- .org - .net']) assert.ok(dns.includes(`<bdi dir="ltr">${code}</bdi>`),code);
assert.ok(dns.includes('Internet Engineering Task Force'));
assert.ok(!dns.includes('((Internet'));
for(const date of ['۱۳۸۴/۰۵/۰۴','۱۳۸۴/۰۵/۰۳','۱۳۸۴/۱۱/۰۸','۱۳۸۶/۰۷/۰۷']) assert.ok(read('150-3').includes(date),date);
const units=read('151-1');
assert.equal(count(units,' Mbps</bdi>'),6);
for(const n of [1,2,50]) assert.ok(units.includes(`<bdi dir="ltr">${fa(n)} Mbps</bdi>`));
const post=read('152-3');
assert.equal(count(post,'<table'),11);
// No data table may remain nested inside another table or table scroll region.
const tableTokens=[...post.matchAll(/<\/?table\b[^>]*>/g)].map(m=>m[0]);
let depth=0;
for(const tag of tableTokens){depth+=tag.startsWith('</')?-1:1;assert.ok(depth>=0&&depth<=1,tag);}
assert.equal(depth,0);
const source=fs.readFileSync('content/'+resolution('152-3').contentFile,'utf8');
const values=source.match(/(?<![0-9/])000(?:\/[0-9]{3})*\/[0-9]{1,3}(?![0-9/])/g);
assert.equal(values.length,49);
for(const value of new Set(values)){
  const corrected=fa(value.split('/').reverse().join('٬'));
  assert.equal(count(post,`<bdi dir="ltr">${corrected}</bdi>`),values.filter(x=>x===value).length,corrected);
}
for(const code of ['A۳','A۴','KM۲','A=B=C=D','AB=CD','A=D &amp; B=C','A=C &amp; D=B+۱']) assert.ok(post.includes(`<bdi dir="ltr">${code}</bdi>`),code);
assert.ok(plain(post).includes('۰٫۱'));
const international=read('153-2');
assert.ok(plain(international).replace(/\s/g,'').includes('ردیفشبکههایسیارسطحتعرفه'));
assert.ok(plain(international).replace(/\s/g,'').includes('ردیفشبکههایثابتسطحتعرفه'));
assert.equal(count(international,'<table'),3);
const uso=read('156-1');
assert.match(uso,/<ol start="20" type="1">/);
assert.ok(!uso.includes('class="cra-clause-number"')); // Source uses simple numbering.
assert.equal(count(uso,'<li>'),count(fs.readFileSync('content/'+resolution('156-1').contentFile,'utf8'),'<li>'));
const domestic=read('163-1');
const body=domestic.slice(domestic.indexOf('ماده ۲'),domestic.indexOf('<aside'));
assert.ok(!/<\/?(?:ol|li)\b/.test(body));
for(const label of ['۲-۱','۳-۱۴','۴-۱','۵-۱']) assert.ok(plain(domestic).includes(label),label);
for(let n=1;n<=3;n++) assert.ok(domestic.includes(`id="cra-94cbb54b-1-fn${n}"`));
const coefficients=read('163-4');
for(const value of ['۱٫۲','۰٫۸','۰٫۷','۰٫۶','۰٫۵']) assert.ok(plain(coefficients).includes(value));
assert.equal(count(coefficients,'۱۳۹۲/۲/۲۹'),2); // Short decimal token must not corrupt dates.
const defence=plain(read('165-3'));
for(const label of ['۲-۱','۲-۱۴','۳-۱','۳-۸']) assert.ok(defence.includes(label),label);
const consolidated=read('166-7');
assert.equal(count(consolidated,'cra-consolidated-text'),1);
assert.ok(consolidated.includes('پیوست تنقیحی'));
assert.ok(consolidated.includes('با مصوبه شماره ۱ جلسه ۳۲۶'));
assert.equal(count(consolidated,'۱۳۸۴/۱۲/۱۵'),2);
assert.ok(plain(consolidated).includes('این بند به موجب مصوبه شماره ۱ جلسه ۳۲۶ نسخ شده است'));
const sim=plain(read('167-8'));
for(const label of ['۱-۱۱','۳-۲','۷-۲','۱۲-۶','۱۳-۱-۴','۱۴-۱-۵']) assert.ok(sim.includes(label),label);
assert.ok(!/class="cra-clause-number"[^\n]*<span dir="rtl">- /g.test(read('167-8')));
const ledger=JSON.parse(fs.readFileSync('content/cra/audits/batch-03.json','utf8'));
assert.equal(ledger.issues.length,28);
assert.deepEqual(ledger.summary,{already_correct:3,applied:25});
const uniqueUrls=[...new Set(ledger.issues.map(i=>i.site_url))];
assert.equal(uniqueUrls.length,22);
for(const url of uniqueUrls){
  const r=craResolutions.find(r=>'https://naderjafari.com'+r.route===url);assert.ok(r,url);
  const built=fs.readFileSync('out'+r.route+'.html','utf8');assert.ok(built.includes('rel="canonical"'));
}
assert.equal(craResolutions.length,556);
console.log('PASS — Batch 03 monetary values, source-specific numbering, preserved literal clauses, table flattening, mixed-script quantities, official consolidated label and 22 stable routes.');
