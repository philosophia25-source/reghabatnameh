#!/usr/bin/env python3
"""Print a reviewable patch for the numbered clauses verified against Batch 01 PDFs.

Never modify importer output. All changes are exact-match display corrections.
PDF provenance and issue dispositions are recorded in content/cra/audits/batch-01.json.
"""
import copy
import difflib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
records = json.loads((ROOT / 'content/cra/index.json').read_text())
path = ROOT / 'content/cra/display-curation.json'
before = path.read_text()
curation = json.loads(before)

def record(session):
    return next(r for r in records if r['sessionNumber'] == str(session))

def source(r):
    return (ROOT / 'content' / r['contentFile']).read_text()

def add(r, old, new):
    assert old and old != new
    replacements = curation['htmlReplacements'].setdefault(r['guid'], [])
    value = {'from': old, 'to': new}
    if value not in replacements:
        replacements.append(value)

def lists(text):
    """Locate raw ol/li/p offsets without reserializing tables or Word markup."""
    result, ol_stack, li_stack = [], [], []
    for m in re.finditer(r'</?(?:ol|li|p)\b[^>]*>', text):
        token = m.group(); closing = token.startswith('</')
        tag = re.match(r'</?(\w+)', token).group(1)
        if tag == 'ol':
            if closing:
                obj = ol_stack.pop(); obj['end'] = m.end()
            else:
                obj = {'start': m.start(), 'open_end': m.end(), 'items': []}
                result.append(obj); ol_stack.append(obj)
        elif tag == 'li':
            if closing:
                li_stack.pop()
            else:
                item = {'paragraph': None}
                li_stack.append(item)
                if ol_stack: ol_stack[-1]['items'].append(item)
        elif not closing and li_stack and li_stack[-1]['paragraph'] is None:
            li_stack[-1]['paragraph'] = m.end()
    return result

def number_lists(r, mapping, starts=None):
    text = source(r); ols = lists(text); edits = []
    for idx, labels in mapping.items():
        ol = ols[idx]
        assert len(labels) == len(ol['items']), (r['sessionNumber'], idx)
        opening = text[ol['start']:ol['open_end']]
        edits.append((ol['start'], ol['open_end'], opening[:-1] + ' style="list-style-type:none">'))
        for item, label in zip(ol['items'], labels):
            pos = item['paragraph']; assert pos is not None
            edits.append((pos, pos, f'<span class="cra-clause-number">{label}- </span>'))
    for idx, start in (starts or {}).items():
        ol = ols[idx]; opening = text[ol['start']:ol['open_end']]
        new = re.sub(r'\bstart="[^"]*"', f'start="{start}"', opening)
        assert new != opening
        edits.append((ol['start'], ol['open_end'], new))
    # Store only the changed list fragments; tables and other annexes stay out
    # of the correction layer. Nested edits share one outer exact-match anchor.
    selected=[ols[i] for i in set(mapping) | set(starts or {})]
    outer=[o for o in selected if not any(p is not o and p['start'] < o['start'] and p['end'] >= o['end'] for p in selected)]
    for ol in outer:
        start,end=ol['start'],ol['end']; old=text[start:end]; corrected=old
        for a,b,value in sorted(edits,reverse=True):
            if a >= start and b <= end: corrected=corrected[:a-start]+value+corrected[b-start:]
        add(r,old,corrected)

def labels(chapter, first, last):
    return [f'{chapter}-{i}' for i in range(first, last+1)]

