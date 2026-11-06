import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { ProfileRow } from "@/types/database";

export type CurrentUser = Pick<ProfileRow, "id" | "name" | "role">;

/** 지금 로그인한 사람. 로그인하지 않았거나 profiles 줄이 없으면 null이다. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  const id = auth?.claims.sub;
  if (!id) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, role")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
});

/** 로그인이 필요한 화면과 서버 코드에서 부른다. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** 관리자만 쓰는 화면과 서버 코드에서 부른다. 일반 계정은 첫 화면으로 보낸다. */
export async function requireAdmin(): Promise<CurrentUser> {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/");
  return user;
}
