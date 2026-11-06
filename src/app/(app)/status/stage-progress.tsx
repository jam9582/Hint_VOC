import { getCurrentStep, PROGRESS_STEPS } from "@/lib/rules/stage-progress";
import type { Stage } from "@/types/codes";

const STEP_CLASS = {
  done: "bg-zinc-800 text-white",
  current: "border border-zinc-900 font-semibold",
  later: "bg-zinc-100 text-zinc-500",
};

export function StageProgress({ stage }: { stage: Stage }) {
  const current = getCurrentStep(stage);

  return (
    <ol
      className="flex gap-1 whitespace-nowrap text-xs"
      aria-label={`현재 단계 ${stage}`}
    >
      {PROGRESS_STEPS.map((step, index) => {
        const state =
          index < current ? "done" : index === current ? "current" : "later";
        return (
          <li
            key={step}
            aria-current={state === "current" ? "step" : undefined}
            className={`rounded px-1.5 py-0.5 ${STEP_CLASS[state]}`}
          >
            {step}
          </li>
        );
      })}
    </ol>
  );
}
