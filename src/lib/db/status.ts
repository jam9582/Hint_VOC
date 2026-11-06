import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { VocListRow } from "@/types/database";

export const STATUS_LIMIT = 500;

export const STATUS_FILTER_KEYS = [
  "stage",
  "grade",
  "voc_type",
  "system",
  "model",
  "owner",
] as const;
export type StatusFilterKey = (typeof STATUS_FILTER_KEYS)[number];
export type StatusFilters = Partial<Record<StatusFilterKey, string>>;

export type StatusSort = "recent" | "due";

export type StatusRow = Pick<
  VocListRow,
  | "voc_id"
  | "received_at"
  | "part_name"
  | "stage"
  | "grade"
  | "voc_type"
  | "system"
  | "model"
  | "owner"
  | "due_at"
>;

/**
 * 현황 목록을 읽는다. 기본은 최근 접수 순이고, 기한순이면 미종결을 앞에 둔다.
 * overdueBefore를 주면 그 날짜 전이 기한인 미종결만, dueThrough를 주면 그 날짜까지가 기한인 미종결만 읽는다.
 * total은 거른 뒤의 전체 건수다.
 */
export async function listStatusRows(
  filters: StatusFilters,
  { sort = "recent", overdueBefore, dueThrough }: {
    sort?: StatusSort;
    overdueBefore?: string;
    dueThrough?: string;
  } = {},
) {
  const supabase = await createClient();
  let query = supabase
    .from("voc_list")
    .select(
      "voc_id, received_at, part_name, stage, grade, voc_type, system, model, owner, due_at",
      { count: "exact" },
    );

  for (const key of STATUS_FILTER_KEYS) {
    const value = filters[key];
    if (value) query = query.eq(key, value);
  }

  if (overdueBefore) {
    query = query.neq("stage", "종결").lt("due_at", overdueBefore);
  }
  if (dueThrough) {
    query = query.neq("stage", "종결").lte("due_at", dueThrough);
  }
  if (sort === "due") {
    query = query
      .order("closed_at", { ascending: false, nullsFirst: true })
      .order("due_at");
  }

  const { data, error, count } = await query
    .order("received_at", { ascending: false })
    .order("voc_id", { ascending: false })
    .limit(STATUS_LIMIT);

  if (error) throw new Error(error.message);
  return { rows: data as StatusRow[], total: count ?? data.length };
}

/** 차종과 담당 거르기 목록을 읽는다. */
export async function listStatusFilterOptions() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("voc_filter_options")
    .select("kind, value")
    .order("value");

  if (error) throw new Error(error.message);
  const valuesOf = (kind: string) =>
    data.filter((row) => row.kind === kind).map((row) => row.value);
  return { models: valuesOf("model"), owners: valuesOf("owner") };
}
