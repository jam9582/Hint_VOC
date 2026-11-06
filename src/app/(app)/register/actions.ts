"use server";

import { requireUser } from "@/lib/auth";
import { fromSeoulDateTimeLocal } from "@/lib/dates";
import { registerVoc } from "@/lib/db/vocs";
import { getD3DueDate } from "@/lib/rules/due-date";
import {
  hasProblems,
  isVocType,
  REGISTER_FIELD_NAMES,
  validateRegistration,
  type FormProblems,
  type RegisterFields,
  type TypeDetail,
} from "@/lib/rules/validation";
import type { VocType } from "@/types/codes";
import type { Json } from "@/types/database";
import { getTypeDetailFields } from "@/types/type-detail";

export type RegisterResult =
  | { vocId: string }
  | { problems: FormProblems }
  | { error: string };

/** 8장 표에 있는 항목과 값만 골라 담는다. */
function readTypeDetail(formData: FormData, type: VocType): TypeDetail {
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
function toStoredDetail(detail: TypeDetail, type: VocType) {
  const stored: Record<string, Json> = {};
  for (const field of getTypeDetailFields(type)) {
    const value = detail[field.key];
    if (value === undefined) continue;
    stored[field.key] = field.input === "integer" ? Number(value) : value;
  }
  return Object.keys(stored).length > 0 ? stored : null;
}

export async function registerVocAction(
  formData: FormData,
): Promise<RegisterResult> {
  const user = await requireUser();

  const text = (name: string) => String(formData.get(name) ?? "").trim();
  const fields = Object.fromEntries(
    REGISTER_FIELD_NAMES.map((name) => [name, text(name)]),
  ) as RegisterFields;
  const type = isVocType(fields.voc_type) ? fields.voc_type : null;
  const detail = type ? readTypeDetail(formData, type) : {};

  const problems = validateRegistration(fields, detail);
  const receivedAt = fromSeoulDateTimeLocal(fields.received_at);
  if (hasProblems(problems) || !type || !receivedAt) return { problems };

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
        part_no: text("part_no") || null,
        symptom: fields.symptom,
        frequency: fields.frequency,
        reproduced: fields.reproduced,
        type_detail: toStoredDetail(detail, type),
        media_links: text("media_links") || null,
        due_at: getD3DueDate(receivedAt, fields.grade),
      },
      text("team"),
      user.name,
    );
    return { vocId };
  } catch (error) {
    console.error("VOC 등록 실패", error);
    return { error: "저장하지 못했습니다. 입력값을 확인해 주세요." };
  }
}
