"""Reproduce the web transcription from the supplied journal PDF (no legal rewriting)."""
import html
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
source = Path(sys.argv[1])
raw = subprocess.check_output(['pdftotext', '-layout', str(source), '-']).decode()
FA = str.maketrans('0123456789', '۰۱۲۳۴۵۶۷۸۹')
rep = {'صالحیت':'صلاحیت','ایاالت':'ایالات','اختالف':'اختلاف','اطالعات':'اطلاعات',
       'اعالم':'اعلام','ابالغ':'ابلاغ','اصالح':'اصلاح','کاال':'کالا','اخالل':'اخلال',
       'اسالمی':'اسلامی','انقالب':'انقلاب','تسهیالت':'تسهیلات','استدالل':'استدلال',
       'معامالت':'معاملات','مشکالت':'مشکلات','تالش':'تلاش','عالوه':'علاوه',
       'باال':'بالا','سالح':'سلاح','الزماالجرا':'لازم‌الاجرا','الزام':'الزام',
       'تنظیمگربخشی':'تنظیم‌گر بخشی','تنظیمگربخش':'تنظیم‌گر بخش','تنظیمگر':'تنظیم‌گر',
       'تنظیمگری':'تنظیم‌گری','مقرراتگذاری':'مقررات‌گذاری','قیمتگذاری':'قیمت‌گذاری',
       'شمارهگذاری':'شماره‌گذاری','قانونگذار':'قانون‌گذار','نتیجهگیری':'نتیجه‌گیری',
       'یادداشتها':'یادداشت‌ها','کلیدواژگان':'کلیدواژگان','پیشفرض':'پیش‌فرض',
       'همپوشانی':'هم‌پوشانی','خصوصیسازی':'خصوصی‌سازی','سرمایهگذاری':'سرمایه‌گذاری',
       'مصرفکنند':'مصرف‌کنند','ارائهدهند':'ارائه‌دهند','تنظیمکنند':'تنظیم‌کنند',
       'عمدهفروشی':'عمده‌فروشی','خردهفروشی':'خرده‌فروشی','زیرساختها':'زیرساخت‌ها',
       'بهرهوری':'بهره‌وری','بهراحتی':'به‌راحتی','بهشدت':'به‌شدت','درحالیکه':'در حالی که',
       'بهصراحت':'به‌صراحت','بهدرستی':'به‌درستی','بهتبع':'به‌تبع','بهرغم':'به‌رغم',
       'تازهوارد':'تازه‌وارد','همگام':'هم‌گام','حلوفصل':'حل‌وفصل','جابهجایی':'جابه‌جایی',
       'حقوقدان':'حقوق‌دان','ایتیاندتی':'ای‌تی‌اندتی','بینالملل':'بین‌الملل',
       'هیچیک':'هیچ‌یک','هیچگاه':'هیچ‌گاه','غیرقابل':'غیر قابل','بهاتفاق':'به‌اتفاق',
       'امکانپذیر':'امکان‌پذیر','تمامشده':'تمام‌شده','حسابرسیشده':'حسابرسی‌شده'}

