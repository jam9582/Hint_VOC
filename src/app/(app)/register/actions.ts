"use server";

import { after } from "next/server";
import { sendSafetyAlert } from "@/lib/alerts";
import { requireUser } from "@/lib/auth";
import { fromSeoulDateTimeLocal } from "@/lib/dates";
import { findSimilarVocs, type SimilarQuery } from "@/lib/db/similar";
import { registerVoc } from "@/lib/db/vocs";
import { getD3DueDate } from "@/lib/rules/due-date";
import { toSimilarIds } from "@/lib/rules/similar";
import {
  hasProblems,
  REGISTER_FIELD_NAMES,
  validateRegistration,
  type FormProblems,
  type RegisterFields,
  type TypeDetail,
} from "@/lib/rules/validation";
import { GRADE_SAFETY } from "@/types/codes";
import type { Json } from "@/types/database";
import { getTypeDetailFields } from "@/types/type-detail";

export type RegisterResult =
  { vocId: string } | { problems: FormProblems } | { error: string };

/** 8장 표에 있는 항목과 값만 골라 담는다. */
function readTypeDetail(formData: FormData, type: string): TypeDetail {
  const detail: TypeDetail = {};
  for (const field of getTypeDetailFields(type)) {
    const value = String(formData.get(`detail.${field.key}`) ?? "").trim();
    if (!value) continue;
    if (field.input === "select" && !field.options.includes(value)) continue;
    detail[field.key] = value;
  }
  return detail;
}

/** 저장할 때는 정수 항목을 숫자로 바꾼다. 비어 있으면 null이다. */
function toStoredDetail(detail: TypeDetail, type: string) {
  const stored: Record<string, Json> = {};
  for (const field of getTypeDetailFields(type)) {
    const value = detail[field.key];
    if (value === undefined) continue;
    stored[field.key] = field.input === "integer" ? Number(value) : value;
  }
  return Object.keys(stored).length > 0 ? stored : null;
}

/** 유사 VOC 조회가 실패해도 접수는 저장한다. 상세 화면은 다시 계산해 보여 준다. */
async function readSimilarIds(query: SimilarQuery) {
  try {
    return toSimilarIds(await findSimilarVocs(query));
  } catch (error) {
    console.error("유사 VOC 조회 실패", error);
    return null;
  }
}

export async function registerVocAction(
  formData: FormData,
): Promise<RegisterResult> {
  const user = await requireUser();

  const text = (name: string) => String(formData.get(name) ?? "").trim();
  const fields = Object.fromEntries(
    REGISTER_FIELD_NAMES.map((name) => [name, text(name)]),
  ) as RegisterFields;
  const type = fields.voc_type;
  const detail = readTypeDetail(formData, type);

  const problems = validateRegistration(fields, detail);
  const receivedAt = fromSeoulDateTimeLocal(fields.received_at);
  if (hasProblems(problems) || !receivedAt) return { problems };

  const partNo = text("part_no");
  const similarIds = await readSimilarIds({
    vin: fields.vin,
    partNo,
    vocType: type,
    system: fields.system,
  });

  try {
    const vocId = await registerVoc(
      {
        received_at: receivedAt.toISOString(),
        channel: fields.channel,
        grade: fields.grade,
        owner: fields.owner,
        vin: fields.vin,
        mileage_km: Number(fields.mileage_km),
        voc_type: type,
        system: fields.system,
        part_name: fields.part_name,
        part_no: partNo || null,
        symptom: fields.symptom,
        frequency: fields.frequency,
        reproduced: fields.reproduced,
        type_detail: toStoredDetail(detail, type),
        media_links: text("media_links") || null,
        similar_ids: similarIds,
        due_at: getD3DueDate(receivedAt, fields.grade),
      },
      text("team"),
      user.name,
    );
    if (fields.grade === GRADE_SAFETY) {
      after(() => sendSafetyAlert(vocId));
    }
    return { vocId };
  } catch (error) {
    console.error("VOC 등록 실패", error);
    return { error: "저장하지 못했습니다. 입력값을 확인해 주세요." };
  }
}
