#!/usr/bin/env python3
"""Build durable CRA OCR overrides from an owner-reviewed DOCX.

The generated files live beside, but never overwrite, importer-owned CRA HTML.
Route markers in the DOCX identify the target resolution pages.
"""

from __future__ import annotations

import argparse
import copy
import hashlib
import html as html_module
import json
import re
import subprocess
import tempfile
from pathlib import Path

from lxml import etree, html


SPACE_RE = re.compile(r"\s+")
DIGIT_TRANSLATION = str.maketrans("۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩", "01234567890123456789")
ROUTE_RE = re.compile(r"/resolutions/cra/\S+")
TEXT_REFERENCE_RE = re.compile(
    r"مصوبه\s*(?:شماره)?\s*[\(\[]?\s*(\d{1,3})\s*[\)\]]?"
    r"\s*(?:مورخ.{0,80}?)?\s*جلسه\s*(?:شماره)?\s*[\(\[]?\s*(\d{1,4})",
    re.IGNORECASE,
)

FULL_OCR_ROUTES = {
    "/resolutions/cra/1404/364-5",
    "/resolutions/cra/1397/289-2-v1",
    "/resolutions/cra/1393/191-3",
    "/resolutions/cra/1398/296-4-v1",
    "/resolutions/cra/1385/17-1",
    "/resolutions/cra/1389/107-1",
}

DUPLICATE_SCAN_ROUTES = {
    "/resolutions/cra/1399/310-5-v1",
    "/resolutions/cra/1403/357-2",
    "/resolutions/cra/1402/352-3",
    "/resolutions/cra/1398/292-1",
    "/resolutions/cra/1402/7-350",
}

APPEND_OCR_ROUTES = {
    "/resolutions/cra/1401/335-2",
    "/resolutions/cra/1400/317-2",
}

MATH_REPLACEMENT_ROUTES = {
    "/resolutions/cra/1395/237-3",
    "/resolutions/cra/1395/254-5",
    "/resolutions/cra/1402/353-1",
}

SPECIAL_CONSOLIDATED_ROUTE = "/resolutions/cra/1400/329-3"

EXPECTED_ROUTES = (
    FULL_OCR_ROUTES
    | DUPLICATE_SCAN_ROUTES
    | APPEND_OCR_ROUTES
    | MATH_REPLACEMENT_ROUTES
    | {SPECIAL_CONSOLIDATED_ROUTE}
)


def normalized_text(value: str | None) -> str:
    return SPACE_RE.sub(" ", value or "").strip()


def element_text(element: etree._Element) -> str:
    return normalized_text(" ".join(element.itertext()))


def clear_and_set_text(element: etree._Element, text: str) -> None:
    for child in list(element):
        element.remove(child)
    element.text = text


def parse_fragment(fragment: str) -> etree._Element:
    return html.fragment_fromstring(fragment or "<p></p>", create_parent="main")


def serialize_children(wrapper: etree._Element) -> str:
    return "".join(
        html.tostring(child, encoding="unicode", method="html")
        for child in wrapper
    )


def clone_nodes(nodes: list[etree._Element]) -> list[etree._Element]:
    return [copy.deepcopy(node) for node in nodes]


def route_segments(pandoc_fragment: str) -> dict[str, list[etree._Element]]:
    wrapper = parse_fragment(pandoc_fragment)
    result: dict[str, list[etree._Element]] = {}
    current_route: str | None = None
    for node in wrapper:
        compact_text = re.sub(r"\s+", "", "".join(node.itertext()))
        route_match = ROUTE_RE.fullmatch(compact_text)
        # Word sometimes keeps the next route marker and an editorial note in
        # the same paragraph. Treat the leading route as the marker and drop
        # the remainder so work notes cannot enter the public OCR section.
        if route_match is None:
            route_match = ROUTE_RE.match(compact_text)
        if route_match is None:
            for href in node.xpath(".//a/@href"):
                route_match = ROUTE_RE.search(href)
                if route_match is not None:
                    break
        if route_match:
            current_route = route_match.group(0)
            result[current_route] = []
            continue
        if current_route:
            result[current_route].append(copy.deepcopy(node))
    return result


