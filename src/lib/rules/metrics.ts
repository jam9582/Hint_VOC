import type { VocRow } from "@/types/database";
import {
  REGISTER_FIELD_NAMES,
  validateRegistration,
  type RegisterFields,
} from "./validation";

/** 효과 지표 (PRD 11장, 15장 결정 16). */

const DAY_MS = 24 * 60 * 60 * 1000;
const RECURRENCE_DAYS = 90;

export type MetricVoc = Pick<
  VocRow,
  | "voc_id"
  | "received_at"
  | "closed_at"
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
  | "stage"
  | "due_at"
> & { d4_done_at: string | null };

export type Metrics = {
  missingRate: number | null;
  averageCauseDays: number | null;
  averageCloseDays: number | null;
  recurrenceRate: number | null;
  overdueCount: number;
};

const toPercent = (part: number, whole: number) =>
  whole === 0 ? null : (part / whole) * 100;

function daysBetween(start: string, end: string) {
  return (new Date(end).getTime() - new Date(start).getTime()) / DAY_MS;
}

function average(values: number[]) {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function hasMissingField(voc: MetricVoc) {
  const fields = Object.fromEntries(
    REGISTER_FIELD_NAMES.map((name) => [name, String(voc[name] ?? "")]),
  ) as RegisterFields;
  const detail = Object.fromEntries(
    Object.entries((voc.type_detail ?? {}) as Record<string, unknown>).map(
      ([key, value]) => [key, String(value ?? "")],
    ),
  );
  return validateRegistration(fields, detail).missing.length > 0;
}

function recurred(closed: MetricVoc, vocs: MetricVoc[]) {
  if (!closed.closed_at || !closed.part_no) return false;
  const closedAt = closed.closed_at;
  return vocs.some((voc) => {
    if (voc.voc_id === closed.voc_id) return false;
    if (voc.part_no !== closed.part_no) return false;
    if (voc.voc_type !== closed.voc_type) return false;
    const days = daysBetween(closedAt, voc.received_at);
    return days > 0 && days <= RECURRENCE_DAYS;
  });
}

export function calculateMetrics(vocs: MetricVoc[], today: string): Metrics {
  const closed = vocs.filter((voc) => voc.closed_at);

  return {
    missingRate: toPercent(vocs.filter(hasMissingField).length, vocs.length),
    averageCauseDays: average(
      vocs.flatMap((voc) =>
        voc.d4_done_at ? [daysBetween(voc.received_at, voc.d4_done_at)] : [],
      ),
    ),
    averageCloseDays: average(
      closed.map((voc) =>
        daysBetween(voc.received_at, voc.closed_at as string),
      ),
    ),
    recurrenceRate: toPercent(
      closed.filter((voc) => recurred(voc, vocs)).length,
      closed.length,
    ),
    overdueCount: vocs.filter(
      (voc) => voc.stage !== "종결" && voc.due_at < today,
    ).length,
  };
}
