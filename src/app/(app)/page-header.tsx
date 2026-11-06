import type { ReactNode } from "react";

/** 화면 맨 위 제목 줄. */
export function PageHeader({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <header className="mb-[18px] flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-base font-semibold">{title}</h1>
      {children}
    </header>
  );
}
