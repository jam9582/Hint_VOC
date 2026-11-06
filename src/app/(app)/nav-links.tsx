"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

export function RailLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      aria-current={active ? "page" : undefined}
      className={`grid size-10 place-items-center rounded-lg transition-colors ${
        active
          ? "bg-primary-bg text-primary"
          : "text-ink-3 hover:bg-inset hover:text-ink-2"
      }`}
    >
      {children}
    </Link>
  );
}

/** 주소와 거르기 조건이 모두 같을 때만 선택된 메뉴로 본다. */
function isActive(href: string, pathname: string, search: string) {
  const [path, query = ""] = href.split("#")[0].split("?");
  if (href.includes("#") || path !== pathname) return false;
  const sorted = (value: string) =>
    [...new URLSearchParams(value).entries()].sort().join("&");
  return sorted(query) === sorted(search);
}

export function PanelLink({
  href,
  label,
  count,
}: {
  href: string;
  label: string;
  count?: number;
}) {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const active = isActive(href, pathname, search);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex shrink-0 items-center justify-between gap-3 rounded-md px-3 py-2 text-[13px] font-medium whitespace-nowrap transition-colors ${
        active
          ? "bg-primary-bg text-primary"
          : "text-ink-2 hover:bg-inset hover:text-ink"
      }`}
    >
      {label}
      {count !== undefined && <small className="text-xs text-ink-3">{count}</small>}
    </Link>
  );
}
