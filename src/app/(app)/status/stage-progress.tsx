import { getCurrentStep, PROGRESS_STEPS } from "@/lib/rules/stage-progress";
import type { Stage } from "@/types/codes";

/** 단계 진행 막대. 기한을 넘기면 지금 칸이 빨간색이다. */
export function StageProgress({
  stage,
  overdue = false,
  wide = false,
}: {
  stage: Stage;
  overdue?: boolean;
  wide?: boolean;
}) {
  const current = getCurrentStep(stage);

  return (
    <div className="flex items-center gap-2 whitespace-nowrap">
      <ol className="flex gap-[3px]" aria-label={`현재 단계 ${stage}`}>
        {PROGRESS_STEPS.map((step, index) => {
          const color =
            index < current
              ? "bg-chart"
              : index > current
                ? "bg-line"
                : overdue
                  ? "bg-late"
                  : "bg-primary";
          return (
            <li
              key={step}
              aria-current={index === current ? "step" : undefined}
              className={`h-1.5 rounded-[3px] ${wide ? "w-8" : "w-5"} ${color}`}
            >
              <span className="sr-only">{step}</span>
            </li>
          );
        })}
      </ol>
      <span className="text-xs font-semibold text-ink-2">{stage}</span>
    </div>
  );
}
