import type { ReactNode } from "react";
import { Suspense } from "react";
import { AppRail } from "./app-rail";
import { Toaster } from "./toast";
import { UserMenu } from "./user-menu";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh w-full lg:grid lg:grid-cols-[136px_minmax(0,1fr)] print:block">
      <AppRail>
        <Suspense>
          <UserMenu />
        </Suspense>
      </AppRail>
      <div className="min-w-0">{children}</div>
      <Toaster />
    </div>
  );
}
