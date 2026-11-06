import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { requireSupabaseEnv } from "./env";

/** 브라우저(클라이언트 컴포넌트)에서 쓰는 Supabase 연결. */
export function createClient() {
  const { url, publishableKey } = requireSupabaseEnv();
  return createBrowserClient<Database>(url, publishableKey);
}
