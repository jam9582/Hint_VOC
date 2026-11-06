/** 날짜 계산은 모두 Asia/Seoul 기준이다. (PRD 15장 결정 7) */

const TIME_ZONE = "Asia/Seoul";

/** 2026-11-06 형식. */
export function toSeoulDate(date: Date): string {
  return date.toLocaleDateString("en-CA", { timeZone: TIME_ZONE });
}

/** datetime-local 입력 칸 형식. 2026-11-06T14:30 */
export function toSeoulDateTimeLocal(date: Date): string {
  const time = date.toLocaleTimeString("en-GB", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  return `${toSeoulDate(date)}T${time}`;
}

/** datetime-local 입력 값을 한국 시각으로 읽는다. 잘못된 값이면 null이다. */
export function fromSeoulDateTimeLocal(value: string): Date | null {
  const date = new Date(`${value}:00+09:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function addDays(date: string, days: number): string {
  const result = new Date(`${date}T00:00:00Z`);
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString().slice(0, 10);
}
