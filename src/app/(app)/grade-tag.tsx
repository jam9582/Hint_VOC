import { GRADE_SAFETY } from "@/types/codes";

const GRADE_CLASS: Record<string, string> = {
  [GRADE_SAFETY]: "bg-late-bg text-late",
  기능: "bg-primary-bg text-primary",
  감성: "bg-purple-bg text-purple",
};

export function GradeTag({ grade, label }: { grade: string; label: string }) {
  return (
    <span className={`tag ${GRADE_CLASS[grade] ?? "bg-inset text-ink-2"}`}>
      {label}
    </span>
  );
}
