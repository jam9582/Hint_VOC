"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin, requireUser } from "@/lib/auth";
import {
  advanceVocStage,
  deleteVoc,
  getVocDetail,
  saveVoc8d,
  type VocDetail,
} from "@/lib/db/vocs";
import { getStageFields, type StageFieldKey } from "@/lib/rules/stage-fields";
import { planTransition } from "@/lib/rules/stage-transition";
import { D6_FAIL, type Stage } from "@/types/codes";

export type StageActionResult = {
  ok: boolean;
  message: string;
  missing?: string[];
};

const STAGE_CHANGED =
  "단계가 이미 바뀌었습니다. 화면을 새로고침한 뒤 확인해 주세요.";

/** 지금 단계의 항목만 골라 담는다. 빈 칸은 null이다. */
function pickStageValues(stage: Stage, input: Record<string, string>) {
  const values: Partial<Record<StageFieldKey, string | null>> = {};
  for (const { key } of getStageFields(stage)) {
    values[key] = input[key]?.trim() || null;
  }
  return values;
}

function lastRollbackAt(logs: VocDetail["logs"]) {
  const rollback = logs.find(
    (log) => log.from_stage === "D6검증" && log.to_stage === "D4",
  );
  return rollback?.changed_at ?? null;
}

function refresh(vocId: string) {
  revalidatePath(`/vocs/${vocId}`);
  revalidatePath("/status");
}

export async function saveStageAction(
  vocId: string,
  stage: Stage,
  input: Record<string, string>,
): Promise<StageActionResult> {
  await requireUser();
  try {
    const detail = await getVocDetail(vocId);
    if (detail?.voc.stage !== stage) {
      return { ok: false, message: STAGE_CHANGED };
    }
    await saveVoc8d(vocId, pickStageValues(stage, input));
    refresh(vocId);
    return { ok: true, message: "저장했습니다." };
  } catch (error) {
    console.error("8D 저장 실패", error);
    return { ok: false, message: "저장하지 못했습니다. 입력값을 확인해 주세요." };
  }
}

export async function advanceStageAction(
  vocId: string,
  stage: Stage,
  input: Record<string, string>,
): Promise<StageActionResult> {
  const user = await requireUser();
  try {
    const detail = await getVocDetail(vocId);
    if (detail?.voc.stage !== stage) {
      return { ok: false, message: STAGE_CHANGED };
    }

    const stageValues = pickStageValues(stage, input);
    const result = planTransition({
      stage,
      values: { ...detail.voc8d, ...stageValues },
      receivedAt: detail.voc.received_at,
      currentDueAt: detail.voc.due_at,
      lastRollbackAt: lastRollbackAt(detail.logs),
      now: new Date(),
    });
    if (!result.ok) {
      return {
        ok: false,
        message: result.message ?? "빠진 항목이 있습니다.",
        missing: result.missing,
      };
    }

    const { plan } = result;
    await advanceVocStage({
      vocId,
      fromStage: stage,
      toStage: plan.toStage,
      dueAt: plan.dueAt,
      values: { ...stageValues, ...plan.changes },
      changedBy: user.name,
      note: plan.note,
    });
    refresh(vocId);

    const failed = stageValues.d6_result === D6_FAIL;
    return {
      ok: true,
      message: failed
        ? "불합격을 저장해 D4로 되돌렸습니다."
        : `${plan.toStage} 단계로 옮겼습니다.`,
    };
  } catch (error) {
    console.error("단계 이동 실패", error);
    return {
      ok: false,
      message: "단계를 옮기지 못했습니다. 화면을 새로고침해 확인해 주세요.",
    };
  }
}

/** VOC를 지운다. 8D 내용과 단계 이력도 함께 지워진다. 관리자만 쓴다. */
export async function deleteVocAction(vocId: string) {
  await requireAdmin();
  await deleteVoc(vocId);
  revalidatePath("/status");
  redirect("/status");
}
