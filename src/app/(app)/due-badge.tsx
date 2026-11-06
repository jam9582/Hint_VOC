import { getDueLabel, getDueState, type DueState } from "@/lib/rules/dashboard";
import type { Stage } from "@/types/codes";

const STATE_CLASS: Record<DueState, string> = {
  late: "bg-late-bg text-late",
  soon: "bg-soon-bg text-soon-ink",
  ok: "text-ink-2",
  closed: "bg-ok-bg text-ok",
};

export function DueBadge({
  stage,
  dueAt,
  today,
}: {
  stage: Stage;
  dueAt: string;
  today: string;
}) {
  const state = getDueState(stage, dueAt, today);
  return (
    <span className={`due ${STATE_CLASS[state]}`}>
      {state === "closed" ? "종결" : getDueLabel(dueAt, today)}
    </span>
  );
}
