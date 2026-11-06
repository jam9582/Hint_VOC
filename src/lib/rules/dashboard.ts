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
  return `${Number(dueAt.slice(5, 7))}월 ${Number(dueAt.slice(8, 10))}일`;
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

export type TrendPoint = { date: string; received: number; closed: number };

export type Trend = {
  weekly: TrendPoint[];
  daily: TrendPoint[];
  cumulative: TrendPoint[];
};

/**
 * 최근 8주의 접수·종결 추이. toDate는 시각을 한국 날짜로 바꾼다.
 * 누적은 8주 전 건까지 합쳐서, 접수와 종결의 차이가 그날의 미종결 건수가 된다.
 */
export function buildTrend(
  vocs: TrendVoc[],
  today: string,
  toDate: (value: string) => string,
): Trend {
  const lastWeek = mondayOf(today);
  const firstDay = addDays(lastWeek, -(TREND_WEEKS - 1) * 7);
  const weeks = Array.from({ length: TREND_WEEKS }, (_, index) =>
    addDays(firstDay, index * 7),
  );
  const days = Array.from(
    { length: daysBetween(firstDay, today) + 1 },
    (_, index) => addDays(firstDay, index),
  );
  const received = vocs.map((voc) => toDate(voc.received_at));
  const closed = vocs.flatMap((voc) =>
    voc.closed_at ? [toDate(voc.closed_at)] : [],
  );
  const pointsOf = (
    dates: string[],
    matches: (value: string, date: string) => boolean,
  ) =>
    dates.map((date) => ({
      date,
      received: received.filter((value) => matches(value, date)).length,
      closed: closed.filter((value) => matches(value, date)).length,
    }));

  return {
    weekly: pointsOf(weeks, (value, week) => mondayOf(value) === week),
    daily: pointsOf(days, (value, day) => value === day),
    cumulative: pointsOf(days, (value, day) => value <= day),
  };
}
