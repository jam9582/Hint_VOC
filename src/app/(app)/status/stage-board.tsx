import Link from "next/link";
import { SOON_DAYS, type StageCount } from "@/lib/rules/dashboard";
import { STAGE_SECTIONS } from "@/lib/rules/stage-fields";

const SEGMENTS = [
  { key: "late", label: "기한 초과", className: "bg-late" },
  { key: "soon", label: `${SOON_DAYS}일 안`, className: "bg-soon" },
  { key: "ok", label: "여유", className: "bg-chart" },
] as const;

const titleOf = (stage: string) =>
  STAGE_SECTIONS.find((section) => section.stage === stage)?.title ?? stage;

function footerText({ total, late, soon }: StageCount) {
  if (total === 0) return "진행 중인 건 없음";
  if (late > 0) return `${late}건 초과`;
  return soon > 0 ? `${soon}건 임박` : "초과 없음";
}

/** 8D 단계별 미종결 건수. 칸을 누르면 그 단계로 목록을 거른다. */
export function StageBoard({ counts }: { counts: StageCount[] }) {
  return (
    <section className="card mb-[22px] p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="card-title">8D 단계별 VOC</h2>
        <ul className="flex gap-3.5 text-xs font-medium text-ink-2">
          {SEGMENTS.map((segment) => (
            <li key={segment.key} className="flex items-center gap-1.5">
              <i className={`size-2 rounded-full ${segment.className}`} />
              {segment.label}
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3.5 md:grid-cols-3 xl:grid-cols-5">
        {counts.map((count) => (
          <Link
            key={count.stage}
            href={`/status?${new URLSearchParams({ stage: count.stage })}`}
            className={`rounded-lg border px-4 py-3.5 transition-colors hover:border-chart ${
              count.late > 0 ? "border-[#f7c2c2] bg-late-bg/40" : "border-line"
            }`}
          >
            <p className="text-[13px] font-semibold">{titleOf(count.stage)}</p>
            <p className="mt-1.5 mb-2.5 text-[26px] leading-none font-semibold">
              {count.total}
            </p>
            <div className="flex h-2 gap-0.5 overflow-hidden rounded bg-inset">
              {SEGMENTS.map(
                (segment) =>
                  count[segment.key] > 0 && (
                    <i
                      key={segment.key}
                      className={segment.className}
                      style={{ flex: count[segment.key] }}
                    />
                  ),
              )}
            </div>
            <p
              className={`mt-2 text-[11px] font-medium ${count.late > 0 ? "font-semibold text-late" : "text-ink-3"}`}
            >
              {footerText(count)}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
