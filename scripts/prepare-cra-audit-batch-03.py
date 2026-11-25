#!/usr/bin/env python3
"""Print a reproducible, source-backed display patch for the 28 Batch 03 issues.

Usage: python scripts/prepare-cra-audit-batch-03.py --sources DIR --issues CSV
Importer output and original attachments are never rewritten.
"""
import argparse
import contextlib
import csv
import difflib
import hashlib
import io
import json
import re
import subprocess
from pathlib import Path
import fitz
from lxml import html

ROOT=Path(__file__).resolve().parents[1]
helpers=(ROOT/'scripts/prepare-cra-audit-batch-01.py').read_text().split('\nnumber_lists(record(22)',1)[0]
exec(compile(helpers,str(ROOT/'scripts/prepare-cra-audit-batch-01.py'),'exec'))
BASELINE='8ee8c825b7b5e03d3413ea3a80de405cafd3f56a'
curation=json.loads(subprocess.check_output(['git','show',BASELINE+':content/cra/display-curation.json'],cwd=ROOT))
baseline={guid:list(pairs) for guid,pairs in curation['htmlReplacements'].items()}
parser=argparse.ArgumentParser()
parser.add_argument('--sources',type=Path,required=True)
parser.add_argument('--issues',type=Path,required=True)
args=parser.parse_args()
issues=list(csv.DictReader(args.issues.open(encoding='utf-8-sig')))
outcomes={}

def rec(slug):return next(r for r in records if r['slug']==slug)
def done(i,note,status='applied'):outcomes[f'B03-{i:03}']=(status,note)
def exact(slug,old,new):
    r=rec(slug);assert old in source(r),(slug,old[:90]);add(r,old,new)
def current(r):
    s=source(r);earlier=baseline.get(r['guid'],[])
    pairs=curation['htmlReplacements'].get(r['guid'],[])
    for p in [p for p in pairs if p not in earlier]+[p for p in pairs if p in earlier]:s=s.replace(p['from'],p['to'])
    return s
def compose(r,transform):
    raw=source(r);new=transform(current(r));assert raw!=new
    # Batch 03 affected records have no hidden/removed source sections.
    assert not curation['unreadableTextSections'].get(r['guid'])
    assert not curation['redundantTextSections'].get(r['guid'])
    curation['htmlReplacements'][r['guid']]=[{'from':raw,'to':new}]
def plain(s):return re.sub(r'\s+','',html.fromstring(s).text_content())

def unwrap_headings(s,profiles):
    """Remove only outer list markers; keep all nested clause lists intact."""
    ols=lists(s);edits=[]
    for index,numbers in profiles.items():
        assert len(numbers)==len(ols[index]['items'])
        for item,n in zip(ols[index]['items'],numbers):
            start=item['paragraph']-3;assert s[start:start+3]=='<p>'
            end=s.index('</p>',start)+4
            edits.append((start,end,f'<h3>{n}- '+s[start+3:end-4]+'</h3>'))
    stack=[];li_stack=[];index=0
    for m in re.finditer(r'</?(?:ol|li)\b[^>]*>',s):
        t=m.group();closing=t.startswith('</');tag=re.match(r'</?(\w+)',t)[1]
        if tag=='ol':
            if closing:
                owner=stack.pop()
                if owner in profiles:edits.append((m.start(),m.end(),'</div>'))
            else:
                stack.append(index)
                if index in profiles:edits.append((m.start(),m.end(),'<div class="cra-numbered-section">'))
                index+=1
        elif not closing:
            owner=stack[-1];li_stack.append(owner)
            if owner in profiles:edits.append((m.start(),m.end(),''))
        else:
            owner=li_stack.pop()
            if owner in profiles:edits.append((m.start(),m.end(),''))
    for a,b,v in sorted(edits,reverse=True):s=s[:a]+v+s[b:]
    return s

def money(slug,values):
    # Replace longer group sequences first: 000/000/1 is a prefix of
    # 000/000/100 and must never partially rewrite that larger amount.
    for value in sorted(values,key=len,reverse=True):exact(slug,value,'<bdi dir="ltr">'+'٬'.join(reversed(re.split(r'[/،]',value)))+'</bdi>')

