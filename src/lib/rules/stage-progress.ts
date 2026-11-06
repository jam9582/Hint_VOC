import type { Stage } from "@/types/codes";

/** 현황의 단계 진행 표시 (PRD 4장). */
export const PROGRESS_STEPS = ["접수", "원인", "대책", "검증", "종결"] as const;

const CURRENT_STEP: Record<Stage, number> = {
  D3: 1,
  D4: 1,
  "D5-D6": 2,
  D6검증: 3,
  "D7-D8": 4,
  종결: 5,
};

/** 진행 중인 칸의 위치. 앞 칸은 완료이고, 종결이면 모든 칸이 완료다. */
export function getCurrentStep(stage: Stage): number {
  return CURRENT_STEP[stage];
}