def replace_element_text_prefix(element: etree._Element, prefix_pattern: str) -> bool:
    text = element_text(element)
    remainder = re.sub(prefix_pattern, "", text, count=1).strip()
    if remainder == text:
        return False
    if remainder:
        clear_and_set_text(element, remainder)
    else:
        parent = element.getparent()
        if parent is not None:
            parent.remove(element)
    return True


def clean_ocr_nodes(nodes: list[etree._Element]) -> list[etree._Element]:
    wrapper = etree.Element("main")
    for node in clone_nodes(nodes):
        wrapper.append(node)

    skip_seal_text = False
    for node in list(wrapper):
        text = element_text(node)
        if not text:
            wrapper.remove(node)
            continue
        if skip_seal_text:
            skip_seal_text = False
            if text.startswith("وزارت ارتباطات و فناوری اطلاعات"):
                wrapper.remove(node)
                continue
        if re.fullmatch(r"صفحه\s+[۰-۹0-9]+", text):
            wrapper.remove(node)
            continue
        if re.fullmatch(r"17-p1", text, re.IGNORECASE):
            wrapper.remove(node)
            continue
        if re.search(r"صفحه\s+[۰-۹0-9]+\s+از\s+[۰-۹0-9]+\s*$", text):
            wrapper.remove(node)
            continue
        if text.startswith("مهر سازمان"):
            wrapper.remove(node)
            skip_seal_text = True
            continue
        if re.match(r"پاورقی(?:\s+سند|\s*\([^)]*\)|\s+پایین[^:]*)?\s*:\s*$", text):
            wrapper.remove(node)
            continue
        if re.match(r"(?:عنوان|عنوان \(داخل کادر\)|متن مصوبه)\s*:\s*$", text):
            wrapper.remove(node)
            continue
        if text.startswith("سربرگ"):
            if not replace_element_text_prefix(node, r"^سربرگ(?:\s*\([^)]*\))?\s*:\s*"):
                wrapper.remove(node)
            continue
        if text.startswith("متن مقدمه"):
            replace_element_text_prefix(node, r"^متن مقدمه\s*:\s*")
            continue
        if text.startswith("متن صورتجلسه"):
            replace_element_text_prefix(node, r"^متن صورتجلسه\s*:\s*")
            continue
        if text in {
            "عکس ها همون متن بالاشه و تکراره چرا بمونه",
            "عکس‌ها همون متن بالاشه و تکراره چرا بمونه",
        }:
            wrapper.remove(node)
            continue

    for node in wrapper.xpath(".//*[not(self::math) and not(ancestor::math)]"):
        for attribute in list(node.attrib):
            if attribute.lower().startswith("on"):
                del node.attrib[attribute]

    return list(wrapper)


def make_section(
    nodes: list[etree._Element],
    title: str = "متن استخراج‌شده از پیوست تصویری",
    subtitle: str = "جایگزین نسخه تصویری",
    class_name: str = "cra-source-text cra-ocr-text",
) -> etree._Element:
    section = etree.Element("section", {"class": class_name, "data-format": "ocr"})
    label = etree.SubElement(section, "div", {"class": "cra-source-label"})
    strong = etree.SubElement(label, "strong")
    strong.text = title
    span = etree.SubElement(label, "span")
    span.text = subtitle
    for node in clone_nodes(nodes):
        section.append(node)
    return section


def sections_without_images(base_html: str) -> list[etree._Element]:
    wrapper = parse_fragment(base_html)
    return [
        copy.deepcopy(section)
        for section in wrapper.xpath("./section")
        if not section.xpath(".//img")
    ]


def full_ocr_override(nodes: list[etree._Element]) -> str:
    wrapper = etree.Element("main")
    wrapper.append(make_section(clean_ocr_nodes(nodes)))
    return serialize_children(wrapper)


def duplicate_scan_override(base_html: str) -> str:
    wrapper = etree.Element("main")
    for section in sections_without_images(base_html):
        wrapper.append(section)
    return serialize_children(wrapper)


