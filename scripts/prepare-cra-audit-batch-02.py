#!/usr/bin/env python3
"""Print exact-source display corrections. Requires locally downloaded audit sources.

Usage: python scripts/prepare-cra-audit-batch-02.py --sources DIR --issues CSV
Source PDFs, original Word and Excel are inputs, never altered or committed.
"""
import argparse
import contextlib
import difflib
import hashlib
import html as escape_html
import io
import json
import re
import subprocess
import unicodedata
from pathlib import Path
import csv

import fitz
from docx import Document
from docx.table import _Cell
from docx.oxml.ns import qn
from lxml import html
from openpyxl import load_workbook

ROOT = Path(__file__).resolve().parents[1]
# Reuse the non-writing exact-match/list helper definitions from Batch 01.
helpers = (ROOT / 'scripts/prepare-cra-audit-batch-01.py').read_text().split('\nnumber_lists(record(22)', 1)[0]
exec(compile(helpers, str(ROOT / 'scripts/prepare-cra-audit-batch-01.py'), 'exec'))
BASELINE = '55f23ad00a0fa46ddee5f8cd0454316804f76054'
# Reproducible even when re-run after applying this batch.
curation = json.loads(subprocess.check_output(['git','show',BASELINE+':content/cra/display-curation.json'],cwd=ROOT))
baseline_replacements = {guid:list(pairs) for guid,pairs in curation['htmlReplacements'].items()}
parser = argparse.ArgumentParser()
parser.add_argument('--sources', type=Path, required=True)
parser.add_argument('--issues', type=Path, required=True)
args = parser.parse_args()
SOURCES = args.sources
issues = list(csv.DictReader(args.issues.open(encoding='utf-8-sig')))
dispositions = {}

def rec(slug):
    return next(r for r in records if r['slug'] == slug)

def done(number, note, status='applied'):
    dispositions[f'B02-{number:03}'] = (status, note)

def exact(slug, old, new):
    r = rec(slug)
    override = ROOT / 'content/cra/ocr-overrides' / f'{r["guid"]}.html'
    assert old in source(r) or (override.exists() and old in override.read_text()), (slug, old[:120])
    add(r, old, new)

def tables(text):
    return re.findall(r'<table\b[^>]*>[\s\S]*?</table>', text)

def text(node):
    return ' '.join(node.itertext()).strip()

def esc(value):
    return escape_html.escape(str(value), quote=True)

def math(body, label):
    return f'<span class="cra-audit-math"><math xmlns="http://www.w3.org/1998/Math/MathML" dir="ltr" aria-label="{esc(label)}">{body}</math></span>'

def mt(value, direction='ltr'):
    return f'<mtext dir="{direction}">{esc(value)}</mtext>'

def fraction(numerator, denominator, direction='ltr'):
    return '<mfrac>' + mt(numerator, direction) + mt(denominator, direction) + '</mfrac>'

# 86 — Word stores slash-separated monetary groups in reverse visual order.
r = rec('86-1')
old = tables(source(r))[0]
new = old
for value in ['000/868','000/736/1','000/604/2','000/340/4','000/812/7','000/888/13','000/436/23','000/060/39','000/988/79','000/104/111','000/440/286','000/768/369']:
    assert value in new
    new = new.replace(value, '٬'.join(reversed(value.split('/'))))
add(r, old, new)
done(1, 'All 12 tariff amounts checked visually against PDF page 1; thousand groups restored, not treated as dates.')
done(2, 'STM-1 is already isolated by the Batch 01 mixed-script fix.', 'already_correct')

# 87 — Four source footnotes and native accessible fraction layout.
r = rec('87-1'); s = source(r)
old = re.search(r'<aside\b[\s\S]*?</aside>', s).group()
prefix = 'cra-17cbb54b-1-'
notes = ['Band Width Sharing', 'Port', 'Packet', 'Unavailability']
new = '<aside id="'+prefix+'footnotes" class="footnotes footnotes-end-of-document" role="doc-endnotes"><hr><ol>'
for i, note in enumerate(notes, 1):
    new += f'<li id="{prefix}fn{i}"><p>{note}<a href="#{prefix}fnref{i}" class="footnote-back" role="doc-backlink">↩︎</a></p></li>'
