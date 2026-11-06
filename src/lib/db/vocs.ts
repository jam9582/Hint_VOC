import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Stage } from "@/types/codes";
import type { Json, Voc8dRow, VocRow } from "@/types/database";

export type NewVoc = Pick<
  VocRow,
  | "channel"
  | "grade"
  | "owner"
  | "vin"
  | "mileage_km"
  | "voc_type"
  | "system"
  | "part_name"
  | "part_no"
  | "symptom"
  | "frequency"
  | "reproduced"
  | "type_detail"
  | "media_links"
  | "similar_ids"
  | "due_at"
> & { received_at: string };

/** voc, voc_8d, voc_stage_log를 한 번에 저장하고 새 VOC 번호를 돌려준다. */
export async function registerVoc(
  voc: NewVoc,
  team: string,
  changedBy: string,
): Promise<string> {
  const { data, error } = await createAdminClient().rpc("register_voc", {
    p_voc: voc as Json,
    p_team: team,
    p_changed_by: changedBy,
  });
  if (error) throw new Error(error.message);
  return data;
}

/** VOC 한 건의 접수 정보, 8D 내용, 단계 이력을 읽는다. 없으면 null이다. */
export async function getVocDetail(vocId: string) {
  const supabase = await createClient();
  const [voc, voc8d, logs] = await Promise.all([
    supabase.from("voc").select("*").eq("voc_id", vocId).maybeSingle(),
    supabase.from("voc_8d").select("*").eq("voc_id", vocId).maybeSingle(),
    supabase
      .from("voc_stage_log")
      .select("*")
      .eq("voc_id", vocId)
      .order("changed_at", { ascending: false })
      .order("log_id", { ascending: false }),
  ]);

  const error = voc.error ?? voc8d.error ?? logs.error;
  if (error) throw new Error(error.message);
  if (!voc.data || !voc8d.data) return null;
  return { voc: voc.data, voc8d: voc8d.data, logs: logs.data ?? [] };
}

export type VocDetail = NonNullable<Awaited<ReturnType<typeof getVocDetail>>>;

/** 단계는 그대로 두고 입력 내용만 저장한다. */
export async function saveVoc8d(vocId: string, values: Partial<Voc8dRow>) {
  const { error } = await createAdminClient()
    .from("voc_8d")
    .update(values)
    .eq("voc_id", vocId);
  if (error) throw new Error(error.message);
}

/** 단계, 기한, 8D 내용, 단계 이력을 한 번에 저장한다. */
export async function advanceVocStage(args: {
  vocId: string;
  fromStage: Stage;
  toStage: Stage;
  dueAt: string;
  values: Partial<Voc8dRow>;
  changedBy: string;
  note: string | null;
}) {
  const { error } = await createAdminClient().rpc("advance_voc_stage", {
    p_voc_id: args.vocId,
    p_from_stage: args.fromStage,
    p_to_stage: args.toStage,
    p_due_at: args.dueAt,
    p_8d: args.values as Json,
    p_changed_by: args.changedBy,
    p_note: args.note ?? undefined,
  });
  if (error) throw new Error(error.message);
}