def append_ocr_override(base_html: str, nodes: list[etree._Element]) -> str:
    wrapper = etree.Element("main")
    for section in sections_without_images(base_html):
        wrapper.append(section)
    wrapper.append(make_section(clean_ocr_nodes(nodes)))
    return serialize_children(wrapper)


def math_replacement_override(base_html: str, nodes: list[etree._Element], route: str) -> str:
    wrapper = parse_fragment(base_html)
    ocr_nodes = clean_ocr_nodes(nodes)
    math_paragraphs = [node for node in ocr_nodes if node.xpath(".//math") or node.tag == "math"]
    if len(math_paragraphs) != 1:
        raise ValueError(f"{route}: exactly one OCR math paragraph was expected")
    image_paragraphs = wrapper.xpath(".//p[.//img]")
    if not image_paragraphs:
        raise ValueError(f"{route}: at least one image paragraph was expected")
    # A resolution can expose the same formula in more than one official
    # attachment. Replace every image occurrence so no scanned formula remains
    # while preserving each attachment's surrounding text and tables.
    for image_paragraph in image_paragraphs:
        image_paragraph.getparent().replace(image_paragraph, copy.deepcopy(math_paragraphs[0]))
    return serialize_children(wrapper)


def split_on_marker(
    nodes: list[etree._Element],
    marker: str,
) -> tuple[list[etree._Element], list[etree._Element]]:
    for index, node in enumerate(nodes):
        if element_text(node).startswith(marker):
            return nodes[:index], nodes[index + 1:]
    raise ValueError(f"OCR marker was not found: {marker}")


def remove_struck_text(nodes: list[etree._Element]) -> list[etree._Element]:
    wrapper = etree.Element("main")
    for node in clone_nodes(nodes):
        wrapper.append(node)
    serialized = serialize_children(wrapper)
    if serialized.count("~~") % 2:
        raise ValueError("Unbalanced strike markers in consolidated text")
    serialized = re.sub(r"~~.*?~~", "", serialized, flags=re.DOTALL)
    return list(parse_fragment(serialized))


def clean_revision_label(text: str) -> str:
    text = re.sub(
        r"(ماده\s+[۰-۹0-9]+)\s*\(جدید\)\s*/\s*ماده\s+[۰-۹0-9]+\s*\(سابق\)",
        r"\1",
        text,
    )
    text = re.sub(
        r"([۰-۹0-9]+-[۰-۹0-9]+)\s*\(جدید\)\s*/\s*[۰-۹0-9]+-[۰-۹0-9]+\s*\(سابق\)",
        r"\1",
        text,
    )
    text = re.sub(r"\s+([،؛:.])", r"\1", text)
    return normalized_text(text)


def format_consolidated_paragraph(paragraph: etree._Element) -> None:
    text = clean_revision_label(element_text(paragraph))
    clear_and_set_text(paragraph, "")
    if text.startswith("ماده "):
        strong = etree.SubElement(paragraph, "strong")
        strong.text = text
        return
    heading = re.match(
        r"^((?:[۰-۹0-9]+-[۰-۹0-9]+\s*[-:]|[۰-۹0-9]+-[۰-۹0-9]+\s*[^:]{1,80}:|تبصره\s*:))\s*(.*)$",
        text,
    )
    if heading:
        strong = etree.SubElement(paragraph, "strong")
        strong.text = heading.group(1)
        strong.tail = (" " + heading.group(2)).rstrip()
    else:
        paragraph.text = text


def clean_consolidated_nodes(nodes: list[etree._Element]) -> list[etree._Element]:
    wrapper = etree.Element("main")
    for node in remove_struck_text(nodes):
        wrapper.append(node)

    for item in list(wrapper.xpath(".//li")):
        text = element_text(item)
        if "حذف شده است" in text or "کاملاً حذف شده است" in text:
            item.getparent().remove(item)
    for paragraph in list(wrapper.xpath("./p")):
        text = element_text(paragraph)
        if text.startswith("ماده ۳ (سابق)") or "کل ماده ۳ سابق" in text:
            wrapper.remove(paragraph)
    for item in list(wrapper.xpath(".//li")):
        if not element_text(item):
            item.getparent().remove(item)
    for list_element in list(wrapper.xpath(".//ul|.//ol")):
        if not element_text(list_element):
            list_element.getparent().remove(list_element)

    for paragraph in wrapper.xpath(".//p"):
        format_consolidated_paragraph(paragraph)

    return list(wrapper)


