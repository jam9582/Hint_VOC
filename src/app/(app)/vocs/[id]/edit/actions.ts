"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { sendSafetyAlert } from "@/lib/alerts";
import { requireAdmin } from "@/lib/auth";
import { findSimilarVocs } from "@/lib/db/similar";
import { editVoc, getVocDetail, type VocDetail } from "@/lib/db/vocs";
import { getD3DueDate } from "@/lib/rules/due-date";
import { toSimilarIds } from "@/lib/rules/similar";
import {
  hasProblems,
  readTypeDetail,
  REGISTER_FIELD_NAMES,
  toStoredDetail,
  validateRegistration,
  type FormProblems,
  type RegisterFields,
} from "@/lib/rules/validation";
import {
  EDIT_REASON_MAX_LENGTH,
  getVocChanges,
} from "@/lib/rules/voc-edit";
import { GRADE_SAFETY } from "@/types/codes";

export type EditResult = { problems: FormProblems } | { error: string };

/** 유사 VOC 기준이 바뀔 때만 다시 찾는다. 조회가 실패하면 저장된 값을 그대로 둔다. */
async function nextSimilarIds(
  voc: VocDetail["voc"],
  next: { vin: string; partNo: string | null; vocType: string; system: string },
) {
  const same =
    voc.vin === next.vin &&
    voc.part_no === next.partNo &&
    voc.voc_type === next.vocType &&
    voc.system === next.system;
  if (same) return voc.similar_ids;

  try {
    return toSimilarIds(
      await findSimilarVocs({
        vin: next.vin,
        partNo: next.partNo ?? "",
        vocType: next.vocType,
        system: next.system,
        excludeVocId: voc.voc_id,
      }),
    );
  } catch (error) {
    console.error("유사 VOC 조회 실패", error);
    return voc.similar_ids;
  }
}

/** VOC 접수 정보를 고친다. 관리자만 쓴다. 저장하면 상세 화면으로 돌아간다. */
export async function editVocAction(
  vocId: string,
  formData: FormData,
): Promise<EditResult> {
  const user = await requireAdmin();
  const detail = await getVocDetail(vocId);
  if (!detail) return { error: "VOC를 찾지 못했습니다." };
  const { voc, voc8d } = detail;

  const text = (name: string) => String(formData.get(name) ?? "").trim();
  const fields = Object.fromEntries(
    REGISTER_FIELD_NAMES.map((name) => [name, text(name)]),
  ) as RegisterFields;
  // 접수 일시는 고치지 않으므로 화면에서 보낸 값을 쓰지 않는다.
  fields.received_at = voc.received_at;
  const type = fields.voc_type;
  const typeDetail = readTypeDetail(formData, type);
  const reason = text("reason");

  const problems = validateRegistration(fields, typeDetail);
  if (!reason) problems.missing.push("수정 사유");
  if (reason.length > EDIT_REASON_MAX_LENGTH) {
    problems.invalid.push(
      `수정 사유는 ${EDIT_REASON_MAX_LENGTH}자까지 쓸 수 있습니다.`,
    );
  }
  if (hasProblems(problems)) return { problems };

  const partNo = text("part_no") || null;
  const team = text("team") || null;
  const gradeChanged = fields.grade !== voc.grade;
  const next = {
    channel: fields.channel,
    grade: fields.grade,
    owner: fields.owner,
    vin: fields.vin,
    mileage_km: Number(fields.mileage_km),
    voc_type: type,
    system: fields.system,
    part_name: fields.part_name,
    part_no: partNo,
    symptom: fields.symptom,
    frequency: fields.frequency,
    reproduced: fields.reproduced,
    type_detail: toStoredDetail(typeDetail, type),
    media_links: text("media_links") || null,
    similar_ids: voc.similar_ids,
    // 등급이 기한을 정하는 단계는 D3뿐이다. (PRD 6-2)
    due_at:
      voc.stage === "D3" && gradeChanged
        ? getD3DueDate(new Date(voc.received_at), fields.grade)
        : voc.due_at,
  };

  const changes = getVocChanges(
    { voc, team: voc8d.team },
    { voc: next, team },
  );
  if (changes.length === 0) return { error: "바뀐 내용이 없습니다." };

  next.similar_ids = await nextSimilarIds(voc, {
    vin: next.vin,
    partNo,
    vocType: type,
    system: next.system,
  });

  try {
    await editVoc({
      vocId,
      stage: voc.stage,
      voc: next,
      team,
      changes,
      reason,
      changedBy: user.name,
    });
  } catch (error) {
    console.error("VOC 수정 실패", error);
    return { error: "저장하지 못했습니다. 입력값을 확인해 주세요." };
  }

  // 현황 건수와 목록도 새로 읽는다.
  revalidatePath("/", "layout");
  if (gradeChanged && fields.grade === GRADE_SAFETY && voc.stage !== "종결") {
    after(() => sendSafetyAlert(vocId));
  }
  redirect(`/vocs/${vocId}`);
}