new += '</ol></aside>'
add(r, old, new)
# The PDF also has a separate, earlier note numbered 2 for dedicated bandwidth.
# Preserve that original number and note in place with its own unique target.
dedicated='<p><span dir="rtl">2</span> Dedicated bandwidth</p>'
assert dedicated in s
add(r,dedicated,dedicated.replace('<p>','<p id="'+prefix+'dedicated">',1))
dedicated_ref='اختصاصي<sup>2</sup>را'
assert dedicated_ref in s
add(r,dedicated_ref,'اختصاصي</span><a href="#'+prefix+'dedicated" role="doc-noteref"><sup>2</sup></a><span dir="rtl">را')
# The fourth superscript was lost along with its link, immediately after عدم دستيابي.
anchor = re.search(r'<p>[^\n]*عدم قابليت دستيابي[^\n]*</p>', s)
assert anchor
oldp = anchor.group()
assert 'fnref' not in oldp
needle = '</span>'
# Footnote belongs to the term Unavailability, not the heading/formula.
term = re.search(r'عدم قابليت دستيابي(?: به خدمات)?', oldp)
assert term
pos = term.end()
assert '<sup>4</sup>' in oldp
newp = oldp.replace('<sup>4</sup>', f'</span><a href="#{prefix}fn4" class="footnote-ref" id="{prefix}fnref4" role="doc-noteref"><sup>4</sup></a><span dir="rtl">')
add(r, oldp, newp)
done(3, 'Rebuilt four distinct endnotes with reciprocal links. Note 2 here is Port as printed; also retained and linked the earlier, separately printed note 2 Dedicated bandwidth in place, with its own unique target.')
specs = [
    ('Availability %', 'Total Time – Total Unavailability time', 'Total Time', 'ltr'),
    ('درصد قابلیت دستیابی به خدمات', 'مدت زمان کل − مدت زمان عدم قابلیت دستیابی به خدمات', 'مدت زمان کل', 'rtl'),
    ('Packet Loss', 'Total Number of Packet sent – Total Number of Packet received', 'Total Number of Packet sent', 'ltr'),
    ('گم شدن بسته', 'تعداد بسته های فرستاده شده − تعداد بسته های رسیده', 'تعداد بسته های فرستاده شده', 'rtl'),
]
for old, (name, num, den, direction) in zip(tables(s)[2:6], specs):
    body = '<mrow>' + mt(name, direction) + '<mo>=</mo>' + fraction(num, den, direction) + '<mo>×</mo><mn>100</mn></mrow>'
    add(r, old, '<p>'+math(body, name+' = ('+num+') / '+den+' × 100')+'</p>')
done(4, 'Four fraction structures restored from PDF pages 3–4; numerator subtraction order preserved in both languages.')

# 90 — Existing formatter already handles T1. Protect complete expressions,
# including decimal-leading terms, to avoid splitting 0.1t into bidi fragments.
r = rec('90-1')
for table in tables(source(r))[:3]:
    tree = html.fromstring(table)
    new = table
    for cell in tree.xpath('.//td|.//th'):
        value = ''.join(cell.itertext()).strip()
        if re.fullmatch(r'T[1-5]\s*=.*', value):
            raw = html.tostring(cell, encoding='unicode', with_tail=False)
            assert raw in table
            new = new.replace(raw, re.sub(r'(<(?:td|th)[^>]*>)([\s\S]*)(</(?:td|th)>)', r'\1<bdi dir="ltr">\2</bdi>\3', raw))
    if new != table: add(r, table, new)
done(5, 'Protected whole source T2/T3/T4 equations including decimal coefficients; T1–T5 labels already correct.')