def consolidated_override(nodes: list[etree._Element]) -> str:
    original, after_original = split_on_marker(nodes, "تصویب نامه هیئت وزیران- 1")
    cabinet_one, after_cabinet_one = split_on_marker(after_original, "تصویب نامه هیئت وزیران – 2")
    cabinet_two, consolidated = split_on_marker(
        after_cabinet_one,
        "نسخه تنقیحی مصوبه شماره 3 جلسه 329",
    )

    cleaned_consolidated = clean_ocr_nodes(consolidated)
    cleaned_consolidated = [
        node for node in cleaned_consolidated
        if "این رو خود چت چی پی تی" not in element_text(node)
        and "با اعمال اصلاحات مصوبات شماره" not in element_text(node)
    ]
    cleaned_consolidated = clean_consolidated_nodes(cleaned_consolidated)

    wrapper = etree.Element("main")
    wrapper.append(make_section(
        clean_ocr_nodes(original),
        title="متن مصوبه اصلی",
        subtitle="مصوبه شماره ۳ جلسه شماره ۳۲۹",
    ))
    wrapper.append(make_section(
        clean_ocr_nodes(cabinet_one),
        title="تصویب‌نامه هیئت وزیران",
        subtitle="شماره ۱۷۲۴۶۵ / ت ۵۹۶۴۳هـ",
    ))
    wrapper.append(make_section(
        clean_ocr_nodes(cabinet_two),
        title="اصلاح تصویب‌نامه هیئت وزیران",
        subtitle="شماره ۲۱۲۸۶ / ت ۵۹۸۰۹هـ",
    ))

    consolidated_section = make_section(
        [],
        title="متن تنقیحی غیررسمی رقابت‌نامه",
        subtitle="با اعمال اصلاحات مصوبات جلسات ۳۳۶، ۳۶۱ و ۳۶۳",
        class_name="cra-source-text cra-ocr-text cra-consolidated-text",
    )
    heading = etree.SubElement(consolidated_section, "h3")
    heading.text = "متن تنقیحی مصوبه شماره ۳ جلسه شماره ۳۲۹ مورخ ۱۴۰۰/۱۰/۲۶"
    note = etree.SubElement(consolidated_section, "p", {"class": "cra-editorial-note"})
    note.text = (
        "این متن برای سهولت مطالعه با اعمال اصلاحات یادشده تهیه شده است. "
        "برای استناد، متن مصوبه اصلی و مصوبات اصلاحی ملاک است."
    )
    for node in cleaned_consolidated:
        consolidated_section.append(copy.deepcopy(node))
    wrapper.append(consolidated_section)
    return serialize_children(wrapper)


def reading_meta(fragment: str) -> dict[str, int]:
    wrapper = parse_fragment(fragment)
    plain_text = html_module.unescape(element_text(wrapper))
    return {
        "wordCount": len(re.findall(r"[A-Za-z0-9آ-ی]+", plain_text)),
        "tableCount": len(wrapper.xpath(".//table")),
        "imageCount": len(wrapper.xpath(".//img")),
        "attachmentSectionCount": len(wrapper.xpath("./section")),
    }


def text_references(fragment: str, record: dict, records_by_pair: dict[tuple[str, str], list[dict]]) -> list[dict]:
    source = f'{record["title"]} {element_text(parse_fragment(fragment))}'.translate(DIGIT_TRANSLATION)
    source = source.replace("\u200c", " ")
    own_pair = (
        record["sessionNumber"].translate(DIGIT_TRANSLATION),
        record["resolutionNumber"].translate(DIGIT_TRANSLATION),
    )
    seen: set[str] = set()
    references: list[dict] = []
    for match in TEXT_REFERENCE_RE.finditer(source):
        pair = (match.group(2), match.group(1))
        targets = records_by_pair.get(pair)
        if not targets or pair == own_pair:
            continue
        target = targets[0]
        if target["guid"] in seen:
            continue
        seen.add(target["guid"])
        references.append({
            "targetGuid": target["guid"],
            "title": target["title"],
            "evidence": normalized_text(match.group(0)),
        })
    return references


