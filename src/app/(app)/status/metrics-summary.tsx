import { requireUser } from "@/lib/auth";
import { toSeoulDate } from "@/lib/dates";
import { listMetricVocs } from "@/lib/db/metrics";
import { calculateMetrics } from "@/lib/rules/metrics";

const format = (value: number | null, unit: string) =>
  value === null ? "-" : `${value.toFixed(1)}${unit}`;

/** 효과 지표 요약 (PRD 11장). */
export async function MetricsSummary() {
  await requireUser();
  const metrics = calculateMetrics(
    await listMetricVocs(),
    toSeoulDate(new Date()),
  );

  const items = [
    ["필수 정보 누락률", format(metrics.missingRate, "%")],
    ["평균 원인 확인", format(metrics.averageCauseDays, "일")],
    ["평균 종결", format(metrics.averageCloseDays, "일")],
    ["재발률", format(metrics.recurrenceRate, "%")],
    ["기한 초과", `${metrics.overdueCount}건`],
  ];

  return (
    <dl className="mt-4 grid grid-cols-2 gap-3 rounded border border-zinc-300 p-3 text-sm md:grid-cols-5">
      {items.map(([label, value]) => (
        <div key={label}>
          <dt className="text-zinc-600">{label}</dt>
          <dd className="text-lg font-medium">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
