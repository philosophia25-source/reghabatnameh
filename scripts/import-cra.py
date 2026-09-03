#!/usr/bin/env python3
"""Convert a downloaded CRA document tree into Reghabatnameh content files.

The crawler output remains the source of truth. This importer copies no office
binary into the repository. It extracts page metadata and CRA-declared links,
then converts the downloaded Word and PDF attachments to static HTML.
"""

from __future__ import annotations

import argparse
import hashlib
import html as html_module
import json
import re
import shutil
import subprocess
import tempfile
from collections import Counter
from pathlib import Path
from urllib.parse import unquote

from lxml import etree, html


DETAIL_RE = re.compile(r"/Details(?:%2F|/)([0-9a-f-]{36})", re.IGNORECASE)
YEAR_RE = re.compile(r"(?<!\d)(13\d{2}|14\d{2})(?!\d)")
SPACE_RE = re.compile(r"\s+")
ATTACHMENT_SUFFIXES = {".doc", ".docx", ".pdf"}
DIGIT_TRANSLATION = str.maketrans("۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩", "01234567890123456789")
TEXT_REFERENCE_RE = re.compile(
    r"مصوبه\s*(?:شماره)?\s*[\(\[]?\s*(\d{1,3})\s*[\)\]]?"
    r"\s*(?:مورخ.{0,80}?)?\s*جلسه\s*(?:شماره)?\s*[\(\[]?\s*(\d{1,4})",
    re.IGNORECASE,
)
RELATION_PANELS = {
    "collapseDocumentLink": "related",
    "collapseDocumentLink3": "affects",
    "collapseDocumentLink4": "influencedBy",
    "collapseVersion": "versions",
}


def normalized_text(value: str | None) -> str:
    return SPACE_RE.sub(" ", value or "").strip()


def element_text(element: etree._Element | None) -> str:
    if element is None:
        return ""
    return normalized_text(" ".join(element.itertext()))


def current_guid(raw: str, tree: etree._Element) -> str:
    for href in tree.xpath("//a[@id='loginLink']/@href"):
        match = DETAIL_RE.search(unquote(href))
        if match:
            return match.group(1).lower()
    match = re.search(r"returnUrl=.*?Details%2F([0-9a-f-]{36})", raw, re.IGNORECASE)
    if not match:
        raise ValueError("شناسه کامل صفحه پیدا نشد")
    return match.group(1).lower()


def read_facts(tree: etree._Element) -> dict[str, str]:
    facts: dict[str, str] = {}
    for term in tree.xpath("//dl[contains(@class,'dl-horizontal')]/dt"):
        key = element_text(term)
        sibling = term.getnext()
        while sibling is not None and sibling.tag not in {"dd", "dt"}:
            sibling = sibling.getnext()
        if key and sibling is not None and sibling.tag == "dd":
            facts[key] = element_text(sibling)
    return facts


def relation_title(anchor: etree._Element) -> str:
    candidates = anchor.xpath(".//div[contains(@class,'col-xs-12')]/div[not(contains(@class,'row'))]")
    if candidates:
        node = candidates[0]
        for hidden in node.xpath(".//*[contains(concat(' ',normalize-space(@class),' '),' hidden ')]"):
            hidden.drop_tree()
        return element_text(node)
    text = element_text(anchor)
    labels = ("مصوبه مرتبط", "نسخه مرتبط", "سند مرتبط")
    for label in labels:
        text = text.replace(label, "")
    return normalized_text(text)


def read_relations(tree: etree._Element) -> dict[str, list[dict[str, str]]]:
    result = {name: [] for name in RELATION_PANELS.values()}
    for panel_id, relation_name in RELATION_PANELS.items():
        panels = tree.xpath(f"//*[@id='{panel_id}']")
        if not panels:
            continue
        for anchor in panels[0].xpath(".//a[contains(@href,'/Details/')]"):
            href = anchor.get("href", "")
            match = DETAIL_RE.search(unquote(href))
            if not match:
                continue
            result[relation_name].append({
                "targetGuid": match.group(1).lower(),
                "title": relation_title(anchor),
            })
    return result


