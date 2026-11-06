import Link from "next/link";
import { toSeoulDate } from "@/lib/dates";
import { listMetricVocs } from "@/lib/db/metrics";
import { calculateMetrics } from "@/lib/rules/metrics";

function Tile({
  label,
  value,
  unit,
  note,
}: {
  label: string;
  value: number | null;
  unit: string;
  note: string;
}) {
  return (
    <div className="rounded-lg border border-line p-4">
      <p className="text-xs font-medium text-ink-2">{label}</p>
      <p className="mt-1.5 mb-0.5 text-[28px] leading-[1.1] font-semibold tracking-tight">
        {value === null ? "-" : value.toFixed(1)}
        {value !== null && (
          <small className="ml-0.5 text-[13px] font-semibold text-ink-3">
            {unit}
          </small>
        )}
      </p>
      <p className="text-[11px] font-medium text-ink-3">{note}</p>
    </div>
  );
}

/** 효과 지표 요약 (PRD 11장). 기한 초과 칸을 누르면 목록을 거른다. */
export async function MetricsSummary({ overdueOnly }: { overdueOnly: boolean }) {
  const metrics = calculateMetrics(
    await listMetricVocs(),
    toSeoulDate(new Date()),
  );

  return (
    <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
      <Link
        href={overdueOnly ? "/status" : "/status?overdue=1"}
        aria-current={overdueOnly ? "true" : undefined}
        className={`rounded-lg border p-4 transition-colors ${
          overdueOnly
            ? "border-primary bg-primary text-white shadow-primary"
            : "border-line hover:border-chart"
        }`}
      >
        <p
          className={`text-xs font-medium ${overdueOnly ? "text-white/80" : "text-ink-2"}`}
        >
          기한 초과
        </p>
        <p className="mt-1.5 mb-0.5 text-[28px] leading-[1.1] font-semibold tracking-tight">
          {metrics.overdueCount}
          <small
            className={`ml-0.5 text-[13px] font-semibold ${overdueOnly ? "text-white/80" : "text-ink-3"}`}
          >
            건
          </small>
        </p>
        <p
          className={`text-[11px] font-medium ${overdueOnly ? "text-white/80" : "text-ink-3"}`}
        >
          {overdueOnly ? "눌러서 거르기 풀기" : "눌러서 목록 거르기"}
        </p>
      </Link>
      <Tile
        label="평균 원인 확인"
        value={metrics.averageCauseDays}
        unit="일"
        note="접수부터 D4 완료까지"
      />
      <Tile
        label="평균 종결"
        value={metrics.averageCloseDays}
        unit="일"
        note="접수부터 종결까지"
      />
      <Tile
        label="재발률"
        value={metrics.recurrenceRate}
        unit="%"
        note="종결 후 90일 안 재접수"
      />
      <Tile
        label="필수 정보 누락률"
        value={metrics.missingRate}
        unit="%"
        note="목표 0%"
      />
    </div>
  );
}
