"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteNavigation({
  items,
  className,
  label,
}: {
  items: ReadonlyArray<readonly [string, string]>;
  className?: string;
  label: string;
}) {
  const pathname = usePathname();

  return (
    <nav className={className} aria-label={label}>
      {items.map(([itemLabel, href]) => {
        const current = href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link className={current ? "active" : undefined} aria-current={current ? "page" : undefined} href={href} key={href}>
            {itemLabel}
          </Link>
        );
      })}
    </nav>
  );
}
