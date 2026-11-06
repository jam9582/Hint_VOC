import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { CodeRow, ProfileRow } from "@/types/database";

/** 꺼진 코드까지 모두 읽는다. */
export async function listAllCodes(): Promise<CodeRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("code")
    .select("code_group, code, label, sort, active")
    .order("code_group")
    .order("sort");
  if (error) throw new Error(error.message);
  return data;
}

export type NewCode = Required<Pick<CodeRow, "code_group" | "code">> & {
  label: string;
  sort: number;
};

/** 코드를 추가한다. 같은 코드가 이미 있으면 false를 돌려준다. */
export async function addCode(code: NewCode): Promise<boolean> {
  const { error } = await createAdminClient()
    .from("code")
    .insert({ ...code, active: true });
  if (error?.code === "23505") return false;
  if (error) throw new Error(error.message);
  return true;
}

export async function updateCode(
  group: string,
  code: string,
  values: Pick<CodeRow, "label" | "sort" | "active">,
) {
  const { error } = await createAdminClient()
    .from("code")
    .update(values)
    .eq("code_group", group)
    .eq("code", code);
  if (error) throw new Error(error.message);
}

export type Account = Pick<ProfileRow, "id" | "name" | "role"> & {
  email: string | null;
};

/** 계정 목록. 메일 주소는 Supabase Auth에 있어 비밀 키로 읽는다. */
export async function listAccounts(): Promise<Account[]> {
  const admin = createAdminClient();
  const [profiles, users] = await Promise.all([
    admin.from("profiles").select("id, name, role").order("created_at"),
    admin.auth.admin.listUsers({ perPage: 1000 }),
  ]);
  if (profiles.error) throw new Error(profiles.error.message);
  if (users.error) throw new Error(users.error.message);

  const emails = new Map(users.data.users.map((user) => [user.id, user.email]));
  return profiles.data.map((profile) => ({
    ...profile,
    email: emails.get(profile.id) ?? null,
  }));
}

export async function updateAccountRole(id: string, role: ProfileRow["role"]) {
  const { error } = await createAdminClient()
    .from("profiles")
    .update({ role })
    .eq("id", id);
  if (error) throw new Error(error.message);
}
