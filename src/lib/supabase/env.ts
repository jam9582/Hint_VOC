/** Supabase 연결 값. .env.local이 비어 있으면 null을 돌려준다. */
export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) return null;
  return { url, publishableKey };
}

export function requireSupabaseEnv() {
  const env = getSupabaseEnv();
  if (!env) {
    throw new Error(
      ".env.local에 NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY를 넣어 주세요.",
    );
  }
  return env;
}
