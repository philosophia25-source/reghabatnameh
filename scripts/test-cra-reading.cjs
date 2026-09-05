// Run after the static build: node scripts/test-cra-reading.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
process.chdir(root);
const resolve = Module._resolveFilename;
Module._resolveFilename = function (name, ...rest) {
  return resolve.call(this, name.startsWith('@/') ? path.join(root, name.slice(2)) : name, ...rest);
};
require.extensions['.ts'] = (module, filename) => {
  const output = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  });
  module._compile(output.outputText, filename);
};
const { formatCraReadingHtml } = require('../lib/cra/presentation.ts');
const { craResolutions, readCraResolutionHtml } = require('../lib/cra/data.ts');
const plain = (value) => value.replace(/<[^>]+>/g, '');
const sample = '<p>خدمت <span dir="rtl">(</span>FCP<span dir="rtl">)</span> در تاریخ ۱۴۰۱/۰۵/۰۹ ارائه می‌شود.</p>';
const formatted = formatCraReadingHtml(sample);
assert.ok(formatted.includes('<bdi dir="ltr">(FCP)</bdi>'));
assert.ok(formatted.includes('<bdi dir="ltr">۱۴۰۱/۰۵/۰۹</bdi>'));
assert.equal(plain(sample), plain(formatted));
assert.equal(formatCraReadingHtml(formatted), formatted);
for (const value of [
  '<math><mtext>FCP نرخ ۱۲</mtext><mn>12</mn></math>',
  '<bdi dir="ltr">(WTTx)</bdi>',
  '<p dir="ltr">Accounting Separation</p>',
  '<a href="/abc/1401/336-1?x=12&amp;y=1">متن &amp; پیوست</a>',
  '<p>شماره ۳۳۶ و مبلغ ۲۳/۶ درصد و بند ۴-۱-۲</p>',
]) assert.equal(formatCraReadingHtml(value), value);
assert.equal(formatCraReadingHtml('<p><strong>ماده ۱۲- تعرفه</strong></p>'), '<h3>ماده ۱۲- تعرفه</h3>');
assert.equal(formatCraReadingHtml('<p><strong>مطابق ماده ۱۲- تعرفه</strong></p>'), '<p><strong>مطابق ماده ۱۲- تعرفه</strong></p>');
const resolution = craResolutions.find((r) => r.route === '/resolutions/cra/1401/336-1');
const output = readCraResolutionHtml(resolution);
const original = readCraResolutionHtml({ ...resolution, contentFile: `cra/documents/${resolution.guid}.html` });
assert.ok(plain(original).includes('شماره ۳۳۶'));
assert.ok(!original.includes('۳ ۳ ۶'));
assert.ok(!original.includes('۱ ۴ ۰ ۱'));
assert.equal((output.match(/id="consolidated-article-/g) || []).length, 19);
assert.equal((output.match(/id="consolidated-clause-/g) || []).length, 122);
assert.equal((output.match(/id="consolidated-note-/g) || []).length, 18);
assert.equal((output.match(/id="consolidated-ref-/g) || []).length, 18);
assert.ok(output.includes('<del>چهار</del> <ins>پنج حالت</ins>'));
assert.ok(output.includes('<del>ارایه خدمات تلفن همراه</del>'));
assert.ok(output.includes('id="consolidated-clause-10-3"'));
assert.ok(!output.includes('دوازده (۱)۲'));
assert.ok(output.includes('دوازده (۱۲)'));
assert.ok(output.includes('مبلغ ۱۶ (شانزده)'));
assert.ok(!output.includes('§'));
assert.ok(!output.includes('tokens truncated'));
const ids = [...output.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
assert.equal(new Set(ids).size, ids.length);
for (const [, target] of output.matchAll(/href="#(consolidated-[^"]+)"/g)) assert.ok(ids.includes(target), target);
let allWords = 0;
for (const item of craResolutions) {
  const html = readCraResolutionHtml(item);
  assert.ok(html.length, item.route);
  assert.ok(!/<bdi[^>]*>\s*<bdi/.test(html), item.route);
  allWords += plain(html).split(/\s+/).length;
}
const built = fs.readFileSync('out/resolutions/cra/1401/336-1.html', 'utf8');
assert.ok(built.includes('consolidated-article-19'));
assert.ok(built.includes('<del>چهار</del>'));
assert.ok(built.includes('Accounting Separation'));
assert.ok(!built.includes('۳ ۳ ۶'));
const sitemap = fs.readFileSync('out/sitemap.xml', 'utf8');
assert.ok(sitemap.includes('https://naderjafari.com/resolutions/cra/1401/336-1'));
assert.ok(!sitemap.includes('/communications-regulatory-commission/'));
console.log(`PASS — reviewed document, revision markup, references, preserved numbers, mixed-direction text, and ${craResolutions.length} CRA pages (${allWords} words rendered).`);
