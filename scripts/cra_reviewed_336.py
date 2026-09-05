"""Reconstruct the owner's 336-1 transcript, checked against the official PDF.

Not a generic legal-text rewriter. All positional repairs below are specific to
this transcript. Deletions in the source are retained as <del>, not silently
accepted. The unchanged importer HTML supplies the identical annex table.
"""
from __future__ import annotations

import copy
import re
from pathlib import Path
from lxml import etree, html

GUID = "46e982ec-2034-ed11-969e-0050569b0899"
ROUTE = "/resolutions/cra/1401/336-1"
FA = str.maketrans("0123456789", "۰۱۲۳۴۵۶۷۸۹")
EN = str.maketrans("۰۱۲۳۴۵۶۷۸۹", "0123456789")
TITLES = ["تعاریف", "شبکه موضوع پروانه", "خدمات موضوع پروانه", "شرایط عمومی دریافت الحاقیه پروانه", "مدت اعتبار پروانه", "تجدید اعتبار پروانه", "شرایط رقابت", "مبالغ، ضمانت‌نامهها و تعهدات سالیانه", "تعهدات دارنده پروانه", "شماره و فرکانس", "اتصال متقابل", "تعرفه", "نظارت", "تعلیق، کاهش مدت اعتبار و لغو پروانه", "جریمههای قانونی عدم انجام تعهدات", "امنیت ملی", "انصراف از ادامه فعالیت", "سایر مقررات", "تفسیر مفاد این مصوبه"]


def change(text: str, old: str, new: str, count: int = 1) -> str:
    if text.count(old) != count:
        raise ValueError(f"336-1 source mismatch ({text.count(old)} != {count}): {old}")
    return text.replace(old, new)


def spelling(text: str) -> str:
    # Finite list of transcription/spacing repairs, not a blanket لا/ال swap.
    pairs = {
        "اصطالحات": "اصطلاحات", "باال": "بالا", "انحالل": "انحلال",
        "اطالع": "اطلاع", "دالیل": "دلایل", "تسهیالت": "تسهیلات",
        "اسالمی": "اسلامی", "قبال": "قبلاً", "ساالنه": "سالانه",
        "الیه دسترسی": "لایه دسترسی", "مالک عمل": "ملاک عمل",
        "پروانههای": "پروانه‌های", "پروانهای": "پروانه‌ای",
        "ظرفیتهای": "ظرفیت‌های", "ضمانت‌نامههای": "ضمانت‌نامه‌های",
        "ضمانت‌نامهها": "ضمانت‌نامه‌ها", "صورتهای": "صورت‌های",
        "بخشهای": "بخش‌های", "دادهها": "داده‌ها", "دادهای": "داده‌ای",
        "جریمههای": "جریمه‌های", "بدهیهای": "بدهی‌های", "بدهیها": "بدهی‌ها",
        "فرکانسهای": "فرکانس‌های", "تعرفههای": "تعرفه‌های",
        "الحاقیههای": "الحاقیه‌های", "صورت‌حسابهای": "صورت‌حساب‌های",
        "شمارههای": "شماره‌های", "دستگاههای": "دستگاه‌های",
        "فناوریهای": "فناوری‌های", "استانها": "استان‌ها",
        "ترمینالهای": "ترمینال‌های", "میکروداکتهای": "میکروداکت‌های",
        "میکروداکت های": "میکروداکت‌های", "ردیفهای": "ردیف‌های",
        "نصابهای": "نصاب‌های", "هماهنگیهای": "هماهنگی‌های",
        "مجموعهای": "مجموعه‌ای", "نرمافزاری": "نرم‌افزاری",
        "سختافزاری": "سخت‌افزاری", "بینالملل": "بین‌الملل",
        "فوقالذکر": "فوق‌الذکر", "فوق‌الذکر": "فوق‌الذکر",
        "مبتنیبر": "مبتنی بر", "کلانشهر": "کلان‌شهر",
        "موافقتنامه": "موافقت‌نامه", "توافقنامه": "توافق‌نامه",
        "تفاهمنامه": "تفاهم‌نامه", "آییننامه": "آیین‌نامه",
        "میآید": "می‌آید", "میشوند": "می‌شوند", "میرسد": "می‌رسد",
        "خزانهداری": "خزانه‌داری", "شورایعالی": "شورای عالی",
        "اشتراکگذاری": "اشتراک‌گذاری", "عمده فروشی": "عمده‌فروشی",
        "توسعهای": "توسعه‌ای", "دورهای": "دوره‌ای",
        "زمانبندی": "زمان‌بندی", "بهرهمندی": "بهره‌مندی",
        "احالهکننده": "احاله‌کننده", "مابهالتفاوت": "مابه‌التفاوت",
        "سهساله": "سه‌ساله", "جابجایی": "جابه‌جایی",
        "جابهجایی": "جابه‌جایی", "نحویکه": "نحوی که",
        "تحرکپذیری": "تحرک‌پذیری", "واح ِد": "واحد",
        "صرف ًا": "صرفاً", "راسًا": "راساً", "کان لم یکن": "کان‌لم‌یکن",
    }
    for old, new in pairs.items():
        text = text.replace(old, new)
    return text