money('146-2',['000/000/000/50','000/000/000/10'])
exact('146-2','25/0','0٫25')
done(1,'Restored 50 and 10 billion rial amounts, verified on PDF pages 4–5 (report page references were inaccurate). Also restored the adjacent 0.25 percent figure confirmed by words and PDF.')
number_lists(rec('147-1'),{1:labels(1,1,6),2:labels(2,1,4),3:labels(2,5,9),4:labels(2,10,13),6:labels(3,1,2)})
compose(rec('147-1'),lambda s:unwrap_headings(s,{0:['1','2'],5:['3']}))
done(2,'Restored all 21 numbered subclauses and independent headings 1, 2, 3, with every nested clause retained.')
money('147-2',['000/3'])
done(3,'Restored 3,000 rial amount; words and PDF page 1 agree.')

# An inserted postal-organization definition shifts the source hierarchy.
# The report copied the older 126 numbering, which is wrong for this document.
number_lists(rec('148-3'),{1:labels(4,1,1),2:['ث)','ج)'],3:labels(4,2,2),4:['5'],5:['6'],6:labels(6,1,4),7:['7'],8:labels(7,1,2),9:[str(i) for i in range(8,15)]})
done(4,'Restored hierarchy from PDF pages 1–3: postal articles are main item 4 with 4-1/4-2, not 3; processes are 6, services 7, remaining main items 8–14. Preserved printed letter labels including ث and ج.')
number_lists(rec('149-3'),{0:labels(1,1,13),1:labels(2,1,3),2:labels(2,4,13),3:labels(2,14,16),4:labels(3,1,2),5:labels(4,1,1)})
done(5,'Restored 32 source clause labels across Articles 1–4, without changing existing IETF punctuation correction.')
for value in ['10.x.x.x','(.ir)','.Com- .org - .net']:exact('149-3',value,f'<bdi dir="ltr">{value}</bdi>')
done(6,'Protected complete private-address pattern and domain suffix runs. IPv4/IPv6 were already correct after Batch 01. Kept source case and separators, rather than rewriting them.')
for old,new in [('4/5/84','1384/05/04'),('3/5/84','1384/05/03'),('8/11/84','1384/11/08'),('7/7/86','1386/07/07')]:exact('150-3',old,new)
done(7,'Expanded four distinct short-year dates across their source occurrences, preserving dates and reference identifiers.')
for value in ['1Mbps','2Mbps','50Mbps']:exact('151-1',value,f'<bdi dir="ltr">{value.replace("Mbps"," Mbps")}</bdi>')
done(8,'Kept quantities and Mbps units together in all six source occurrences.')

# 152 — Collapse a layout-only enclosing table, never any data-table rows.
def flatten_postal(s):
    blocks=[];stack=[]
    for m in re.finditer(r'</?table\b[^>]*>',s):
        if m.group().startswith('</'):
            start=stack.pop()
            if not stack:blocks.append((start,m.end()))
        else:stack.append(m.start())
    a,b=blocks[0];old=s[a:b];tree=html.fromstring(old)
    assert len(tree.xpath('.//table'))==5
    cells=tree.xpath('./thead/tr/*|./tbody/tr/*|./tr/*')
    assert len(cells)==2
    new=''.join((c.text or '')+''.join(html.tostring(x,encoding='unicode',with_tail=True) for x in c) for c in cells)
    assert plain('<div>'+new+'</div>')==plain(old)
    assert not html.fromstring('<div>'+new+'</div>').xpath('.//table//table')
    return s[:a]+new+s[b:]

r=rec('152-3');s=source(r)
values=re.findall(r'(?<![0-9/])000(?:/[0-9]{3})*/[0-9]{1,3}(?![0-9/])',s)
assert len(values)==49
# PDF text inside tariff cells preserves the official forward group order.
pdf=fitz.open(args.sources/'7.pdf');pdf_text=''
with contextlib.redirect_stdout(io.StringIO()):
    for page in list(pdf)[4:12]:
        for table in page.find_tables().tables:
            pdf_text+=''.join(cell for row in table.extract() for cell in row if cell)
pdf_text=re.sub(r'\s+','',pdf_text)
for value in sorted(set(values)):
    assert '/'.join(reversed(value.split('/'))) in pdf_text,value
money('152-3',sorted(set(values)))
exact('152-3','1/0','0٫1')
done(9,'Corrected all 49 reversed monetary occurrences (40 distinct amounts), rather than the report’s count of 45. Every corrected group sequence verified against PDF tariff cells on pages 5–12. Also restored 0.1 premium coefficient on PDF page 8.')
for formula in ['A=B=C=D','AB=CD','A=D &amp; B=C','A=C &amp; D=B+1']:exact('152-3',formula,f'<bdi dir="ltr">{formula}</bdi>')
for value in ['A3','A4','KM2']:exact('152-3',value,f'<bdi dir="ltr">{value}</bdi>')
done(11,'Isolated paper formats A3/A4, KM2 units and actual code equations from neighboring amounts/numbered labels. Rejected proposal to create A-1/A-2: those source numbers label examples, not paper formats.')
compose(r,flatten_postal)
done(10,'Removed the layout-only enclosing table around five data tables. Preserved every data cell, caption and note, with exact normalized-text equality checked.')
done(12,'STM1 already remains intact after Batch 01.', 'already_correct')

