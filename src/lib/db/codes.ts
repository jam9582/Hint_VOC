import { createClient } from "@/lib/supabase/server";
import type { CodeGroup, CodeOptions } from "@/types/codes";
import type { CodeRow } from "@/types/database";

/** 사용 중인 코드 전체를 묶음별, 표시 순서대로 읽는다. (PRD 7-6) */
export async function listActiveCodes(): Promise<CodeRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("code")
    .select("code_group, code, label, sort, active")
    .eq("active", true)
    .order("code_group")
    .order("sort");

  if (error) throw new Error(error.message);
  return data;
}

/** 코드 목록을 화면 선택 항목 형태로 묶는다. */
export function toCodeOptions(codes: CodeRow[]): CodeOptions {
  const options: CodeOptions = {};
  for (const { code_group, code, label } of codes) {
    const group = code_group as CodeGroup;
    (options[group] ??= []).push({ value: code, label: label ?? code });
  }
  return options;
}
