import "server-only";

import type { MetricVoc } from "@/lib/rules/metrics";
import { createClient } from "@/lib/supabase/server";
import type { ProblemGroup } from "@/types/database";

const PAGE_SIZE = 1000;

const VOC_COLUMNS =
  "voc_id, received_at, closed_at, channel, grade, owner, vin, mileage_km, voc_type, system, part_name, part_no, symptom, frequency, reproduced, type_detail, stage, due_at";

/** Supabase는 한 번에 1000건까지 주므로 나눠서 끝까지 읽는다. */
async function readAll<T>(
  readPage: (
    from: number,
    to: number,
  ) => PromiseLike<{
    data: T[] | null;
    error: { message: string } | null;
  }>,
) {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await readPage(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(error.message);
    rows.push(...(data ?? []));
    if ((data?.length ?? 0) < PAGE_SIZE) return rows;
  }
}

/** 지표 계산에 쓸 VOC 전체. */
export async function listMetricVocs(): Promise<MetricVoc[]> {
  const supabase = await createClient();
  const [vocs, causes] = await Promise.all([
    readAll((from, to) =>
      supabase.from("voc").select(VOC_COLUMNS).order("voc_id").range(from, to),
    ),
    readAll((from, to) =>
      supabase
        .from("voc_8d")
        .select("voc_id, d4_done_at")
        .order("voc_id")
        .range(from, to),
    ),
  ]);

  const doneAt = new Map(causes.map((row) => [row.voc_id, row.d4_done_at]));
  return vocs.map((voc) => ({
    ...voc,
    d4_done_at: doneAt.get(voc.voc_id) ?? null,
  }));
}

export async function listProblemGroups(): Promise<ProblemGroup[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("voc_problem_groups")
    .select("kind, part_no, part_lot, voc_type, system, voc_ids");
  if (error) throw new Error(error.message);
  return data;
}