r=rec('153-2');s=source(r);tree=html.fromstring(s)
for table in tree.xpath('.//table')[1:]:
    old=html.tostring(table,encoding='unicode',with_tail=False);assert old in s
    new='<table dir="rtl"><tbody>'
    for tr in table.xpath('./thead/tr|./tbody/tr|./tr'):
        cells=list(tr);assert len(cells)==3
        new+='<tr>'+''.join(html.tostring(c,encoding='unicode',with_tail=False) for c in reversed(cells))+'</tr>'
    new+='</tbody></table>'
    assert sorted(re.sub(r'\s+','',c.text_content()) for c in table.xpath('.//th|.//td'))==sorted(re.sub(r'\s+','',c.text_content()) for c in html.fromstring(new).xpath('.//th|.//td'))
    add(r,old,new)
done(13,'Reordered mobile and fixed tariff columns to source RTL row / network / tariff order. Preserved all cells and rates.')
done(14,'STM1 already remains intact after Batch 01.', 'already_correct')

r=rec('156-1');s=source(r);first=lists(s)[0];opening=s[first['start']:first['open_end']]
add(r,s[first['start']:first['end']],s[first['start']:first['end']].replace(opening,opening.replace('type="1"','start="20" type="1"'),1))
done(15,'Rejected invented multilevel numbering. PDF uses plain 1–21 definitions, 1–8 services, 1–26 obligations and 1–6 organizational duties. Fixed only the two final definitions from displayed 1/2 to printed 20/21 on PDF page 2.')

number_lists(rec('163-1'),{0:labels(1,1,15)})
def unwrap_literal_clauses(s):
    a=s.index('<p><span dir="rtl">ماده 2');b=s.index('<aside',a)
    old=s[a:b];new=re.sub(r'</?(?:ol|li)\b[^>]*>','',old)
    assert plain('<div>'+new+'</div>')==plain('<div>'+old+'</div>')
    return s[:a]+new+s[b:]
compose(rec('163-1'),unwrap_literal_clauses)
done(16,'Restored definitions 1-1..1-15. Removed malformed nested/empty ol/li wrappers around already literal clauses in Articles 2 onward; retained all literal labels, annex text and footnotes. Checked text equality across the unwrapped span.')
coefficient_source=source(rec('163-4'))
for old,new in [('2/1','1٫2'),('8/0','0٫8'),('7/0','0٫7'),('6/0','0٫6'),('5/0','0٫5')]:
    # An unscoped 2/1 replacement would also corrupt 29/2/1392.
    cells=[cell for cell in re.findall(r'<td\b[^>]*>[\s\S]*?</td>',coefficient_source) if re.search(r'(?<![0-9/])'+re.escape(old)+r'(?![0-9/])',html.fromstring(cell).text_content())]
    assert len(cells)==1,(old,len(cells))
    exact('163-4',cells[0],cells[0].replace(old,new))
done(17,'Five development coefficients restored from PDF page 1; existing 1.1 and 1 retained, and all corresponding bid prices preserved.')
number_lists(rec('165-3'),{0:labels(2,1,14),1:labels(3,1,8)})
done(18,'Corrected source labels to 2-1..2-14 and 3-1..3-8. Rejected report’s 1/2 chapter prefixes: PDF chapter 1 is introduction, chapter 2 definitions, chapter 3 requirements.')
money('166-1',['000/200','000/300'])
done(19,'Restored 200,000 and 300,000 rial work thresholds from PDF page 2.')
number_lists(rec('166-1'),{1:labels(1,1,13),3:labels(2,1,3),4:labels(3,1,3),5:labels(3,4,4),7:labels(4,1,2),8:labels(4,3,10)})
compose(rec('166-1'),lambda s:unwrap_headings(s,{0:['1'],2:['2','3'],6:['4']}))
done(20,'Restored 30 subclause labels under source sections 1–4, including 3-4 continuation; independent headings no longer consume list markers or restart at 3 for section 4.')
money('166-4',['000/000/000/50','000/000/000/10'])
exact('166-4','25/0','0٫25')
done(21,'Restored 50 and 10 billion rial figures and adjacent 0.25 percent against PDF pages 4–5. Preserved separate source amendments and annexes.')
money('166-5',['000/360','000/200/1'])
done(22,'Restored 360,000 and 1,200,000 rial figures verified against PDF page 1.')