def build_override(route: str, base_html: str, nodes: list[etree._Element]) -> str:
    if route in FULL_OCR_ROUTES:
        return full_ocr_override(nodes)
    if route in DUPLICATE_SCAN_ROUTES:
        return duplicate_scan_override(base_html)
    if route in APPEND_OCR_ROUTES:
        return append_ocr_override(base_html, nodes)
    if route in MATH_REPLACEMENT_ROUTES:
        return math_replacement_override(base_html, nodes, route)
    if route == SPECIAL_CONSOLIDATED_ROUTE:
        return consolidated_override(nodes)
    raise ValueError(f"No OCR strategy was declared for {route}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("docx", type=Path, help="Owner-reviewed OCR DOCX")
    parser.add_argument("repository", type=Path, help="Reghabatnameh repository root")
    args = parser.parse_args()

    docx = args.docx.resolve()
    repository = args.repository.resolve()
    output_dir = repository / "content" / "cra" / "ocr-overrides"
    index_path = repository / "content" / "cra" / "index.json"
    records = json.loads(index_path.read_text(encoding="utf-8"))
    records_by_route = {record["route"]: record for record in records}

    with tempfile.TemporaryDirectory(prefix="cra-ocr-") as temp_name:
        pandoc_html = Path(temp_name) / "ocr.html"
        subprocess.run([
            "pandoc",
            str(docx),
            "--to=html5",
            "--mathml",
            "--wrap=none",
            "--output",
            str(pandoc_html),
        ], check=True)
        segments = route_segments(pandoc_html.read_text(encoding="utf-8"))

    found_routes = set(segments)
    if found_routes != EXPECTED_ROUTES:
        missing = sorted(EXPECTED_ROUTES - found_routes)
        extra = sorted(found_routes - EXPECTED_ROUTES)
        raise ValueError(f"OCR route mismatch. Missing: {missing}. Extra: {extra}.")

    records_by_pair: dict[tuple[str, str], list[dict]] = {}
    for record in records:
        pair = (
            record["sessionNumber"].translate(DIGIT_TRANSLATION),
            record["resolutionNumber"].translate(DIGIT_TRANSLATION),
        )
        if all(pair):
            records_by_pair.setdefault(pair, []).append(record)
    for matches in records_by_pair.values():
        matches.sort(key=lambda item: int(item.get("version") or "0"), reverse=True)

    output_dir.mkdir(parents=True, exist_ok=True)
    manifest_items: dict[str, dict] = {}
    for route in sorted(EXPECTED_ROUTES):
        record = records_by_route.get(route)
        if not record:
            raise ValueError(f"Target route is missing from CRA index: {route}")
        base_path = repository / "content" / record["contentFile"]
        base_html = base_path.read_text(encoding="utf-8")
        override = build_override(route, base_html, segments[route])
        if "<img" in override.lower():
            raise ValueError(f"Image remained in OCR override: {route}")
        if "این رو خود چت چی پی تی" in override or "عکس ها همون متن" in override:
            raise ValueError(f"Editorial note leaked into OCR override: {route}")
        if "~~" in override:
            raise ValueError(f"Revision marker remained in OCR override: {route}")

        override_path = output_dir / f'{record["guid"]}.html'
        override_path.write_text(override, encoding="utf-8")
        manifest_items[record["guid"]] = {
            "route": route,
            "contentFile": f'cra/ocr-overrides/{record["guid"]}.html',
            "readingMeta": reading_meta(override),
            "textReferences": text_references(override, record, records_by_pair),
            "hasEditorialConsolidation": route == SPECIAL_CONSOLIDATED_ROUTE,
        }

    manifest = {
        "source": docx.name,
        "sourceSha256": hashlib.sha256(docx.read_bytes()).hexdigest(),
        "items": manifest_items,
    }
    (output_dir / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {len(manifest_items)} OCR overrides to {output_dir}")


if __name__ == "__main__":
    main()