def read_attachments(tree: etree._Element) -> list[dict[str, str]]:
    panels = tree.xpath("//*[@id='collapseFile']")
    if not panels:
        return []
    attachments: list[dict[str, str]] = []
    seen: set[str] = set()
    for anchor in panels[0].xpath(".//a[contains(@class,'file-item') and contains(@href,'/fa/File')]"):
        href = anchor.get("href", "")
        if href in seen:
            continue
        seen.add(href)
        icon_class = " ".join(anchor.xpath(".//i/@class"))
        if "file-word" in icon_class:
            file_format = "Word"
        elif "file-pdf" in icon_class:
            file_format = "PDF"
        else:
            file_format = "فایل"
        headings = anchor.xpath(".//h5")
        attachments.append({
            "name": element_text(headings[0]) if headings else "پیوست مصوبه",
            "format": file_format,
            "url": f"https://asnad.cra.gov.ir{href}",
        })
    return attachments


def parse_page(page_path: Path) -> dict:
    raw = page_path.read_text(encoding="utf-8-sig", errors="replace")
    tree = html.fromstring(raw)
    guid = current_guid(raw, tree)
    facts = read_facts(tree)
    title_nodes = tree.xpath("//title")
    title = element_text(title_nodes[0]) if title_nodes else page_path.parent.name.rsplit(" [", 1)[0]
    version_nodes = tree.xpath("//h4[contains(@style,'position')]/span[contains(@class,'label')]")
    version_text = element_text(version_nodes[0]) if version_nodes else ""
    version_match = re.search(r"(\d+)", version_text)
    keywords = []
    for item in tree.xpath("//ul[contains(@class,'tags')]/li"):
        value = element_text(item)
        if value and value not in keywords:
            keywords.append(value)
    approval_date = facts.get("تاریخ تصویب", "")
    code = facts.get("کد", "")
    year_match = YEAR_RE.search(approval_date) or YEAR_RE.search(code)
    return {
        "id": f"resolution:cra:{guid}",
        "guid": guid,
        "title": title,
        "code": code,
        "documentType": facts.get("نوع سند", "مصوبه"),
        "category": facts.get("نام پوشه", page_path.parent.parent.name),
        "sessionNumber": facts.get("شماره جلسه", ""),
        "resolutionNumber": facts.get("شماره مصوبه", ""),
        "approvalDate": approval_date,
        "year": year_match.group(1) if year_match else "undated",
        "version": version_match.group(1) if version_match else "1",
        "keywords": keywords,
        "sourceUrl": f"https://asnad.cra.gov.ir/fa/Public/Documents/Details/{guid}",
        "attachments": read_attachments(tree),
        "relations": read_relations(tree),
        "sourceDirectory": str(page_path.parent),
    }


def assign_routes(records: list[dict]) -> None:
    grouped: dict[tuple[str, str, str], list[dict]] = {}
    for record in records:
        key = (record["year"], record["sessionNumber"], record["resolutionNumber"])
        grouped.setdefault(key, []).append(record)

    used: set[str] = set()
    for record in records:
        year = record["year"]
        session = record["sessionNumber"] or "session"
        number = record["resolutionNumber"] or record["guid"][:8]
        base_slug = f"{session}-{number}"
        peers = grouped[(year, record["sessionNumber"], record["resolutionNumber"])]
        if len(peers) > 1:
            base_slug += f"-v{record['version']}"
        slug = base_slug
        if slug in used:
            slug += f"-{record['guid'][:8]}"
        used.add(slug)
        record["slug"] = slug.lower()
        record["route"] = f"/resolutions/communications-regulatory-commission/{year}/{record['slug']}"
        record["contentFile"] = f"cra/documents/{record['guid']}.html"


