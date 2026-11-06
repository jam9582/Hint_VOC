"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { RAIL_ITEM } from "./rail-item";

export function RailLink({
  href,
  label,
  alsoActiveOn,
  children,
}: {
  href: string;
  label: string;
  /** 메뉴에 없는 하위 화면에서도 이 메뉴를 켠다. */
  alsoActiveOn?: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const active = [href, alsoActiveOn].some(
    (path) => path && (pathname === path || pathname.startsWith(`${path}/`)),
  );

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`${RAIL_ITEM} ${
        active
          ? "bg-primary-bg text-primary"
          : "text-ink-3 hover:bg-inset hover:text-ink-2"
      }`}
    >
      {children}
      {label}
    </Link>
  );
}
