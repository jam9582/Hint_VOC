import { addDays } from "@/lib/dates";
import { STAGES, type Stage } from "@/types/codes";

/** 현황 대시보드 계산. 저장된 값으로 셀 수 있는 숫자만 보여 준다. */

export const SOON_DAYS = 2;
const TREND_WEEKS = 8;

type BoardVoc = { stage: Stage; due_at: string };
type TrendVoc = { received_at: string; closed_at: string | null };

export type DueState = "late" | "soon" | "ok" | "closed";

export function getDueState(stage: Stage, dueAt: string, today: string): DueState {
  if (stage === "종결") return "closed";
  if (dueAt < today) return "late";
  return dueAt <= addDays(today, SOON_DAYS) ? "soon" : "ok";
}

function daysBetween(start: string, end: string) {
  return Math.round(
    (Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) /
      (24 * 60 * 60 * 1000),
  );
}

/** 기한 표시 문구. */
export function getDueLabel(dueAt: string, today: string) {
  const days = daysBetween(today, dueAt);
  if (days < 0) return `${-days}일 초과`;
  if (days === 0) return "오늘";
  if (days === 1) return "내일";
  return dueAt.slice(5);
}

export type StageCount = {
  stage: Stage;
  total: number;
  late: number;
  soon: number;
  ok: number;
};

/** 종결 전 단계별 건수와 기한 상태. */
export function countByStage(vocs: BoardVoc[], today: string): StageCount[] {
  return STAGES.filter((stage) => stage !== "종결").map((stage) => {
    const states = vocs
      .filter((voc) => voc.stage === stage)
      .map((voc) => getDueState(voc.stage, voc.due_at, today));
    const count = (state: DueState) =>
      states.filter((value) => value === state).length;
    return {
      stage,
      total: states.length,
      late: count("late"),
      soon: count("soon"),
      ok: count("ok"),
    };
  });
}

/** 한국 날짜의 그 주 월요일. */
function mondayOf(date: string) {
  const weekday = new Date(`${date}T00:00:00Z`).getUTCDay();
  return addDays(date, -((weekday + 6) % 7));
}

export type TrendWeek = { week: string; received: number; closed: number };

/** 최근 8주의 주별 접수·종결 건수. toDate는 시각을 한국 날짜로 바꾼다. */
export function countByWeek(
  vocs: TrendVoc[],
  today: string,
  toDate: (value: string) => string,
): TrendWeek[] {
  const lastWeek = mondayOf(today);
  const weeks = Array.from({ length: TREND_WEEKS }, (_, index) =>
    addDays(lastWeek, (index - TREND_WEEKS + 1) * 7),
  );
  const countIn = (values: string[], week: string) =>
    values.filter((value) => mondayOf(toDate(value)) === week).length;
  const received = vocs.map((voc) => voc.received_at);
  const closed = vocs.flatMap((voc) => (voc.closed_at ? [voc.closed_at] : []));

  return weeks.map((week) => ({
    week,
    received: countIn(received, week),
    closed: countIn(closed, week),
  }));
}
