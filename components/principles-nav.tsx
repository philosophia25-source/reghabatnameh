"use client";

import { useEffect, useRef, useState } from "react";
import { toFaDigits } from "@/app/text";

type NavSection = { id: string; title: string };

export function PrinciplesNav({ sections }: { sections: NavSection[] }) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const threshold = Math.min(190, window.innerHeight * 0.28);
      let current = sections[0]?.id ?? "";
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element && element.getBoundingClientRect().top <= threshold) current = section.id;
      }
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 12) {
        current = sections.at(-1)?.id ?? current;
      }
      setActiveId(current);
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("hashchange", schedule);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("hashchange", schedule);
    };
  }, [sections]);

  useEffect(() => {
    const list = listRef.current;
    const active = list?.querySelector<HTMLElement>(`[data-section-id="${activeId}"]`);
    if (!list || !active || list.scrollHeight <= list.clientHeight) return;
    const target = active.offsetTop - (list.clientHeight - active.offsetHeight) / 2;
    list.scrollTop = Math.max(0, target);
  }, [activeId]);

  return (
    <aside className="parts-nav principles-nav" aria-label="فهرست اصول این صفحه">
      <p>در این صفحه</p>
      <ol ref={listRef}>
        {sections.map((section, index) => (
          <li className={activeId === section.id ? "active" : ""} data-section-id={section.id} key={section.id}>
            <a
              className="parts-nav-link"
              href={`#${section.id}`}
              aria-current={activeId === section.id ? "location" : undefined}
              onClick={() => setActiveId(section.id)}
            >
              <span>{index === 0 ? "م" : toFaDigits(index)}</span>
              <div>
                <small>{index === 0 ? "آغاز بحث" : `اصل ${toFaDigits(index)}`}</small>
                <strong>{section.title.replace(/^[۰-۹0-9]+\.\s*/, "")}</strong>
              </div>
            </a>
          </li>
        ))}
      </ol>
    </aside>
  );
}
