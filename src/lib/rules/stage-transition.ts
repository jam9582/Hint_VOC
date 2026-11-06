import { addDays, toSeoulDate } from "@/lib/dates";
import { D6_FAIL, D6_PASS, type Stage } from "@/types/codes";
import type { Voc8dRow } from "@/types/database";
import type { StageFieldKey } from "./stage-fields";
import { getMissingStageFields } from "./validation";

const NOTE_MAX_LENGTH = 200;

export type TransitionInput = {
  stage: Stage;
  /** 저장된 값에 지금 입력한 값을 합친 내용. */
  values: Partial<Record<StageFieldKey, string | null>>;
  receivedAt: string;
  currentDueAt: string;
  /** 마지막으로 불합격 처리되어 D4로 돌아온 일시. */
  lastRollbackAt: string | null;
  now: Date;
};

export type TransitionPlan = {
  toStage: Stage;
  dueAt: string;
  /** 입력 값에 덧붙여 voc_8d에 저장할 값. */
  changes: Partial<Voc8dRow>;
  note: string | null;
};

export type TransitionResult =
  | { ok: true; plan: TransitionPlan }
  | { ok: false; missing: string[]; message?: string };

const blocked = (message: string): TransitionResult => ({
  ok: false,
  missing: [],
  message,
});

/** 단계 이동 규칙 (PRD 6장, 15장 결정 7, 8). 실제 저장은 하지 않는다. */
export function planTransition(input: TransitionInput): TransitionResult {
  const { stage, values, now } = input;

  const missing = getMissingStageFields(stage, values);
  if (missing.length > 0) return { ok: false, missing };

  const today = toSeoulDate(now);
  // 불합격으로 돌아온 VOC는 되돌린 날을 접수일 대신 기준으로 삼는다.
  const baseDate = toSeoulDate(
    new Date(input.lastRollbackAt ?? input.receivedAt),
  );
  const timestamp = now.toISOString();
  const plan = (
    toStage: Stage,
    dueAt: string,
    changes: Partial<Voc8dRow> = {},
    note: string | null = null,
  ): TransitionResult => ({
    ok: true,
    plan: { toStage, dueAt, changes, note },
  });

  switch (stage) {
    case "D3":
      return plan("D4", addDays(baseDate, 7), { d3_done_at: timestamp });
    case "D4":
      return plan("D5-D6", addDays(baseDate, 14), { d4_done_at: timestamp });
    case "D5-D6":
      return plan("D6검증", addDays(today, 14));
    case "D6검증":
      if (values.d6_result === D6_PASS) {
        return plan("D7-D8", addDays(today, 7));
      }
      if (values.d6_result === D6_FAIL) {
        return plan(
          "D4",
          addDays(today, 7),
          { d6_result: null, d6_evidence: null },
          `D6 불합격: ${values.d6_evidence}`.slice(0, NOTE_MAX_LENGTH),
        );
      }
      return blocked("검증 결과를 다시 선택해 주세요.");
    case "D7-D8":
      if (values.d6_result !== D6_PASS) {
        return blocked("D6 검증 결과가 합격이어야 종결할 수 있습니다.");
      }
      return plan("종결", input.currentDueAt);
    case "종결":
      return blocked("이미 종결된 VOC입니다.");
  }
}