# 96 — Exact clause labels retain every paragraph/table/footnote.
m = {0:labels(1,1,16),1:labels(1,17,18),3:labels(2,1,25),4:labels(3,1,2),5:labels(3,3,3),6:labels(3,4,5),7:labels(3,6,7),8:labels(3,8,8),9:labels(3,9,15),10:labels(4,5,7),11:labels(5,1,2),12:labels(5,3,8),13:labels(5,9,10),14:labels(5,11,16),15:labels(5,17,17),16:labels(6,1,2),17:labels(6,3,6),18:labels(6,7,7),19:labels('6-7',1,3),20:labels(7,1,4),21:labels(8,1,8)}
number_lists(rec('96-1'), m)
r=rec('96-1'); s=source(r); ol=lists(s)[2]; fragment=s[ol['start']:ol['end']]
# Unwrap only the erroneous outer list/item, never the nested Article 2 clauses.
opening=fragment[:fragment.index('<ol', 1)]
closing=re.search(r'</li>\s*</ol>$',fragment).group()
assert s.count(opening)==1
add(r, opening, re.sub(r'^<ol[^>]*>\s*<li>','<div>',opening))
tail=fragment[-len(closing)-150:]
assert s.count(tail)==1
add(r, tail, tail[:-len(closing)]+'</div>')
done(6, 'Restored official multilevel labels through chapter 8, including 6-7-1..3; removed erroneous list marker on Article 2 heading.')
for old,new in [('13/4/86','1386/04/13'),('18/6/86','1386/06/18'),('18/7/89','1389/07/18')]: exact('96-1',old,new)
done(7, 'Three short-year dates expanded using the source and resolution chronology.')
done(8, 'Source reads قراردادهای. Fixed the shared substring normalization that corrupted this word, with a dedicated regression.')
exact('97-1','kbps<span dir="rtl">64','<bdi dir="ltr">64 kbps</bdi><span dir="rtl">')
done(9, '64 kbps kept as a complete left-to-right quantity/unit.')

# 101 — Preserve combined official attachment, add factual navigation outside it.
for i, letter in enumerate(['الف','ب','ج'], 1):
    r=rec(f'101-{i}');s=source(r)
    headings=[p for p in re.findall(r'<p>[^\n]*</p>',s) if re.search(r'(?:الف - کليات|ب- حق امتياز|ج- تغيير شرايط)',p)]
    assert len(headings)==3
    for j,p in enumerate(headings):
        add(r,p,p.replace('<p>',f'<p id="cra-101-part-{j+1}">',1))
    marker=re.match(r'<section\b[^>]*>',s).group()
    note=f'<nav class="cra-audit-source-note" aria-label="راهنمای سند جلسه ۱۰۱"><p>فایل رسمی جلسه ۱۰۱ شامل سه بخش است. موضوع این صفحه در بخش «{letter}» آمده است.</p><a href="#cra-101-part-{i}">رفتن به بخش «{letter}»</a></nav>'
    add(r,marker,note+marker)
    done(9+i, 'Kept the complete combined official document. Added an explicit source note and direct anchor to the matching section; no legal text removed.')

number_lists(rec('105-3'),{1:labels(1,1,1),2:labels(1,2,2),3:labels(1,3,4)})
done(13,'Definition labels 1-1..1-4 restored within original outer headings.')
number_lists(rec('106-1'),{0:labels(1,1,9),1:labels(1,10,19)})
done(14,'Definition labels 1-1..1-19 restored.')
for slug in ['106-1','120-1']:
    for ip in ['10.0.0.0/8','172.16.0.0/12','192.168.0.0/16']:
        exact(slug,ip,f'<bdi dir="ltr">{ip}</bdi>')
done(15,'Three CIDR prefixes protected intact; IPv4 was already fixed by Batch 01.')