def footnote(n: int) -> str:
    return f'<sup class="cra-note-ref"><a id="consolidated-ref-{n}" href="#consolidated-note-{n}" role="doc-noteref">{str(n).translate(FA)}</a></sup>'


def annotate(text: str, old: str, new: str | None = None) -> str:
    return change(text, old, f"<del>{old}</del>" if new is None else new)


def transcript(source: str) -> tuple[str, str]:
    # Keep the owner's real clause boundaries; discard only physical line wraps.
    t = re.sub(r"\n\s*\n(?=-?[۰-۹]+-[۰-۹])", " § ", source)
    t = " ".join(t.split())
    t, annex = t.split("پیوست شماره – ۱", 1)
    t = change(t, "آن؛ ۱ Unified Network and Service Provider (UNSP) -۹-۱", "آن؛ § -۹-۱")
    t = change(t, "۲ Optical Line Terminal (OLT) ۳ Splitter ۴ Fiber Access Terminal (FAT) ۵ Optical Distribution Network (ODN) ۶ نظیر OLT (Optical Line Terminal) ۷ نظیر Splitter و/یا کابینت و /یا سایر اجزای ODN (Optical Distribution Network) ۸ Fiber Access Terminal", "")
    # Detached labels on pp. 8 and 12–13 of the official annotated PDF.
    t = change(t, "خواهد بود؛ منابع شماره", "خواهد بود؛ § ۱۰-۲- منابع شماره")
    t = change(t, "-۱۰-۲ سازمان تعهدی", "§ ۱۰-۳- سازمان تعهدی")
    t = change(t, "دارنده پروانه -۱۰-۳ در این", "دارنده پروانه در این")
    t = change(t, "در صورت تصمیم سازمان به بازآرایی", "§ ۱۰-۵- در صورت تصمیم سازمان به بازآرایی")
    t = change(t, "-۵-۱۰ تجهیزات", "تجهیزات")
    t = change(t, "بود؛ در صورت عدم ایفای تعهدات", "بود؛ § ۱۰-۶- در صورت عدم ایفای تعهدات")
    t = change(t, "فرکانسی -۶-۱۰ در شهرهایی", "فرکانسی در شهرهایی")
    t = change(t, "خواهد یافت؛ دارندگان پروانه موضوع", "خواهد یافت؛ § ۱۸-۱۲- <del>۱۹</del> دارندگان پروانه موضوع")
    t = change(t, "تایید -۱۹ سازمان", "تایید سازمان")
    t = change(t, "§ ۱۸-۱۲- ۱۸-۱۳- در صورت", "§ ۱۸-۱۳- <del>۱۹-۱</del> در صورت")
    t = change(t, "دارد؛ -۱-۱۹ -۱۴-۱۸ تعهدات", "دارد؛ § ۱۸-۱۴- <del>۲۰</del> تعهدات")
    t = change(t, "فیبر -۲۰ نوری", "فیبر نوری")
    t = change(t, "§ ۱۸-۱۴- -۱۵- -۱۵-۱۸ در دوره", "§ ۱۸-۱۵- در دوره")
    t = change(t, "بود؛ -۱۶-۱۸-۱۶-۱۸ سهامداری", "بود؛ § ۱۸-۱۶- <del>۲۱</del> سهامداری")
    t = change(t, "موضوع -۲۱ این مصوبه", "موضوع این مصوبه")
    t = change(t, "ندارد. -۱۷-۱۸ -۱۷-۱۸ سازمان", "ندارد. § ۱۸-۱۷- سازمان")
    t = change(t, "می‌یابد. -۱-۲۱ دارنده", "می‌یابد. § ۲۱-۱- دارنده")
    t = change(t, "است. -۳-۲۱", "است.")
    # Inline clause labels left inside preceding paragraphs in the transcript.
    for label in ["-۹-۱ تاریخ", "-۱۶-۱ نقطه", "-۱-۸ دارنده", "-۸-۸ مبلغ", "-۱۲-۲ دارنده", "-۲-۱۴ در", "-۲-۱۶ فعالیت", "-۶-۱۸ دارنده", "-۹-۱۸ تعهدات"]:
        t = change(t, label, "§ " + label)
    # Put the source's superscript references back on their associated words.
    for old, new in {
        "ارتباطی»۱ ماده": "ارتباطی»" + footnote(1) + " ماده",
        "OLT)۲": "OLT)" + footnote(2), "اسپلیتر، ۳": "اسپلیتر" + footnote(3) + "،",
        "FAT۴": "FAT" + footnote(4), "(ODN)۵": "(ODN)" + footnote(5),
        "فعال ۶": "فعال" + footnote(6), "غیرفعال ۷": "غیرفعال" + footnote(7),
        "FAT۸": "FAT" + footnote(8), "زمینی ۹": "زمینی" + footnote(9),
        "فضایی( ۱۰ ماهواره‌ای)": "فضایی" + footnote(10) + " (ماهواره‌ای)",
        "ترابردپذیری ۱۱": "ترابردپذیری" + footnote(11),
        "تحرکپذیری.۱۲": "تحرکپذیری" + footnote(12) + ".",
        "صورتهای مالی ۱۳": "صورتهای مالی" + footnote(13),
        "دو راه ۱۴": "دو راه" + footnote(14), "هفت راهه ۱۵": "هفت راهه" + footnote(15),
        "مشترکین ۱۶": "مشترکین" + footnote(16), "رومینگ ملی ۱۷": "رومینگ ملی" + footnote(17),
        "شمارههای تلفن ۱۸": "شمارههای تلفن" + footnote(18),
    }.items():
        t = change(t, old, new)
    t = change(t, "دوازده (۱)۲ ماهه", "دوازده (۱۲) ماهه")
    t = change(t, "مبلغ ( ۱۶ شانزده)", "مبلغ ۱۶ (شانزده)")
    t = change(t, "ترمینالهای، FAT", "ترمینالهای FAT")
    t = change(t, "؛ § -۱۶-۱ نقطه", ")؛ § -۱۶-۱ نقطه")
    t = change(t, "(، )FCP", "(FCP)،")
    t = change(t, ") \"(WTTx", "(WTTx)\"")
    t = change(t, ") (WTTx", "(WTTx)")
    t = change(t, ") (UNSP", "(UNSP)")
    t = change(t, "بند )۵-۴", "بند ۵-۴)")
    t = change(t, "بندهای ۱-۴ و، ۳-۴", "بندهای ۱-۴ و ۳-۴")
    t = change(t, "سال، ۱۴۰۹", "سال ۱۴۰۹،")
    t = change(t, "بند، ۷-۸", "بند ۷-۸،")
    t = change(t, "بند، ۳-۱۷", "بند ۳-۱۷،")
    t = change(t, "بند -۴۳", "بند ۴-۳")
    t = t.replace('»؛پروانه', '»؛ پروانه').replace('»؛به شرط', '» به شرط')
    # Restore exact tracked deletions visible in the official PDF.
    for old in [
        "چهار پنج حالت", "یا دارندگان پروانه شبکه ارتباطی ثابت",
        'اعاده یک "پروانه انتقال داده مبتنی بر فناوری بی‌سیم (WTTx)»با قلمروی فعالیت سراسر کشور',
        "یا پروانه اعاده شده موضوع بند ۳-۴ خواهد بود که باالترین درآمد را داشته است؛",
        "بند، ۴-۱-۴",
        "دارنده پروانه باید در صورت تقاضای دیگر دارندگان پروانه ارتباطی و فناوری اطلاعات حداقل سی درصد ظرفیت شبکه ایجاد شده در شبکه دسترسی مبتنی بر فیبر نوری موضوع پروانه خود را در چارچوب مقررات عمده‌فروشی مصوب کمیسیون واگذار کند؛",
        "در مناطقی که پوشش خانوار در چارچوب بند ۸-۴ ایجاد می‌شود، باید امکان بهره‌برداری از دو راه" + footnote(14) + " از ظرفیت یک میکروداکت ایجاد شده در چارچوب ابلاغی سازمان فراهم شود",
        "کسر مبلغ حق‌السهم دولت از درآمد بر اساس تعهدات پیشنهادی متقاضی توسط سازمان مورد سنجش قرار گرفته و متناسب با تحقق تعهد پیشنهادی، مبلغ حق‌السهم دولت از درآمد همان سال مالی کاهش خواهد یافت؛",
    ]:
        if old.startswith('اعاده یک'):
            assert t.count(old) == 2
            # Only TCI's old condition is struck out, not Irancell's condition.
            t = t.replace(old, f'<del>{old}</del>', 1)
        else:
            t = annotate(t, old, '<del>چهار</del> پنج حالت' if old == 'چهار پنج حالت' else None)
    t = change(t, "هر سال قراردادی سال مالی", "هر <del>سال قراردادی</del> <ins>سال مالی</ins>")
    t = change(t, "ارایه خدمات تلفن همراه نیستند", "<del>ارایه خدمات تلفن همراه</del> نیستند")
    t = change(t, "هر سال مالی قراردادی", "هر سال <ins>مالی</ins> <del>قراردادی</del>", 2)
    t = change(t, "سال اول مالی قراردادی", "سال اول <ins>مالی</ins> <del>قراردادی</del>")
    for old in ["پنج حالت", '"تعیین تکلیف کلیه تعهدات پروانه و الحاقیه‌های فعلی"',
                '"یا یک پروانه ایجاد و بهره‌برداری از شبکه ارتباطات ثابت (FCP)»',
                '"ایجاد شبکه ارتباطی سیار"']:
        t = change(t, old, f"<ins>{old}</ins>")
    # Canonical numbers from the PDF, restricted to this document's references.
    # References only: headings/labels are normalized separately below.
    for old, new in {
        "بند ۱-۴": "بند ۴-۱", "بندهای ۱-۴ و ۳-۴": "بندهای ۴-۱ و ۴-۳",
        "بندهای ۱-۴ و ۴-۳": "بندهای ۴-۱ و ۴-۳", "بند ۳-۴": "بند ۴-۳",
        "بند ۵-۴": "بند ۴-۵", "بندهای ۵-۴ و ۶-۴": "بندهای ۴-۵ و ۴-۶",
        "بندهای ۴-۴ تا ۶-۴": "بندهای ۴-۴ تا ۴-۶",
        "بندهای ۴-۹ و ۵-۹": "بندهای ۹-۴ و ۹-۵", "بند ۴-۸": "بند ۸-۴",
        "بند ۷-۸": "بند ۸-۷", "بندهای ۴-۱-۴ و ۵-۱-۴": "بندهای ۴-۱-۴ و ۴-۱-۵",
        "بند (۱)-۴": "بند (۴-۱)", "بند (۴-۸)": "بند (۸-۴)",
        "بند ۳-۱۷": "بند ۱۷-۳", "بند ۱-۱۴": "بند ۱۴-۱",
        "بندهای ۸-۸، ۷-۸ و ۹-۸": "بندهای ۸-۸، ۸-۷ و ۸-۹",
        "بند ۴-۱۴": "بند ۱۴-۴", "بندهای ۲-۱-۴، ۱-۱-۴ و ۳-۱-۴": "بندهای ۴-۱-۲، ۴-۱-۱ و ۴-۱-۳",
    }.items():
        if old not in t:
            raise ValueError(f"Missing expected reference: {old}")
        t = t.replace(old, new)
    # Repair mismatched quotation delimiters in the reviewed copy only.
    t = t.replace('(\"FCP\")', '(FCP)')
    t = t.replace('عمومی""، ایجاد', 'عمومی"، "ایجاد')
    t = t.replace('ثابت (FCP) انتقال', 'ثابت (FCP)"، "انتقال')
    t = t.replace('رایتل "،', 'رایتل، "')
    t = t.replace('»', '"').replace('«', '"')
    quotes = 0
    def quote(_):
        nonlocal quotes
        quotes += 1
        return '«' if quotes % 2 else '»'
    t = ''.join(part if part.startswith('<') else re.sub('"', quote, part) for part in re.split(r'(<[^>]+>)',t))
    if quotes % 2:
        raise ValueError("Unbalanced source quotations")
    # Latin terms touch Persian prose in the plain-text export.
    def inline_spacing(part):
        if part.startswith('<'):
            return part
        part = re.sub(r"(\)|»|[A-Za-z])(?=[آ-ی])", r"\1 ", part)
        part = re.sub(r"([آ-ی])(?=[A-Za-z])", r"\1 ", part)
        return part.replace('« ', '«').replace(' »', '»')
    t = ''.join(inline_spacing(part) for part in re.split(r'(<[^>]+>)',t))
    t = t.replace('</ins>و ', '</ins> و ').replace('</del>در مناطق', '</del> در مناطق')
    for i, title in enumerate(TITLES, 1):
        marker = ("ماده ۱۹- " if i == 19 else f"ماده -{str(i).translate(FA)} ") + title
        t = change(t, marker, f" §H{i}§ ")
    return t, annex


