import type { SimilarVoc } from "@/types/database";

const SIMILAR_IDS_MAX_LENGTH = 200;

/** similar_ids에 넣을 글자. 최근 순으로 200자 안에 들어가는 만큼만 담는다. (15장 결정 5) */
export function toSimilarIds(vocs: Pick<SimilarVoc, "voc_id">[]) {
  let joined = "";
  for (const { voc_id } of vocs) {
    const next = joined ? `${joined},${voc_id}` : voc_id;
    if (next.length > SIMILAR_IDS_MAX_LENGTH) break;
    joined = next;
  }
  return joined || null;
}