def clean(t):
    def ltr(m):
        v=m[1].strip()
        v=re.sub(r'^([.,،:؛)]+)\s*(.+)$',lambda x:x[2]+x[1][::-1],v)
        return ' '+v+' '
    t=re.sub('\u202a([^\u202c]*)\u202c',ltr,t)
    t = re.sub(r'[\u200e\u200f\u202a-\u202e\u2066-\u2069]', '', t)
    t = re.sub(r'\s+', ' ', t).strip().replace('ي','ی').replace('ك','ک')
    for a,b in rep.items(): t=t.replace(a,b)
    for a,b in {'معضالت':'معضلات','کالیتون':'کلایتون','اطالق':'اطلاق','بیسابقهای':'بی‌سابقه‌ای','موفقیتآمیز':'موفقیت‌آمیز','بیطرف':'بی‌طرف','شبیهسازی':'شبیه‌سازی','پایانیافته':'پایان‌یافته','حلنشده':'حل‌نشده','پیچیدهتر':'پیچیده‌تر','می‌شوند':'می‌شوند','میشوند':'می‌شوند','نمیشد':'نمی‌شد','میشد':'می‌شد','راهاندازی':'راه‌اندازی','تلهکام':'تله‌کام','تنظیم‌کنندهها':'تنظیم‌کننده‌ها','گسستها':'گسست‌ها'}.items():t=t.replace(a,b)
    t=re.sub(r'(?<![آ-ی])((?:ن)?می)(?=(?:کند|شود|توان|گرد|ده|گیر|پرداز|رسد|مان|آید|آیند|نام))',r'\1‌',t)
    t=re.sub(r'(شرکت|اپراتور|تعرفه|قیمت|هزینه|نهاد|قانون|دادگاه|شبکه|بازار|رفتار|تصمیم|رویه|سیاست|شماره|فرکانس|بنگاه|دکل|پروانه|دستورالعمل|زیرساخت|مقررات|سال|روش|شکست|فعالیت)(های|ها)',r'\1‌\2',t)
    t=re.sub(r'\s+([،؛:.؟])',r'\1',t)
    t=re.sub(r'([،؛:.؟])(?=[آ-ی])',r'\1 ',t)
    return re.sub(r'\s+', ' ',t).strip()

# Remove running furniture page by page, not by matching phrases in the article.
lines=[]
for page_no,page in enumerate(raw.split('\f')):
    pl=[clean(l) for l in page.splitlines() if clean(l)]
    if not pl: continue
    if page_no:
        pl=[l for l in pl if l!='عم' and 'فصلنامه دانش حقوق' not in l and 'موازنة صلاحیت شورای رقابت' not in l and not re.fullmatch(r'\d{3}',l)]
    lines.extend(pl)
start=lines.index('چکیده')+1
lines=lines[start:]
lines=[l for l in lines if not l.startswith('∗ Email:') and '(نویسندة مسئول)' not in l]
joined='\n'.join(lines)
abstract,rest=joined.split('کلیدواژگان:',1)
rest=rest[rest.index('مقدمه'):]
body,back=rest.split('یادداشت‌ها',1)
body=re.sub(r'(?m)^(کدامیک[^\n]*|در صورت فقدان[^\n]*|آیا [^\n]*|متهم قدرت[^\n]*|امتناع از معامله برخلاف[^\n]*|وظایف مربوط[^\n]*|واگذاری[^\n]*)\s+([1-5])\.$',lambda m:'¶§'+m[2]+'§'+m[1].strip(),body)
body=re.sub(r'(?m)^([^\n]+)\s+•$',lambda m:'¶§•§'+m[1].strip(),body)
notes_text,refs=back.split('\nمنابع\n',1)

# Keep original heading wording, including the journal's starting at گفتار دوم.
headings=[('مقدمه','introduction',2),
('گفتار دوم: اختلاف صلاحیت رسیدگی میان کمیسیون ارتباطات فدرال و کمیسیون تجارت فدرال','united-states',2),
('گفتار سوم: اختلاف صلاحیت رسیدگی میان تنظیم‌گر بخشی و شورای رقابت در ایران','iran',2),
('الف) تعارض صلاحیت در مقررات مربوط به رفتارهای ضد رقابتی و ادغامها','conduct',3),
('ب) تعارض صلاحیت در مقررات مربوط به دسترسی بدون تبعیض همة اپراتورها به زیرساخت‌های شبکه','access',3),
('ج) تعارض صلاحیت در مقررات مربوط به مقررات‌گذاری اقتصادی (تنظیم تعرفه‌ها)','tariffs',3),
('نتیجه‌گیری','conclusion',2)]
headings=[(clean(title),id,level) for title,id,level in headings]
body=clean(re.sub(r'([.؟])\s*\n',r'\1¶',body))
for title,id,level in headings:
    if title not in body: raise ValueError(f'Heading missing: {title}')
    body=body.replace(title,f'\n@@{id}@@\n',1)

