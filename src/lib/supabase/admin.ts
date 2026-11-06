import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { requireSupabaseEnv } from "./env";

/**
 * 비밀 키로 만든 연결. 권한 정책을 통과하므로 쓰기 전에 반드시
 * requireUser 또는 requireAdmin으로 확인한다. (PRD 15장 결정 11)
 */
export function createAdminClient() {
  const { url } = requireSupabaseEnv();
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!secretKey) {
    throw new Error(".env.local에 SUPABASE_SECRET_KEY를 넣어 주세요.");
  }
  return createClient<Database>(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
