"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function ScrollablePartsNav({ children }: { children: ReactNode }) {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const nav = navRef.current;
    const list = nav?.querySelector("ol");
    const activeItem = list?.querySelector<HTMLElement>('[aria-current="page"]')?.closest<HTMLElement>("li");
    if (!list || !activeItem || list.scrollHeight <= list.clientHeight) return;

    const target = activeItem.offsetTop - (list.clientHeight - activeItem.offsetHeight) / 2;
    list.scrollTop = Math.max(0, target);
  }, []);

  return <aside className="parts-nav" ref={navRef}>{children}</aside>;
}
