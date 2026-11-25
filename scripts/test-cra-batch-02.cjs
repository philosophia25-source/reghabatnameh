// Run after npm run build. Includes the earlier batch and complete CRA checks.
require('./test-cra-batch-01.cjs');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { craResolutions, readCraResolutionHtml } = require('../lib/cra/data.ts');
const read = slug => readCraResolutionHtml(craResolutions.find(r => r.slug === slug));
const plain = html => html.replace(/<[^>]+>/g, '');
const count = (html, needle) => html.split(needle).length - 1;
const fa = value => String(value).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);

for (const value of ['868٬000','1٬736٬000','2٬604٬000','4٬340٬000','7٬812٬000','13٬888٬000','23٬436٬000','39٬060٬000','79٬988٬000','111٬104٬000','286٬440٬000','369٬768٬000']) {
  assert.ok(plain(read('86-1')).includes(fa(value)), value);
}
const notes = read('87-1');
for (let n = 1; n <= 4; n++) {
  assert.equal(count(notes, `id="cra-17cbb54b-1-fn${n}"`), 1);
  assert.equal(count(notes, `id="cra-17cbb54b-1-fnref${n}"`), 1);
  assert.ok(notes.includes(`href="#cra-17cbb54b-1-fn${n}"`));
}
assert.equal(count(notes, '<mfrac>'), 4);
assert.ok(read('90-1').includes('<bdi dir="ltr"><strong>T۲=۰.۱t</strong></bdi>'));
for (const [slug, n] of [['96-1',100],['105-3',4],['106-1',19],['111-2',41],['126-1',22],['130-1',4],['131-1',21],['138-1',4]]) {
  assert.equal(count(read(slug), 'class="cra-clause-number"'), n, slug);
}
const ninetySix = read('96-1');
assert.ok(ninetySix.includes('<div><p><strong>ماده دو:'));
assert.ok(plain(ninetySix).includes('۶-۷-۳'));
for (const date of ['۱۳۸۶/۰۴/۱۳','۱۳۸۶/۰۶/۱۸','۱۳۸۹/۰۷/۱۸']) assert.ok(ninetySix.includes(date));
assert.ok(plain(read('97-1')).includes('قراردادهای فی ما بین'));
assert.ok(!plain(read('97-1')).includes('قرارداده‌ای'));
assert.ok(read('97-1').includes('<bdi dir="ltr">۶۴ kbps</bdi>'));
for (let n=1; n<=3; n++) {
  const html=read(`101-${n}`);
  assert.ok(html.includes(`href="#cra-101-part-${n}"`));
  for(let part=1; part<=3; part++) assert.equal(count(html,`id="cra-101-part-${part}"`),1);
  assert.ok(plain(html).includes('فایل رسمی جلسه ۱۰۱ شامل سه بخش است'));
}
for (const slug of ['106-1','120-1']) for (const value of ['10.0.0.0/8','172.16.0.0/12','192.168.0.0/16']) {
  assert.ok(read(slug).includes(`<bdi dir="ltr">${fa(value)}</bdi>`), `${slug} ${value}`);
}
assert.ok(read('120-1').includes('<bdi dir="ltr">http://www.matma.ir/ripe</bdi>'));
const post=read('107-1');
for(const value of ['۴٬۲۰۰','۴٬۵۰۰','۴٬۷۰۰','۵٬۲۰۰','۹٬۳۰۰']) assert.ok(plain(post).includes(value),value);
assert.ok(plain(post).includes('«تعرفه خدمات پستی» را به شرح زیر تصویب کرد'));
const frequency=read('107-2');
assert.equal(count(frequency,'class="cra-frequency-table"'),2);
assert.equal(count(frequency,'background-color:#404040'),800);
for(const value of ['۱۹۱٫۱۸','۸٫۶۹','۳۵٫۸۳']) assert.equal(count(frequency,value),2,value);
assert.equal(count(frequency,'۰٫۳–۳۰'),4);
assert.equal(count(frequency,'<msup>'),2);
assert.equal(count(frequency,'<mn>۰.۷۵</mn>'),2);
assert.ok(!frequency.includes('$واگذارشده'));
assert.ok(frequency.includes('cra-consolidated-text'));
assert.ok(read('112-1').includes('<bdi dir="ltr">۶۷۵۶/۱۰۱/۸۹/م</bdi>'));
assert.ok(read('112-1').includes('۱۳۸۹/۱۱/۲۴'));
const quality=read('119-2');
assert.equal(count(quality,'<mfrac>'),19); // AR contains two, plus 17 table fractions.
const qualitySource=fs.readFileSync('content/'+craResolutions.find(r=>r.slug==='119-2').contentFile,'utf8');
assert.equal(count(quality,'<img '),count(qualitySource,'<img ')); // Preserve every source formula image.
for(const [symbol,n] of [['ASR',1],['ACT',2],['CER',3],['GOS',2],['SMSSSR',1],['MMSSSR',2]]) {
  assert.ok(quality.includes(`<strong>${symbol}</strong><sup>${fa(n)}</sup>`),symbol);
}
assert.ok(!quality.includes('$\\frac'));
const annex=read('130-1');
assert.ok(annex.indexOf('مصوبه جلسه شماره') < annex.indexOf('class="cra-annex-130-1"'));
assert.ok(annex.indexOf('class="cra-annex-130-1"') < annex.indexOf('پیوست شماره (۲)- جدول ضرایب استانی'));
const table=annex.match(/<table[^>]*class="cra-annex-130-1"[\s\S]*?<\/table>/)[0];
assert.equal(count(table,'<tr>'),34); // Header, 31 provinces, two total rows.
assert.ok(table.includes('۶٬۸۷۱٬۰۰۰'));
assert.ok(table.includes('۴۴۳٬۶۱۱'));
const tariffs=read('146-1');
assert.equal(count(tariffs,'<table'),4);
assert.ok(plain(tariffs).replace(/\s/g,'').includes('ردیفشبکههایسیارسطحتعرفه'));
assert.ok(plain(tariffs).replace(/\s/g,'').includes('ردیفشبکههایثابتسطحتعرفه'));
const ledger=JSON.parse(fs.readFileSync('content/cra/audits/batch-02.json','utf8'));
assert.equal(ledger.issues.length,37);
assert.deepEqual(ledger.summary,{already_correct:5,applied:32});
for(const issue of ledger.issues) {
  const r=craResolutions.find(r=>'https://naderjafari.com'+r.route===issue.site_url);
  assert.ok(r,issue.site_url);
  const built=fs.readFileSync(`out${r.route}.html`,'utf8');
  assert.ok(built.includes('rel="canonical"'));
}
assert.equal(craResolutions.length,556);
console.log('PASS — Batch 02 source-backed tariffs, formulas, footnotes, clause trees, CIDRs, complete printed annex, source order and stable URLs.');