# 107-1 — Keep generated OCR immutable; corrections belong in display layer.
r=rec('107-1');ov=(ROOT/'content/cra/ocr-overrides'/f'{r["guid"]}.html').read_text()
old=tables(ov)[1];new=old
row=re.search(r'<tr[^>]*>\s*<td[^>]*>[^\n]*مطبوع سفارشی[\s\S]*?</tr>',old).group()
corrected=row
for a,b in [('۲,۲۰۰','۴,۲۰۰'),('۲,۵۰۰','۴,۵۰۰'),('۲,۷۰۰','۴,۷۰۰'),('۳,۲۰۰','۵,۲۰۰')]:corrected=corrected.replace(a,b)
new=new.replace(row,corrected)
rows=re.findall(r'<tr\b[^>]*>[\s\S]*?</tr>',new)
assert '۹,۴۰۰' in rows[4]; new=new.replace(rows[4],rows[4].replace('۹,۴۰۰','۹,۳۰۰'))
new=re.sub(r'([۰-۹],[۰-۹]{2}) ([۰-۹])',r'\1\2',new)
add(r,old,new)
done(16,'Six reported numeric errors in registered-print tariffs verified on PDF page 2; fixed OCR spaces in monetary groups in the same table. This is not a new certification of every figure in all nine OCR tables.')
marker='<p><strong><span dir="rtl">مقدمه</span>:</strong></p>'
assert marker in ov
sentence='<p>کمیسیون تنظیم مقررات ارتباطات در جلسه شماره ۱۰۷ مورخ ۱۳۸۹/۱۲/۲۲ «تعرفه خدمات پستی» را به شرح زیر تصویب کرد.</p>'
add(r,marker,sentence+marker)
done(17,'Restored missing approval sentence from PDF page 1, before the title/introduction.')

# 107-2 — Rebuild the shared frequency table from original Word merged cells,
# original shading, with every decimal coefficient cross-checked against PDF.
doc=Document(SOURCES/'107-2.docx');wt=doc.tables[1]
pdf=fitz.open(SOURCES/'9.pdf');pdf_numbers=set();pdf_ranges=set()
def normalized_range(value):
    value=value.translate(str.maketrans('۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩','01234567890123456789'))
    parts=re.split(r'\s*[-–]\s*',value.strip())
    if len(parts)!=2 or not all(re.fullmatch(r'[0-9/٫.]+',p) for p in parts):return None
    return tuple(sorted(float(p.replace('/','.').replace('٫','.')) for p in parts))
with contextlib.redirect_stdout(io.StringIO()):
    for page in list(pdf)[5:10]:
        for row in page.find_tables().tables[0].extract():
            if row[9] and normalized_range(row[9]):pdf_ranges.add(normalized_range(row[9]))
            for value in row:
                if value:pdf_numbers.update(re.findall(r'\d+/\d+',value))
digit_map=str.maketrans('۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩','01234567890123456789')
def decimal(value):
    value=value.translate(digit_map)
    return re.sub(r'(\d+)\s*/\s*(\d+)',lambda m:m[2]+'٫'+m[1],value)

rows=[]; active={}; checked=0; shades=0;checked_ranges=0
for row_index, row in enumerate(wt.rows):
    cells=[];column=0
    for tc in row._tr.tc_lst:
        pr=tc.tcPr; span=pr.find(qn('w:gridSpan')) if pr is not None else None
        colspan=int(span.get(qn('w:val'))) if span is not None else 1
        vm=pr.find(qn('w:vMerge')) if pr is not None else None
        if vm is not None and vm.get(qn('w:val'),'continue')=='continue':
            assert column in active
            active[column]['rowspan']+=1;column+=colspan;continue
        active.pop(column,None)
        value=_Cell(tc,wt).text.strip()
        if row_index>=3 and 1<=column<=5:
            if re.fullmatch(r'\d+/\d+',value.translate(digit_map)):
                assert '/'.join(value.translate(digit_map).split('/')[::-1]) in pdf_numbers,(row_index,column,value)
                checked+=1
            value=decimal(value)
            if column==1:
                bounds=re.fullmatch(r'\s*([0-9٫]+)\s*[-–]\s*([0-9٫]+)\s*',value)
                if bounds:
                    parts=sorted([bounds[1],bounds[2]],key=lambda n:float(n.replace('٫','.')))
                    value='–'.join(parts)
                    assert normalized_range(value) in pdf_ranges,(row_index,value)
                    checked_ranges+=1
        shade=pr.find(qn('w:shd')) if pr is not None else None
        dark=shade is not None and shade.get(qn('w:fill'),'').upper()=='404040'
        if dark:shades+=1
        cell={'value':value,'colspan':colspan,'rowspan':1,'dark':dark,'column':column,'header':row_index<3}
        cells.append(cell)
        if vm is not None:active[column]=cell
        column+=colspan
    assert column==11,(row_index,column)
    rows.append(cells)
