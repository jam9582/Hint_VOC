import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // 예약 실행 주소는 로그인 대신 비밀 값으로 확인한다.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/alerts).*)"],
};
