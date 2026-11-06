import type { ProblemGroup } from "@/types/database";

/** 묶인 기준별 이름과 설명. 색은 긴급도가 아니라 기준의 종류만 나타낸다. */
export const GROUP_KINDS: Record<
  ProblemGroup["kind"],
  { label: string; hint: string; className: string }
> = {
  lot: {
    label: "같은 생산 LOT",
    hint: "함께 생산된 부품에서 나온 VOC입니다. 그 생산분의 불량일 수 있습니다.",
    className: "bg-primary-bg text-primary",
  },
  part: {
    label: "같은 부품 반복",
    hint: "같은 부품·부위에서 같은 유형의 문제가 반복된 VOC입니다.",
    className: "bg-inset text-ink-2",
  },
};

export function GroupKindBadge({ kind }: { kind: ProblemGroup["kind"] }) {
  const { label, className } = GROUP_KINDS[kind];
  return (
    <span
      className={`inline-block shrink-0 rounded px-1.5 py-0.5 text-[11px] font-semibold ${className}`}
    >
      {label}
    </span>
  );
}