out='<table dir="rtl" class="cra-frequency-table"><tbody>'
for row in rows:
    out+='<tr>'
    for c in row:
        tag='th' if c['header'] else 'td';attrs=''
        if c['colspan']>1:attrs+=f' colspan="{c["colspan"]}"'
        if c['rowspan']>1:attrs+=f' rowspan="{c["rowspan"]}"'
        if c['dark']:attrs+=' style="background-color:#404040;color:#fff;print-color-adjust:exact" aria-label="خانه تیره در سند اصلی"'
        value=esc(c['value']).replace('\n','<br>')
        if not c['header'] and 1<=c['column']<=5 and re.search(r'\d',c['value']):value='<bdi dir="ltr">'+value+'</bdi>'
        out+=f'<{tag}{attrs}>{value}</{tag}>'
    out+='</tr>'
out+='</tbody></table>'
assert checked>100 and shades>300,(checked,shades)
r=rec('107-2');ts=tables(source(r));assert ts[1]==ts[6]
add(r,ts[1],out)
done(18,f'Rebuilt shared 140-data-row table from original Word; all {checked} decimal coefficient/spacing occurrences and {checked_ranges} frequency ranges checked against PDF pages 6–10. Report example 83.35 rejected: PDF prints 35.83. Same exact source table occurs in both original and consolidated sections.')
done(19,f'Restored {shades} original dark cells and Word horizontal/vertical merges; no invented applicability checkmarks. Original and consolidated copies share the verified table.')
old=re.search(r'<span class="math inline">\$واگذارشده[\s\S]*?</span>',source(r)).group()
body='<mrow>'+mt('ضریب فرکانس واگذار شده','rtl')+'<mo>=</mo><msup>'+fraction('پهنای باند اشغال شده توسط هر کانال به هرتز','حداقل فاصله کانالی به هرتز','rtl')+'<mn>0.75</mn></msup></mrow>'
add(r,old,math(body,'ضریب فرکانس واگذار شده = (پهنای باند اشغال شده توسط هر کانال به هرتز / حداقل فاصله کانالی به هرتز) به توان ۰٫۷۵'))
alternative=re.search(r'<span class="math display"><em>و</em>[\s\S]*?</span>',source(r)).group()
add(r,alternative,math('<mrow>'+mt('ضریب فرکانس واگذار شده','rtl')+'<mo>=</mo>'+mt('یک','rtl')+'</mrow>','ضریب فرکانس واگذار شده = یک'))
done(20,'Replaced unreadable formula markup with native MathML fraction/exponent and restored connected Persian letters in the alternative equal-to-one expression; retained source condition about choosing whichever is larger.')