r=rec('166-7');s=source(r)
assert any('نسخه تنقیحی' in a['name'] and '326' in a['name'] for a in r['attachments'])
name='326-1---166-7.docx'
old=f'<section class="cra-source-text" data-format="docx"><div class="cra-source-label">متن پیوست <span>{name}</span></div>'
new='<section class="cra-source-text cra-consolidated-text" data-format="docx"><div class="cra-source-label cra-consolidated-label"><strong>پیوست تنقیحی</strong><span>با مصوبه شماره ۱ جلسه ۳۲۶</span></div>'
add(r,old,new)
exact('166-7','15/12/84','1384/12/15')
done(23,'Label/class grounded in the official attachment metadata explicitly naming نسخه تنقیحی and 326-1, plus the supplied source heading. No new consolidation or legal relationship inferred. Both short-year dates expanded; full original and consolidated text preserved.')
money('167-1',['000/000/10','000/000/15','000/000/20'])
done(24,'Three signaling-link monthly amounts restored to 10, 15, 20 million rials from PDF page 1.')
done(25,'E1 already remains intact after Batch 01.', 'already_correct')
money('167-6',['000/000/100'])
done(26,'Restored 100 million rial guarantee amount from PDF page 1.')
money('167-8',['000/000/50','000/000/200','000،000،1','000،000،5','000،000،10'])
done(27,'Restored 50 and 200 million rial amounts from PDF pages 3–4, plus three identically reversed comma-separated penalties of 1, 5 and 10 million confirmed by their words and PDF page 5.')
number_lists(rec('167-8'),{0:labels(1,1,11),1:labels(3,1,1),2:labels(3,2,2),3:labels(4,1,2),4:labels(5,1,2),5:labels(6,1,2),6:labels(7,2,2),7:labels(12,1,6),8:labels(13,1,1),9:labels(13,2,2),10:labels(14,1,1),11:labels(14,2,2)})
def remove_definition_dashes(s):
    new,n=re.subn(r'(<span class="cra-clause-number">1-\d+- </span><span dir="rtl">)- ',r'\1',s)
    assert n==11,n
    return new
compose(rec('167-8'),remove_definition_dashes)
done(28,'Restored all imported multilevel lists in Articles 1, 3–7, 12–14, removing 11 stray definition dashes. Existing literal clauses and third-level penalty/cancellation labels preserved.')

assert len(outcomes)==28
for guid,pairs in curation['htmlReplacements'].items():
    earlier=baseline.get(guid,[])
    pairs[:]=[p for p in pairs if p not in earlier]+[p for p in pairs if p in earlier]
ledger={'baseline_commit':BASELINE,'audit_date':'2026-11-25','scope':'Disposition of all 28 reported issues on 22 pages. Does not independently certify the 28 pages the reviewer marked clean.',
        'summary':{status:sum(s==status for s,n in outcomes.values()) for status in sorted({s for s,n in outcomes.values()})},
        'issues':[{**{k:r[k] for k in ['issue_id','audit_id','site_url','source_url','source_page']},'status':outcomes[r['issue_id']][0],'note':outcomes[r['issue_id']][1]} for r in issues],
        'sources':[{**r,'sha256':hashlib.sha256((args.sources/(str(r['i'])+'.pdf')).read_bytes()).hexdigest()} for r in json.loads((args.sources/'sources.json').read_text())]}
after=json.dumps(curation,ensure_ascii=False,indent=2)+'\n'
diff=list(difflib.unified_diff(before.splitlines(True),after.splitlines(True)))
print('*** Begin Patch')
if diff:
    print('*** Update File: '+str(path));print(re.sub(r'^@@[^\n]*@@[^\n]*$','@@',''.join(diff[2:]),flags=re.M),end='')
ledger_path=ROOT/'content/cra/audits/batch-03.json'
if ledger_path.exists():
    print('*** Update File: '+str(ledger_path));print('@@')
    for line in ledger_path.read_text().splitlines():print('-'+line)
else:print('*** Add File: '+str(ledger_path))
for line in json.dumps(ledger,ensure_ascii=False,indent=2).splitlines():print('+'+line)
print('*** End Patch')