# Superscripts from the printed body. Keep the printed number and target with
# the same number, rather than silently interpreting inconsistent source notes.
markers=[('پیشگیرانه1',1),('ترمیمی2',2),('تسخیر3',3)]
# pdftotext places spaces between superscripts and Persian words.
anchors={1:'پیشگیرانه',2:'ترمیمی',3:'تسخیر',4:'تبیین کرد',5:'ترینکو',6:'بریر',
9:'انحصار چندجانبه',10:'صادر شد',11:'واگذار گردید',12:'وارد بازار مخابرات ایران شد',
13:'قانون اساسی',14:'تنظیم‌گر بخشی',15:'قانون اساسی',16:'تنظیم‌گر بخشی مخابرات',
17:'«شماره‌گذاری»',19:'پروندة دیگری',20:'شکست‌های بازار'}
for number,word in anchors.items():
    pattern=re.escape(word)+r'\s*'+str(number)+r'(?!\d)'
    body,n=re.subn(pattern,lambda m:word+f' [[{number}]]',body,count=1)
    if n!=1: raise ValueError(f'Note marker missing {number}: {word}')
body,n=re.subn(r'«اصل امنیت حقوقی»\s*8\s+7', '«اصل امنیت حقوقی» [[7]] [[8]]',body)
assert n==1

# Owner-authorized correction of mismatched printed references. Resolve by
# note meaning, then number in reading order. No substantive prose is changed.
targets={13:14,14:13,16:15,17:16,19:18,20:19}
body=re.sub(r'\[\[(\d+)\]\]',lambda m: '' if int(m[1])==15 else f'[[{targets.get(int(m[1]),int(m[1]))}]]',body)
body=body.replace('[[5]]','[[5]] [[20]]',1)
assert body.count('در پروندة اول')==1
body=body.replace('در پروندة اول','در پروندة اول [[17]]',1)
note_order=[int(x) for x in re.findall(r'\[\[(\d+)\]\]',body)]
assert len(note_order)==20 and set(note_order)==set(range(1,21))
renumber={old:new for new,old in enumerate(note_order,1)}
body=re.sub(r'\[\[(\d+)\]\]',lambda m:f'[[{renumber[int(m[1])]}]]',body)

def inline(t):
    t=t.replace('( & Ayres Braithwaite,','(Ayres & Braithwaite,')
    # LTR citations with their punctuation contained in one isolated run.
    t=html.escape(t)
    t=re.sub(r'\(\s*([A-Za-z][^()]*?)\)',lambda m:'<bdi dir="ltr">('+m[1].removeprefix('.').strip()+')</bdi>',t)
    t=re.sub(r'\[\[(\d+)\]\]',lambda m:f'<sup id="article-ref-{m[1]}"><a href="#article-note-{m[1]}" aria-label="یادداشت {m[1].translate(FA)}">{m[1].translate(FA)}</a></sup>',t)
    # Only visible text, never attributes or source URLs.
    return ''.join(p if p.startswith('<') or re.search('[A-Za-z]',p) else p.translate(FA) for p in re.split('(<[^>]+>)',t))

output=[]
for part in re.split(r'(@@[^@]+@@)',body):
    part=part.strip()
    if not part: continue
    if part.startswith('@@'):
        title,id,level=next(h for h in headings if h[1]==part[2:-2])
        output.append(f'<h{level} id="{id}">{inline(title)}</h{level}>')
    else:
        # Unwrap print lines; paragraph boundaries at complete sentences retain
        # every word and citation without leaving PDF line-break fragments.
        paragraphs=part.split('¶')
        for p in paragraphs:
            p=p.strip()
            if not p:continue
            item=re.match(r'§([1-5•])§(.*)',p)
            if item:
                output.append('<p class="journal-list-item"><span>'+item[1].translate(FA)+'.</span> '+inline(item[2])+'</p>')
            else: output.append('<p>'+inline(p)+'</p>')

notes=[]
for m in re.finditer(r'(?:^|\n)(\d{1,2})\.\s*([\s\S]*?)(?=\n\d{1,2}\.\s|$)',notes_text.strip()):
    number=int(m[1]); value=clean(m[2]); notes.append((number,value))