m={4:labels(4,1,3),6:labels(5,1,2),7:labels(6,1,1),8:labels(6,2,4),10:labels(7,1,2),14:labels(11,1,3),17:labels(14,1,2),19:labels(16,1,8),21:labels(17,1,2),25:labels(20,1,1),26:labels(20,2,3),30:labels(23,1,4),32:labels(25,1,3),33:labels('25-1',1,5)}
number_lists(rec('111-2'),m)
done(21,'Restored source chapter/child labels, including 25-1-1..5. Annex selection list restarts at 1 as printed.')
done(22,'E1 already isolated intact after Batch 01.', 'already_correct')
exact('112-1','6756/101/89/م','<bdi dir="ltr">6756/101/89/م</bdi>')
exact('112-1','24/11/89','1389/11/24')
done(23,'Protected complete letter identifier and expanded its short-year date without changing identifier order.')
done(24,'x11/x12/x13/xy14/xy15 already isolated intact by Batch 01.', 'already_correct')
for old,new in [('26/12/86','1386/12/26'),('22/3/90','1390/03/22'),('16/12/88','1388/12/16'),('23/12/88','1388/12/23')]:exact('113-1',old,new)
done(25,'Short-year dates fixed. Rejected continuous numbering proposal: PDF annex 1 page 10 deliberately restarts at 1 for each GOLD/SILVER/BRONZE category.')

# 119 — Formula image assets remain intact. Only textual stacked fractions and
# split-letter symbols are repaired. No division is invented for form 4.
r=rec('119-2');s=source(r)
old=re.search(r'<p>AR = Availability Rate = [\s\S]*?</p>',s).group()
num='[تعداد روزهای ماه مربوط × 24(ساعت) × 60(دقیقه)] − [دقایق قطعی]'
den='[روزهای ماه مربوط × 24(ساعت) × 60(دقیقه)]'
body='<mrow>'+mt('AR = Availability Rate')+'<mo>=</mo>'+fraction('up Time','Up Time + Down Time')+'<mo>=</mo>'+fraction(num,den,'rtl')+'</mrow>'
add(r,old,'<p>'+math(body,'AR = up Time / (Up Time + Down Time) = ('+num+') / '+den)+'</p>')
count=0
for ti,table in enumerate(tables(s)):
    if ti not in [0,4,5,6,7]:continue
    tree=html.fromstring(table)
    for tr in tree.xpath('.//tbody/tr'):
        cells=tr.xpath('./td')
        if len(cells)<5:continue
        cell=cells[4];ps=cell.xpath('./p')
        if len(ps)!=2:continue
        raw=html.tostring(cell,encoding='unicode',with_tail=False);assert raw in table
        a,b=(text(p) for p in ps)
        direction='rtl' if re.search(r'[\u0600-\u06ff]',a+b) else 'ltr'
        add(r,raw,'<td>'+math(fraction(a,b,direction),a+' / '+b)+'</td>');count+=1
done(26,f'Rendered AR and {count} textual stacked fractions with visible fraction bars. Preserved existing formula images, plain slash formulas, and form 4 quantities that have no denominator in PDF.')
for old in set(re.findall(r'<span class="math inline">[\s\S]*?</span>',s)):
    b=html.fromstring(old);sup=b.xpath('.//sup');symbol=''.join(b.itertext())
    if not sup or not re.fullmatch(r'[A-Z\s\u00a0]+[0-9]+',symbol):continue
    note=''.join(sup[0].itertext());letters=re.sub(r'[^A-Z]','',symbol)
    new=f'<bdi dir="ltr"><strong>{letters}</strong><sup>{note}</sup></bdi>'
    add(r,old,new)
done(27,'Joined split-letter abbreviations within their source math spans and retained superscript note numbers. Definitions and existing intact abbreviations unchanged.')
exact('120-1','<strong>http://www.matma.ir/ripe</strong>','<strong><bdi dir="ltr">http://www.matma.ir/ripe</bdi></strong>')
done(28,'Protected three CIDRs and the complete original http URL; href unchanged.')
done(29,'Technical code tokens already isolated intact after Batch 01.', 'already_correct')

number_lists(rec('126-1'),{1:labels(3,1,1),2:['ث)','ج)'],3:labels(3,2,1+1),4:['4'],5:labels(4,1,2),6:['5'],7:labels(5,1,4),8:['6'],9:labels(6,1,3),10:labels(6,4,6),11:['7','8','9']})
done(30,'Reconstructed complete source hierarchy on PDF pages 1–3, including lettered ث/ج, definitions 3-1/3-2, chapters 4–6 and main items 7–9. Report incorrectly described only six main items.')

