"use server";

import { requireUser } from "@/lib/auth";
import { fromSeoulDateTimeLocal } from "@/lib/dates";
import { registerVoc } from "@/lib/db/vocs";
import { getD3DueDate } from "@/lib/rules/due-date";
import { VOC_TYPES, type VocType } from "@/types/codes";
import type { Json } from "@/types/database";
import { getTypeDetailFields } from "@/types/type-detail";

export type RegisterResult = { vocId: string } | { error: string };

function isVocType(value: string): value is VocType {
  return (VOC_TYPES as readonly string[]).includes(value);
}

/** 8장 표에 있는 항목만 골라 담는다. */
function readTypeDetail(formData: FormData, type: VocType) {
  const detail: Record<string, Json> = {};
  for (const field of getTypeDetailFields(type)) {
    const value = String(formData.get(`detail.${field.key}`) ?? "").trim();
    if (!value) continue;
    detail[field.key] = field.input === "integer" ? Number(value) : value;
  }
  return Object.keys(detail).length > 0 ? detail : null;
}

export async function registerVocAction(
  formData: FormData,
): Promise<RegisterResult> {
  const user = await requireUser();

  const text = (name: string) => String(formData.get(name) ?? "").trim();
  const voc_type = text("voc_type");
  const receivedAt = fromSeoulDateTimeLocal(text("received_at"));
  if (!isVocType(voc_type) || !receivedAt) {
    return { error: "접수 일시와 유형을 확인해 주세요." };
  }

  const grade = text("grade");
  try {
    const vocId = await registerVoc(
      {
        received_at: receivedAt.toISOString(),
        channel: text("channel"),
        grade,
        owner: text("owner"),
        vin: text("vin"),
        mileage_km: Number(text("mileage_km")),
        voc_type,
        system: text("system"),
        part_name: text("part_name"),
        part_no: text("part_no") || null,
        symptom: text("symptom"),
        frequency: text("frequency"),
        reproduced: text("reproduced"),
        type_detail: readTypeDetail(formData, voc_type),
        media_links: text("media_links") || null,
        due_at: getD3DueDate(receivedAt, grade),
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
