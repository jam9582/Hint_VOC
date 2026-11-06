"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
