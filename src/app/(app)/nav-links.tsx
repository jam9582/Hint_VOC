"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { RAIL_ITEM } from "./rail-item";

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
