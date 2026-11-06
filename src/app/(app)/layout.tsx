import Link from "next/link";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { UserMenu } from "./user-menu";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-300 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/" className="font-semibold">
            VOC 통합 관리 (8D)
          </Link>
          <nav className="flex gap-3 text-sm">
            <Link href="/register" className="underline">
              등록
            </Link>
            <Link href="/status" className="underline">
              현황
            </Link>
          </nav>
        </div>
        <Suspense>
          <UserMenu />
        </Suspense>
      </header>
      {children}
    </>
  );
}
