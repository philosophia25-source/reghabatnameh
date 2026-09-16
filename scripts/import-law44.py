#!/usr/bin/env python3
"""Extract the current consolidated text of the Article 44 Implementation Act.

The importer accepts a saved HTML page from davoudabadi.ir and writes the law
manifest plus one JSON file per ordinary article. Articles 44 and 45 are kept
in their existing curated TypeScript datasets because their analytical pages
already use a reviewed, structured transcription.
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

from lxml import etree, html


LAW_ID = "general-policies-44"
LAW_SOURCE = "https://davoudabadi.ir/page/7509461"
CURATED_ARTICLES = {"44", "45"}


def compact(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def article_slug(label: str) -> str:
    number = label.removeprefix("ماده").strip()
    if number == "7 مکرر":
        return "7-bis"
    return number


def block_kind(text: str) -> str:
    if re.match(r"^تبصره(?:\s|$)", text):
        return "note"
    if re.match(r"^(?:[0-9۰-۹]+|[الفبپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی])\s*[-ـ]", text):
        return "clause"
    return "paragraph"


def text_blocks(container, slug: str) -> list[dict[str, str]]:
    markup = etree.tostring(container, encoding="unicode", method="html")
    markup = re.sub(r"<br\s*/?>", "\n", markup, flags=re.I)
    markup = re.sub(r"</p\s*>", "\n", markup, flags=re.I)
    plain = html.fromstring(markup).text_content()
    lines = [compact(line) for line in plain.splitlines() if compact(line)]

    # The source prepends a visual "متن" label to articles 85–92. It is not
    # part of the Act and appears glued to the first word in the saved HTML.
    if lines and re.fullmatch(r"(?:8[5-9]|9[0-2])", slug) and lines[0].startswith("متن"):
        lines[0] = lines[0][3:]

    return [
        {"id": f"{LAW_ID}:article-{slug}:block-{index}", "kind": block_kind(line), "text": line}
        for index, line in enumerate(lines, start=1)
    ]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path, help="Saved HTML of the consolidated law page")
    parser.add_argument("output", type=Path, help="Destination content/laws/general-policies-44 directory")
    args = parser.parse_args()

    root = html.parse(str(args.input)).getroot()
    title = root.xpath('//h1[contains(@class,"post-title")]')
    if not title:
        raise SystemExit("Law title was not found in the supplied HTML")
    container = title[0].getparent().getparent()

    args.output.mkdir(parents=True, exist_ok=True)
    article_dir = args.output / "articles"
    article_dir.mkdir(exist_ok=True)
    for path in article_dir.glob("*.json"):
        path.unlink()

    chapters: list[dict[str, object]] = []
    articles: list[str] = []
    current_chapter: dict[str, object] | None = None

    for child in container:
        if child.tag == "div":
            label = compact(child.text_content()).lstrip("❯").strip()
            if label.startswith("فصل "):
                current_chapter = {
                    "id": f"chapter-{len(chapters) + 1}",
                    "title": label,
                    "articleSlugs": [],
                }
                chapters.append(current_chapter)
            continue

        if child.tag != "article":
            continue
        label = compact(" ".join(child.xpath('.//div[contains(@class,"pb-2")]//a//text()')))
        if not label.startswith("ماده "):
            continue
        slug = article_slug(label)
        body = child.xpath('.//div[contains(@class,"post-text")]')
        if not body or current_chapter is None:
            raise SystemExit(f"Could not place {label}")
        blocks = text_blocks(body[0], slug)
        if not blocks:
            raise SystemExit(f"Empty text for {label}")

        articles.append(slug)
        current_chapter["articleSlugs"].append(slug)
        if slug in CURATED_ARTICLES:
            continue

        source_path = child.xpath('.//div[contains(@class,"pb-2")]//a/@href')[0]
        record = {
            "id": f"{LAW_ID}:article-{slug}",
            "slug": slug,
            "label": label,
            "sourceUrl": f"https://davoudabadi.ir{source_path}",
            "blocks": blocks,
        }
        (article_dir / f"{slug}.json").write_text(
            json.dumps(record, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )

    # The enacted law is numbered to 92. Repealed article 28 is omitted and
    # article 7 bis remains in force, leaving 92 active article records.
    if len(articles) != 92:
        raise SystemExit(f"Expected 92 active articles, found {len(articles)}")

    guide = [
        {
            "id": "foundations",
            "title": "ساختار بازار، دسترسی و مجوزها",
            "description": "مواد آغازین مرتبط با تعریف بازار، حدود فعالیت اقتصادی، تمرکز و ورود به بازار",
            "articleSlugs": ["1", "2", "3", "4", "5", "6", "7", "7-bis", "8"],
        },
        {
            "id": "competition-chapter",
            "title": "تسهیل رقابت و منع انحصار",
            "description": "فصل نهم و هسته اصلی مقررات رقابت در قانون",
            "articleSlugs": [str(number) for number in range(43, 85)],
        },
        {
            "id": "implementation",
            "title": "احکام تکمیلی اجرای قانون",
            "description": "مواد پایانی مرتبط با اجرای قانون، جبران آثار قیمت‌گذاری و مشارکت بخش غیردولتی",
            "articleSlugs": [str(number) for number in range(85, 93)],
        },
    ]

    manifest = {
        "id": LAW_ID,
        "title": "قانون اجرای سیاست‌های کلی اصل چهل‌وچهارم قانون اساسی",
        "shortTitle": "قانون اجرای سیاست‌های کلی اصل ۴۴",
        "enactedAt": "۱۳۸۶/۱۱/۰۸",
        "editionLabel": "متن جاری با اصلاحات ثبت‌شده تا سال ۱۴۰۲",
        "source": {"title": "پایگاه حقوقی داودآبادی", "url": LAW_SOURCE},
        "articleSlugs": articles,
        "chapters": chapters,
        "competitionGuide": guide,
    }
    (args.output / "law.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
