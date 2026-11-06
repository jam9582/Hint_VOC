import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { SimilarVoc } from "@/types/database";

export type SimilarQuery = {
  vin: string;
  partNo: string;
  vocType: string;
  system: string;
  /** 상세 화면에서 자기 자신을 뺄 때 쓴다. */
  excludeVocId?: string;
};

/** 유사 VOC를 최근 순으로 읽는다. 조건은 DB 함수에 있다. */
export async function findSimilarVocs(
  query: SimilarQuery,
): Promise<SimilarVoc[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("find_similar_vocs", {
    p_vin: query.vin,
    p_part_no: query.partNo,
    p_voc_type: query.vocType,
    p_system: query.system,
    p_exclude_voc_id: query.excludeVocId,
  });
  if (error) throw new Error(error.message);
  return data;
}
