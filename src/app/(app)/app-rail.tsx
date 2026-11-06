import Link from "next/link";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { RailLink } from "./nav-links";

const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  className: "size-6",
  "aria-hidden": true,
} as const;

export const RAIL_ICONS = {
  status: (
    <svg {...iconProps}>
      <path d="M3 12h4l3-7 4 14 3-7h4" />
    </svg>
  ),
  register: (
    <svg {...iconProps}>
      <path d="M12 4v16M4 12h16" />
    </svg>
  ),
  detail: (
    <svg {...iconProps}>
      <path d="M5 4h10l4 4v12H5z" />
      <path d="M9 12h6M9 16h6" />
    </svg>
  ),
  admin: (
    <svg {...iconProps}>
      <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  logout: (
    <svg {...iconProps}>
      <path d="M10 4H5v16h5M15 8l4 4-4 4M19 12H9" />
    </svg>
  ),
};

/** 왼쪽 메뉴. 폭이 좁으면 맨 위 가로 줄이 된다. */
export function AppRail({ children }: { children: ReactNode }) {
  return (
    <aside className="sticky top-0 z-20 flex items-center gap-2 overflow-x-auto bg-card px-3 py-1.5 shadow-card lg:h-dvh lg:flex-col lg:items-stretch lg:gap-5 lg:overflow-visible lg:px-3 lg:py-5 print:hidden">
      <Link
        href="/"
        aria-label="VOC 통합 관리 첫 화면"
        className="grid size-[34px] shrink-0 place-items-center rounded-[9px] bg-primary text-[13px] font-bold text-white lg:ml-2 lg:self-start"
      >
        8D
      </Link>
      <nav
        aria-label="주 메뉴"
        className="flex items-center gap-1 lg:flex-col lg:items-stretch lg:gap-3"
      >
        <Suspense>
          <RailLink href="/status" label="현황">
            {RAIL_ICONS.status}
          </RailLink>
          <RailLink href="/register" label="등록">
            {RAIL_ICONS.register}
          </RailLink>
          <RailLink href="/vocs" label="상세">
            {RAIL_ICONS.detail}
          </RailLink>
        </Suspense>
      </nav>
      <div className="flex-1" />
      {children}
    </aside>
  );
}
