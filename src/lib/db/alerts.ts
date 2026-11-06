import "server-only";

import type { AlertVoc } from "@/lib/rules/alerts";
import { createAdminClient } from "@/lib/supabase/admin";

const ALERT_COLUMNS = "voc_id, owner, stage, due_at, part_name";

/** 기한이 지났고 오늘 아직 알리지 않은 미종결 VOC. */
export async function listOverdueVocs(today: string): Promise<AlertVoc[]> {
  const { data, error } = await createAdminClient()
    .from("voc")
    .select(ALERT_COLUMNS)
    .neq("stage", "종결")
    .lt("due_at", today)
    .or(`alerted_on.is.null,alerted_on.neq.${today}`)
    .order("due_at");
  if (error) throw new Error(error.message);
  return data;
}

export async function getAlertVoc(vocId: string): Promise<AlertVoc | null> {
  const { data, error } = await createAdminClient()
    .from("voc")
    .select(ALERT_COLUMNS)
    .eq("voc_id", vocId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function markAlerted(vocIds: string[], today: string) {
  const { error } = await createAdminClient()
    .from("voc")
    .update({ alerted_on: today })
    .in("voc_id", vocIds);
  if (error) throw new Error(error.message);
}