# 130 — The workbook has working columns/rows. Only printed Annex 1 is law.
wb=load_workbook(SOURCES/'130-1.xlsx',data_only=True);ws=wb['Sheet2']
with contextlib.redirect_stdout(io.StringIO()):
    pt=fitz.open(SOURCES/'17.pdf')[0].find_tables().tables[0].extract()
data=pt[3:-2]
assert len(data)==31,(len(pt),len(data))
table='<table dir="rtl" class="cra-annex-130-1"><caption>پیوست شماره (۱) — جدول حداقل تعداد پورت منصوبه در سه سال اول به تفکیک استان</caption><thead><tr><th>ردیف</th><th>استان</th>'
for year,name in enumerate(['اول','دوم','سوم','چهارم','پنجم','ششم','هفتم','هشتم'],1):table+=f'<th>{year}<br>برآورد سال {name}<br>تعداد پورت منصوبه</th>'
table+='</tr></thead><tbody>'
for i,pdfrow in enumerate(data,9):
    values=list(reversed(pdfrow[:8]))
    nums=[int(v.replace(',','').strip()) for v in values]
    excel=[ws.cell(i,j).value for j in range(12,20)]
    assert nums==excel,(i,nums,excel)
    pdf_name=unicodedata.normalize('NFKC',pdfrow[8])[::-1].replace('ي','ی').replace('ك','ک').replace(' ','')
    # PDF ligature extraction reverses the internal lam/alef of ایلام.
    if i==37 and pdf_name=='ایالم':pdf_name='ایلام'
    assert pdf_name==str(ws.cell(i,2).value).replace(' ',''),(i,pdf_name,ws.cell(i,2).value)
    table+='<tr><td>'+str(i-8)+'</td><th scope="row">'+esc(ws.cell(i,2).value)+'</th>'+''.join('<td>'+format(n,',').replace(',','٬')+'</td>' for n in nums)+'</tr>'
for row,label in zip(pt[-2:],['جمع کل','جمع کل سه فاز - تجمیعی']):
    nums=[int(v.replace(',','').strip()) for v in reversed(row[:8])]
    table+='<tr><th colspan="2">'+label+'</th>'+''.join('<td>'+format(n,',').replace(',','٬')+'</td>' for n in nums)+'</tr>'
table+='</tbody></table>'
number_lists(rec('130-1'),{1:labels(1,1,1),2:labels(1,2,2),3:labels(1,3,4)})
r=rec('130-1');s=source(r);sections=re.findall(r'<section\b[^>]*>[\s\S]*?</section>',s);assert len(sections)==3
# Reordering uses only section boundaries, so earlier clause replacements survive.
main=sections[1]
annex=sections[0]
# One whole-document replacement must include already generated list corrections.
original=s[:s.index(sections[2])]
current=original
for pair in curation['htmlReplacements'].get(r['guid'],[]):current=current.replace(pair['from'],pair['to'])
parts=re.findall(r'<section\b[^>]*>[\s\S]*?</section>',current)
corrected_main=next(p for p in parts if len(p)>10000)
corrected_annex=next(p for p in parts if p!=corrected_main)
annex_section='<section class="cra-source-text" data-format="xlsx"><div class="cra-source-label"><strong>پیوست شماره (۱)</strong><span>جدول رسمی توسعه پورت</span></div>'+table+'</section>'
# Replace the pre-existing list edits by their single composed document edit.
curation['htmlReplacements'][r['guid']]=[{'from':original,'to':corrected_main+'\n'+annex_section+'\n'+corrected_annex}]
done(31,'Added complete printed Annex 1: 31 provinces and 2 total rows, all 248 provincial year values checked against final workbook L:S columns. Rejected report’s 45-row count, which includes working rows/columns not published in PDF.')
done(32,'Ordered original resolution, Annex 1, then Annex 2. Preserved full existing text and provincial coefficient annex.')
done(33,'Restored definitions 1-1..1-4 in main resolution before composing reordered sections.')
number_lists(rec('131-1'),{0:labels(1,1,8),1:labels(2,1,4),2:labels(2,5,10),3:labels(3,1,3)})
done(34,'Restored clause labels for Articles 1–3, including 2-5..2-10 continuation.')
number_lists(rec('138-1'),{0:['ب'],2:labels(1,1,3)})
done(35,'Restored letter ب and subclauses 1-1..1-3 against PDF page 1.')
done(36,'The current source/display already contains no ten trailing textbox paragraphs; evaluation table retained in full.', 'already_correct')

