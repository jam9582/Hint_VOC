import { addDays, toSeoulDate } from "@/lib/dates";
import { GRADE_SAFETY } from "@/types/codes";

/** D3 기한: 접수 후 2일, 안전·법규는 당일. (PRD 6-2) */
export function getD3DueDate(receivedAt: Date, grade: string): string {
  const received = toSeoulDate(receivedAt);
  return grade === GRADE_SAFETY ? received : addDays(received, 2);
}