assert [n for n,_ in notes]==list(range(1,21)),notes
output.append('<h2 id="notes">یادداشت‌ها</h2><ol class="journal-notes">')
for old,value in sorted(notes,key=lambda x:renumber[x[0]]):
    n=renumber[old]
    if old==10:
        value='این شرکت با سرمایه‌گذاری مشترک گروه ام‌تی‌ان افریقای جنوبی (۴۹٪) و شرکت گسترش الکترونیک ایران (۵۱٪) (متشکل از بنیاد مستضعفان انقلاب اسلامی و وزارت دفاع و پشتیبانی نیروهای مسلح) راه‌اندازی شد.'
    if old==15:
        value=value.replace(')(Significant Market Power','(Significant Market Power)').replace(') (Significant Market Power','(Significant Market Power)')
    direction=' dir="ltr" lang="en"' if re.match('[A-Za-z]',value) else ''
    back=f' <a class="note-back" href="#article-ref-{n}" aria-label="بازگشت به متن یادداشت {str(n).translate(FA)}">بازگشت به متن</a>' if f'[[{n}]]' in body else ''
    output.append(f'<li id="article-note-{n}" value="{n}"><div{direction}>{inline(value)}</div>{back}</li>')
output.append('</ol><h2 id="references">منابع</h2>')
# Bibliography uses its printed order, including incomplete entries.
fa_refs,en_refs=refs.split('References:',1)
# This bibliography page has LTR base direction in the PDF extraction.
# Restore its four entries from the author's supplied transcription.
for p in [
 'حسینی، م. و غفاری، ب. (۱۳۹۹). مطالعه تطبیقی رابطه حقوقی نهادهای رقابتی و نهادهای تنظیم‌گر بخشی؛ از تضاد تا تعامل. مطالعات حقوق تطبیقی، ۱۱(۲)، ۵۲۵–۵۵۰.',
 'خشنودی، ر. و حسینی، م. (۱۳۹۵). ماهیت حقوقی شورای رقابت و تجدیدنظر از آرای آن. تحقیقات حقوقی، ۷۵، ۲۰۱–۲۲۵.',
 'رستمی، و. و اصغرنیا، م. (۱۳۹۲). اختلاف صلاحیت شورای رقابت و کمیسیون تنظیم مقررات ارتباطات. رویه قضایی حقوق عمومی، ۲(۴)، ۹۹–۱۲۵.',
 'عطریان، فرامرز (۱۳۹۶). اصل امنیت حقوقی و مداخله دولت در عرصه اقتصاد. فصلنامه مطالعات حقوق عمومی دانشگاه تهران، ۴۷(۲)، ۲۸۱–۳۰۱.'
]: output.append('<p>'+inline(p)+'</p>')
output.append('<div class="journal-references" dir="ltr" lang="en"><h3>References</h3>')
en_refs=en_refs.replace('Oxford Uni340-versity Press.','Oxford University Press.').replace('Hart 338 Publishing.','Hart Publishing.')
en_refs=re.sub(r'Marketplace\.\s+California\s+Law\s+Review,\s+75\(3\),\s+1005-1047\.\s+doi:10.2307/3480665\.', '', en_refs)
en_refs=en_refs.replace('Breyer, S. (1987). Antitrust, Deregulation, and the Newly Liberated', 'Breyer, S. (1987). Antitrust, Deregulation, and the Newly Liberated Marketplace. California Law Review, 75(3), 1005-1047. doi:10.2307/3480665.')
en_refs=en_refs.replace('2((۴)', '2(4), 99-125.').replace('195) available.', '195. available.')
for p in re.split(r'\n(?=(?:Books|Article|Ayres|Hellwig|ITU\.|Larouche|Lundborg|Manne|Milne|OECD|Pe |Shelanski|UNCTAD|Atriyan|Breyer|de Streel|Douglas|Geradin|Grimes|Hosseini|Khoshnoudi|Marketplace|Rostami|Weiss))',en_refs.strip()):
    output.append('<p>'+html.escape(clean(p))+'</p>')
output.append('</div>')
dest=ROOT/'content/articles/competition-council-and-telecom-regulator.html'
dest.parent.mkdir(parents=True,exist_ok=True)
dest.write_text('\n'.join(output)+'\n')
(dest.parent/'telecom-abstract.json').write_text(json.dumps(clean(abstract),ensure_ascii=False)+'\n')
print(f'Imported full article, {len(notes)} notes and {len(headings)} headings')
