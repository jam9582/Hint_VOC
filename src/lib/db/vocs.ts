import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { Json, VocRow } from "@/types/database";

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