number_lists(record(22), {2: labels(1,1,2)})
maps39={0:labels(1,1,1),1:labels(1,2,2),2:labels(1,3,3),3:labels(1,4,4),4:labels(1,5,6),5:labels(2,1,1),6:labels(3,1,1),7:labels(3,2,2),8:labels(3,3,4),9:labels(3,5,5),10:labels(4,1,3),11:labels(5,1,5),12:labels(6,1,1),13:labels(7,1,1),14:labels(8,1,2)}
for session in (37,38,39): number_lists(record(session), maps39)
number_lists(record(43), {2:labels(1,1,3),3:labels(2,1,4),4:labels(3,1,4),5:labels(4,1,6),7:labels(5,1,4)}, {6:5})
# PDF pages 2-3 call the first five items Article 1, not Article 3.
number_lists(record(48), {0:labels(1,1,3),1:labels(1,4,5),2:labels(4,1,9)})
number_lists(record(53), {0:labels(2,1,1),1:labels(2,2,2),2:['(ب)'],3:['(ج)'],4:['(د)'],5:labels(8,1,3)})
number_lists(record(60), {0:labels(1,1,15),1:labels(2,1,7),2:labels(3,1,2),3:labels(4,1,3),4:labels(4,4,8),5:labels(4,9,9),6:labels(4,10,12),7:labels(5,1,4),8:labels(6,1,4),9:labels(7,1,9)})
number_lists(record(71), {0:labels(1,1,2),1:labels(1,3,3),2:labels(1,4,4),3:labels(1,5,6),4:labels(1,7,7),5:labels(2,1,1),6:labels(3,1,1),7:labels(3,3,4),8:labels(4,1,3),9:labels(5,1,4),10:labels(6,1,1),11:labels(7,1,1),12:labels(8,1,3)})

for session, old, new in [(3,'22/5/ 1384','1384/05/22'),(8,'18 /11/1384','1384/11/18'),(9,'29 /11/1384','1384/11/29'),(9,'23 /11/1384','1384/11/23'),(9,'12908 /10','12908/10')]:
    r=record(session); assert old in source(r); add(r,old,new)

r=record(14); original=source(r)
sections=re.findall(r'<section\b[^>]*>[\s\S]*?</section>',original)
assert len(sections)==2
add(r,original,'\n'.join(reversed(sections)))

for session in (37,38,39):
    r=record(session)
    # Apply after the exact original-source replacement above.
    for match in set(re.findall(r'فر[^<]{0,12}نسی',source(r))):
        if 'ﻛ' in match or ' ' in match:
            add(r,match,'فرکانسی')

r=record(62)
for old,new in [('<del>-</del>','-'),('<del>\u200c</del>','\u200c')]:
    assert old in source(r);add(r,old,new)

r=record(80);s=source(r)
old=re.search(r'<p><u><span dir="rtl">هزينه کدخدماتی بين[^<]*</span> =</u> (<a[^>]*fnref2[^>]*><sup>2</sup></a>)',s)
assert old
new=old.group().replace(' =</u> '+old[1],'</u>'+old[1]+' = ')
add(r,old.group(),new)
add(r,'<li><p><span dir="rtl">1 در ارتباط با لزوم','<li><p><span dir="rtl">در ارتباط با لزوم')

# Separate the existing reviewed OCR annex from the original textual resolution.
r=record(17);override=(ROOT/'content/cra/ocr-overrides'/f'{r["guid"]}.html').read_text()
split='<p><span dir="rtl">17:</span></p>'
annex=override.split(split)[0]
annex=annex.replace('<p><span dir="rtl">17-</span>p1</p>','')
annex=annex.replace('وزیر ارتباطات و فناوری اطلاعات (و رئیس مجمع)','وزیر ارتباطات و برنامه ریزی و رئیس مجمع')
annex+='</section>'
main=next(sec for sec in re.findall(r'<section\b[^>]*>[\s\S]*?</section>',source(r)) if '11209/35' in sec)
add(r,override,main+'\n'+annex)

r=next(r for r in records if r['slug']=='1-277')
curation.setdefault('recordMetadata',{})[r['guid']]={'sessionNumber':'277','resolutionNumber':'1'}

after=json.dumps(curation,ensure_ascii=False,indent=2)+'\n'
diff=list(difflib.unified_diff(before.splitlines(True),after.splitlines(True)))
print('*** Begin Patch')
print('*** Update File: '+str(path))
print(re.sub(r'^@@[^\n]*@@[^\n]*$', '@@', ''.join(diff[2:]), flags=re.M),end='')
print('*** End Patch')
