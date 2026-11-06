"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { RAIL_ITEM } from "./rail-item";

export function RailLink({
  href,
  label,
  alsoActiveOn,
  owner,
  notOwner,
  children,
}: {
  href: string;
  label: string;
  /** 메뉴에 없는 하위 화면에서도 이 메뉴를 켠다. */
  alsoActiveOn?: string;
  /** 이 담당으로 거른 화면에서만 켠다. */
  owner?: string;
  /** 이 담당으로 거른 화면에서는 끈다. */
  notOwner?: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const currentOwner = useSearchParams().get("owner");
  const onPath = [href.split("?")[0], alsoActiveOn].some(
    (path) => path && (pathname === path || pathname.startsWith(`${path}/`)),
  );
  const active =
    onPath &&
    (owner === undefined || currentOwner === owner) &&
    (notOwner === undefined || currentOwner !== notOwner);

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