r=rec('146-1');s=source(r);old=tables(s)[2]
raw_rows=re.findall(r'<tr\b[^>]*>[\s\S]*?</tr>',old)
boundary=next(i for i,row in enumerate(raw_rows) if re.search(r'جدول\s*4',html.fromstring(row).text_content()))
def tariff_table(rows):
    out='<table dir="rtl"><tbody>'
    for row in rows:
        cells=re.findall(r'<(?:td|th)\b[^>]*>[\s\S]*?</(?:td|th)>',row)
        assert len(cells)==3
        out+='<tr>'+''.join(reversed(cells))+'</tr>'
    return out+'</tbody></table>'
heading=html.fromstring(raw_rows[boundary]).text_content().strip()
new=tariff_table(raw_rows[:boundary])+'<p><strong>'+esc(heading)+'</strong></p>'+tariff_table(raw_rows[boundary+1:])
add(r,old,new)
done(37,'Split merged mobile/fixed tariff tables 3 and 4, reversed source cells into RTL row/countries/tariff order, preserving every country and rate.')

assert len(dispositions)==37
# Outer list/table anchors must run before older small corrections contained
# inside them. Otherwise a valid source anchor silently stops matching.
for guid,pairs in curation['htmlReplacements'].items():
    earlier=baseline_replacements.get(guid,[])
    pairs[:]=[p for p in pairs if p not in earlier]+[p for p in pairs if p in earlier]
ledger={'baseline_commit':'55f23ad00a0fa46ddee5f8cd0454316804f76054','audit_date':'2026-11-25',
        'scope':'Disposition of all 37 reported issues. Does not independently certify every page reported clean, or all nine existing postal OCR tables.',
        'summary':{status:sum(s==status for s,n in dispositions.values()) for status in sorted({s for s,n in dispositions.values()})},
        'issues':[{**{k:row[k] for k in ['issue_id','audit_id','site_url','source_url','source_page']},'status':dispositions[row['issue_id']][0],'note':dispositions[row['issue_id']][1]} for row in issues],
        'sources':[{'name':p.name,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in sorted(SOURCES.glob('*')) if p.suffix in ['.pdf','.docx','.xlsx']]}
ledger['additional_original_sources']={
    '107-2.docx':'https://docs.google.com/document/d/1Uj7kQoFVwI16o7DBTVeH2x3oYudzvWUu/edit',
    '130-1.xlsx':'https://docs.google.com/spreadsheets/d/1UlH5lSgGcFM2iITPjuhX9V06v9RWwcuj/edit'}
after=json.dumps(curation,ensure_ascii=False,indent=2)+'\n'
diff=list(difflib.unified_diff(before.splitlines(True),after.splitlines(True)))
print('*** Begin Patch')
print('*** Update File: '+str(path))
print(re.sub(r'^@@[^\n]*@@[^\n]*$', '@@', ''.join(diff[2:]), flags=re.M),end='')
ledger_path=ROOT/'content/cra/audits/batch-02.json'
ledger_text=json.dumps(ledger,ensure_ascii=False,indent=2)+'\n'
if ledger_path.exists():
    print('*** Update File: '+str(ledger_path))
    print('@@')
    for line in ledger_path.read_text().splitlines():print('-'+line)
else:print('*** Add File: '+str(ledger_path))
for line in ledger_text.splitlines():print('+'+line)
print('*** End Patch')