def output_from_command(command: list[str], cwd: Path | None = None) -> str:
    completed = subprocess.run(
        command,
        cwd=cwd,
        check=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    return completed.stdout


def convert_legacy_doc(source: Path, temp_dir: Path) -> Path:
    output_from_command([
        "soffice",
        "--headless",
        "--convert-to",
        "docx",
        "--outdir",
        str(temp_dir),
        str(source),
    ])
    converted = temp_dir / f"{source.stem}.docx"
    if not converted.exists():
        matches = list(temp_dir.glob("*.docx"))
        if not matches:
            raise RuntimeError("LibreOffice فایل DOC را تبدیل نکرد")
        converted = matches[0]
    return converted


def sanitize_fragment(raw_fragment: str, guid: str, attachment_index: int, temp_dir: Path, media_dir: Path) -> str:
    wrapper = html.fragment_fromstring(raw_fragment or "<p></p>", create_parent="div")
    prefix = f"cra-{guid[:8]}-{attachment_index}-"
    for node in wrapper.xpath(".//*[@id]"):
        node.set("id", prefix + node.get("id", ""))
    for node in wrapper.xpath(".//*[@href]"):
        href = node.get("href", "")
        if href.startswith("#"):
            node.set("href", "#" + prefix + href[1:])
    for level in range(5, 0, -1):
        for node in wrapper.xpath(f".//h{level}"):
            node.tag = f"h{min(level + 1, 5)}"
    for image_index, image in enumerate(wrapper.xpath(".//img"), start=1):
        raw_src = image.get("src", "")
        source_image = temp_dir / raw_src
        if not source_image.exists():
            image.drop_tree()
            continue
        extension = source_image.suffix.lower()
        destination_name = f"{attachment_index}-{image_index}{extension}"
        destination = media_dir / destination_name
        media_dir.mkdir(parents=True, exist_ok=True)
        if extension in {".wmf", ".emf"}:
            destination_name = f"{attachment_index}-{image_index}.png"
            destination = media_dir / destination_name
            subprocess.run([
                "inkscape",
                str(source_image),
                "--export-type=png",
                f"--export-filename={destination}",
            ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        else:
            shutil.copy2(source_image, destination)
        image.set("src", f"/cra-media/{guid}/{destination_name}")
        image.set("loading", "lazy")
    for node in wrapper.xpath(".//script|.//style"):
        node.drop_tree()
    return "".join(html.tostring(child, encoding="unicode", method="html") for child in wrapper)


def convert_word(source: Path, guid: str, attachment_index: int, media_dir: Path) -> str:
    with tempfile.TemporaryDirectory(prefix="cra-import-") as temp_name:
        temp_dir = Path(temp_name)
        word_source = convert_legacy_doc(source, temp_dir) if source.suffix.lower() == ".doc" else source
        raw = output_from_command([
            "pandoc",
            str(word_source),
            "--to=html",
            "--wrap=none",
            "--extract-media=assets",
        ], cwd=temp_dir)
        return sanitize_fragment(raw, guid, attachment_index, temp_dir, media_dir)


def convert_pdf(source: Path, guid: str, attachment_index: int, media_dir: Path) -> str:
    raw = output_from_command(["pdftotext", "-layout", str(source), "-"])
    blocks = [block.strip() for block in re.split(r"\n\s*\n", raw) if block.strip()]
    if blocks:
        return "".join(
            f"<p>{html_module.escape(block).replace(chr(10), '<br>')}</p>"
            for block in blocks
        )
    with tempfile.TemporaryDirectory(prefix="cra-pdf-") as temp_name:
        temp_dir = Path(temp_name)
        subprocess.run([
            "pdftoppm",
            "-jpeg",
            "-r",
            "144",
            "-jpegopt",
            "quality=86,optimize=y",
            str(source),
            str(temp_dir / "page"),
        ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        images = sorted(temp_dir.glob("page-*.jpg"))
        media_dir.mkdir(parents=True, exist_ok=True)
        rendered = []
        for page_number, image in enumerate(images, start=1):
            destination_name = f"{attachment_index}-pdf-{page_number}.jpg"
            shutil.copy2(image, media_dir / destination_name)
            rendered.append(
                f'<figure class="cra-scanned-page"><img src="/cra-media/{guid}/{destination_name}" '
                f'alt="صفحه {page_number} پیوست اسکن‌شده" loading="lazy"></figure>'
            )
        return "".join(rendered)


def convert_record(record: dict, content_root: Path, public_root: Path) -> tuple[int, list[str]]:
    source_dir = Path(record.pop("sourceDirectory"))
    sources = sorted(
        (path for path in source_dir.iterdir() if path.is_file() and path.suffix.lower() in ATTACHMENT_SUFFIXES),
        key=lambda path: (path.suffix.lower() == ".pdf", path.name.casefold()),
    )
    unique_sources: list[Path] = []
    seen_hashes: set[str] = set()
    for source in sources:
        digest = hashlib.sha256(source.read_bytes()).hexdigest()
        if digest not in seen_hashes:
            seen_hashes.add(digest)
            unique_sources.append(source)

    sections: list[str] = []
    failures: list[str] = []
    media_dir = public_root / "cra-media" / record["guid"]
    for index, source in enumerate(unique_sources, start=1):
        try:
            converted = convert_pdf(source, record["guid"], index, media_dir) if source.suffix.lower() == ".pdf" else convert_word(source, record["guid"], index, media_dir)
            has_text = bool(normalized_text(re.sub(r"<[^>]+>", " ", converted)))
            has_image = "<img" in converted
            if not has_text and not has_image:
                failures.append(f"{source.name}: متن قابل استخراج نبود")
                continue
            label = html_module.escape(source.name)
            sections.append(
                f'<section class="cra-source-text" data-format="{source.suffix.lower().lstrip(".")}">'
                f'<div class="cra-source-label">متن پیوست <span>{label}</span></div>{converted}</section>'
            )
        except Exception as exc:  # keep the other 557 pages buildable and report the exact file
            failures.append(f"{source.name}: {exc}")

    content_path = content_root / record["contentFile"]
    content_path.parent.mkdir(parents=True, exist_ok=True)
    content_path.write_text("\n".join(sections), encoding="utf-8")
    record["localAttachmentCount"] = len(unique_sources)
    record["contentAvailable"] = bool(sections)
    combined = "\n".join(sections)
    plain_text = html_module.unescape(re.sub(r"<[^>]+>", " ", combined))
    record["readingMeta"] = {
        "wordCount": len(re.findall(r"[A-Za-z0-9آ-ی]+", plain_text)),
        "tableCount": len(re.findall(r"<table\b", combined, re.IGNORECASE)),
        "imageCount": len(re.findall(r"<img\b", combined, re.IGNORECASE)),
        "attachmentSectionCount": len(sections),
    }
    return len(sections), failures


def add_text_references(records: list[dict], content_root: Path) -> None:
    """Find exact resolution/session citations without inferring their legal effect."""
    records_by_pair: dict[tuple[str, str], list[dict]] = {}
    for record in records:
        session = record["sessionNumber"].translate(DIGIT_TRANSLATION)
        number = record["resolutionNumber"].translate(DIGIT_TRANSLATION)
        if session and number:
            records_by_pair.setdefault((session, number), []).append(record)

    for matches in records_by_pair.values():
        matches.sort(key=lambda item: int(item.get("version") or "0"), reverse=True)

    for record in records:
        content_path = content_root / record["contentFile"]
        fragment = content_path.read_text(encoding="utf-8", errors="replace")
        source = f'{record["title"]} {fragment}'.translate(DIGIT_TRANSLATION)
        source = html_module.unescape(re.sub(r"<[^>]+>", " ", source)).replace("\u200c", " ")
        own_pair = (
            record["sessionNumber"].translate(DIGIT_TRANSLATION),
            record["resolutionNumber"].translate(DIGIT_TRANSLATION),
        )
        seen: set[str] = set()
        references: list[dict[str, str]] = []
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
        record["textReferences"] = references


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path, help="CRA-Documents directory produced by the downloader")
    parser.add_argument("repository", type=Path, help="Reghabatnameh repository root")
    args = parser.parse_args()
    source_root = args.source.resolve()
    repository = args.repository.resolve()
    content_root = repository / "content"
    public_root = repository / "public"

    pages = sorted(source_root.rglob("صفحه سند.htm"))
    records = [parse_page(page) for page in pages]
    assign_routes(records)
    guid_set = {record["guid"] for record in records}
    failures: dict[str, list[str]] = {}
    converted_sections = 0
    for position, record in enumerate(records, start=1):
        count, record_failures = convert_record(record, content_root, public_root)
        converted_sections += count
        if record_failures:
            failures[record["guid"]] = record_failures
        if position % 50 == 0:
            print(f"converted {position}/{len(records)}")

    add_text_references(records, content_root)

    records.sort(key=lambda item: (item["approvalDate"], item["code"], item["guid"]), reverse=True)
    index_path = content_root / "cra" / "index.json"
    index_path.parent.mkdir(parents=True, exist_ok=True)
    index_path.write_text(json.dumps(records, ensure_ascii=False, indent=2), encoding="utf-8")

    missing_targets = Counter()
    relation_counts = Counter()
    for record in records:
        for relation_name, targets in record["relations"].items():
            relation_counts[relation_name] += len(targets)
            for target in targets:
                if target["targetGuid"] not in guid_set:
                    missing_targets[relation_name] += 1
    report = {
        "documents": len(records),
        "convertedAttachmentSections": converted_sections,
        "contentPages": sum(record["contentAvailable"] for record in records),
        "categories": Counter(record["category"] for record in records),
        "relationCounts": relation_counts,
        "textReferences": sum(len(record["textReferences"]) for record in records),
        "supplementalTextReferences": sum(
            1
            for record in records
            for target in record["textReferences"]
            if not any(
                target["targetGuid"] == official_target["targetGuid"]
                for targets in record["relations"].values()
                for official_target in targets
            )
        ),
        "missingRelationTargets": missing_targets,
        "conversionFailures": failures,
    }
    report_path = content_root / "cra" / "import-report.json"
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
