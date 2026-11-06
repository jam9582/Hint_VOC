import type { ReactNode } from "react";
import { Suspense } from "react";
import { AppRail } from "./app-rail";
import { SidePanel } from "./side-panel";
import { UserMenu } from "./user-menu";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh w-full lg:grid lg:grid-cols-[72px_210px_minmax(0,1fr)]">
      <AppRail>
        <Suspense>
          <UserMenu />
        </Suspense>
      </AppRail>
      <Suspense
        fallback={
          <div className="hidden border-r border-line bg-card lg:block" />
        }
      >
        <SidePanel />
      </Suspense>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
