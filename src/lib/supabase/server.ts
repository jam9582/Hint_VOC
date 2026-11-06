import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { connection } from "next/server";
import type { Database } from "@/types/database";
import { requireSupabaseEnv } from "./env";

/** 서버 코드(서버 컴포넌트, 서버 액션, API 라우트)에서 쓰는 Supabase 연결. */
export async function createClient() {
  // Supabase가 로그인 만료 시각을 계산하므로 미리 그리지 않고 요청 때 실행한다.
  await connection();
  const { url, publishableKey } = requireSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // 서버 컴포넌트에서는 쿠키를 쓸 수 없다. 로그인 유지는 Step 2의 proxy가 맡는다.
        }
      },
    },
  });
}
