import "server-only";

import { listActiveCodes, toCodeOptions } from "@/lib/db/codes";
import { getVocDetail } from "@/lib/db/vocs";
import { buildReport } from "@/lib/rules/report";
import type { CodeOptions } from "@/types/codes";

/** VOC 한 건의 8D 보고서를 읽는다. 없으면 null이다. 화면과 Word가 함께 쓴다. */
export async function getVocReport(vocId: string) {
  const [detail, codes] = await Promise.all([
    getVocDetail(vocId),
    listActiveCodes(),
  ]);
  if (!detail) return null;

  const options = toCodeOptions(codes);
  const labelOf = (group: keyof CodeOptions, value: string) =>
    options[group]?.find((option) => option.value === value)?.label ?? value;
  return buildReport(detail, labelOf);
}