def render(source: str, base_html: str) -> str:
    t, annex = transcript(source)
    chunks = re.split(r"§H(\d+)§", t)
    preamble = spelling(chunks[0].strip())
    # Restore preamble paragraph boundaries, not the printed running title.
    preamble = preamble.split("بسمه تعالی", 1)[1].strip()
    preamble = change(preamble, "۳۶۱ کمیسیون تنظیم", "۳۶۱</p><p>کمیسیون تنظیم")
    preamble = change(preamble, "ارتباطات مصوبه شماره", "ارتباطات</p><p>مصوبه شماره")
    preamble = change(preamble, "اعمال می‌شود: «اصول", "اعمال می‌شود:</p><p><strong>«اصول") + "</strong>"
    body = ['<p>' + preamble + '</p>']
    outline = {}
    for idx in range(1, len(chunks), 2):
        article = int(chunks[idx]); content = chunks[idx+1].strip()
        title = spelling(TITLES[article-1])
        if article == 19:
            content = "تفسیر مفاد این مصوبه " + content
        heading = f'ماده {str(article).translate(FA)}' + (f' ـ {title}' if article != 19 else '')
        body.append(f'<h3 id="consolidated-article-{article}">{heading}</h3>')
        outline[article] = []
        for part in content.split("§"):
            part = part.strip()
            if not part:
                continue
            m = re.match(r"^-?([۰-۹]+(?:-[۰-۹]+)+)-?\s+", part)
            number = None
            if m:
                ns = [int(n) for n in m[1].translate(EN).split('-')]
                if ns[0] != article and ns[-1] == article:
                    ns.reverse()
                # Source pp.13 includes these deleted provisions under old 21.
                if ns[0] != article and not (article == 18 and ns[0] == 21):
                    raise ValueError(f"Unexpected clause in article {article}: {m[1]}")
                number = '-'.join(map(str,ns))
                outline[article].append(number)
                part = part[m.end():]
            part = spelling(part)
            segments = re.split(r"(?=تبصره(?:\s+[۰-۹]+[-ـ:]|:))", part)
            for j, segment in enumerate(segments):
                if not segment.strip():
                    continue
                # Render revisions before splitting notes, keeping tags balanced.
                prefix = ''
                attrs = ' class="cra-clause"'
                if number and j == 0:
                    attrs += f' id="consolidated-clause-{number}"'
                    prefix = f'<span class="cra-clause-number"><bdi dir="ltr">{number.translate(FA)}</bdi></span> '
                elif segment.startswith('تبصره'):
                    attrs = ' class="cra-proviso"'
                # Whole-clause additions and later amended provisos (PDF pp.2–13).
                if (number in {'4-1-5', '1-15', '1-16', '1-17', '1-18', '1-19', '18-14', '18-15', '18-16', '18-17'}
                    or (number in {'8-3','9-5'} and j == 1)
                    or (number == '18-8' and j == 2)):
                    segment = '<ins>' + segment.strip() + '</ins>'
                if number in {'21-1', '21-2'}:
                    segment = '<del>' + segment.strip() + '</del>'
                if number == '9-1':
                    segment = re.sub(r'(</del>)\s*([\s\S]+)$',r'\1 <ins>\2</ins>',segment)
                if number == '18-11':
                    before,after = segment.split('<del>',1)
                    segment = '<ins>' + before.strip() + '</ins> <del>' + after
                if number == '8-7':
                    segment = segment.replace('در هر صورت مبلغ','<ins>در هر صورت مبلغ') + '</ins>'
                if number == '8-1' and j == 0:
                    segment = segment.replace('سال مالی بعد', 'سال مالی <ins>بعد</ins>')
                if number == '8-9':
                    segment = segment.replace('بندهای ۴-۱-۴ و ۴-۱-۵','<ins>بندهای ۴-۱-۴ و ۴-۱-۵</ins>')
                if number == '1-14':
                    segment = segment.replace('«دارندگان','<ins>«دارندگان').replace('کشور»','کشور»</ins>')
                # Keep canonical references and clause labels in the same direction.
                segment = ''.join(p if p.startswith('<') else re.sub(r'(?<![۰-۹-])[۰-۹]+(?:-[۰-۹]+){1,2}(?![۰-۹-])', r'<bdi dir="ltr">\g<0></bdi>', p) for p in re.split(r'(<[^>]+>)',segment))
                body.append(f'<p{attrs}>{prefix}{segment.strip()}</p>')
    expected = {1:19, 2:0, 3:0, 4:12, 5:0, 6:2, 7:0, 8:11, 9:6, 10:6, 11:2, 12:2, 13:4, 14:24, 15:3, 16:2, 17:10, 18:19, 19:0}
    actual = {a:len(v) for a,v in outline.items()}
    if actual != expected:
        raise ValueError(f"Clause outline mismatch: {outline}")
    root = html.fragment_fromstring(base_html, create_parent='main')
    tables = root[0].xpath('.//table')
    rows = [copy.deepcopy(row) for table in tables for row in table.xpath('.//tr') if len(row.xpath('./td|./th')) == 3]
    if len(rows) != 16:
        raise ValueError('Expected unchanged 15-row official annex')
    table = etree.Element('table', {'class':'cra-reviewed-annex'})
    cap = etree.SubElement(table,'caption'); cap.text = 'پیوست شماره ۱ ـ جریمه‌های قانونی عدم انجام تعهدات'
    head = etree.SubElement(table,'thead'); head.append(rows[0])
    tbody = etree.SubElement(table,'tbody')
    for n,row in enumerate(rows[1:],1):
        for cell in row:
            cell.tag = 'td'; cell.attrib.pop('rowspan',None)
        if row[0].text_content().strip() != str(n):
            raise ValueError('Annex row order mismatch')
        tbody.append(row)
    body.append(html.tostring(table,encoding='unicode'))
    table_note = annex.split('*',1)[1].strip()
    body.append('<p>' + spelling('* ' + table_note) + '</p>')
    notes = ['Unified Network and Service Provider (UNSP)', 'Optical Line Terminal (OLT)', 'Splitter', 'Fiber Access Terminal (FAT)', 'Optical Distribution Network (ODN)', 'نظیر OLT (Optical Line Terminal)', 'نظیر Splitter و/یا کابینت و/یا سایر اجزای ODN (Optical Distribution Network)', 'Fiber Access Terminal', 'Terrestrial', 'Space', 'Portability', 'Mobility', 'Accounting Separation', '<del>Way</del>', '<ins>Way</ins>', 'Customer Care', 'National Roaming', 'Number Portability']
    body.append('<aside class="footnotes" role="doc-endnotes"><h4>پانوشت‌ها</h4><ol>')
    for n,note in enumerate(notes,1):
        body.append(f'<li id="consolidated-note-{n}"><p>{note} <a class="footnote-back" href="#consolidated-ref-{n}" aria-label="بازگشت به متن پانوشت {str(n).translate(FA)}">↩</a></p></li>')
    body.append('</ol></aside>')
    section = '<section class="cra-source-text cra-ocr-text cra-consolidated-text cra-reviewed-text" data-format="pdf"><div class="cra-source-label cra-consolidated-label"><strong>پیوست تنقیحی</strong><span>مطابق فایل منتشرشده در سامانه سازمان</span></div><p class="cra-revision-key">خط‌خوردگی‌ها و زیرخط‌های اصلاحی مطابق پیوست رسمی حفظ شده‌اند.</p>' + '\n'.join(body) + '</section>'
    sections = re.findall(r'<section\b[\s\S]*?</section>',base_html)
    targets = [i for i,s in enumerate(sections) if 'نسخه تنقیح شده.pdf' in s[:300]]
    if len(targets) != 1:
        raise ValueError('Expected one consolidated attachment')
    sections[targets[0]] = section
    result = '\n'.join(sections)
    doc = html.fragment_fromstring(result,create_parent='main')
    assert len(doc.xpath('.//h3[starts-with(@id,"consolidated-article-")]')) == 19
    return result
