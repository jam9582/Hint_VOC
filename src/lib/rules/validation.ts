import type { Stage } from "@/types/codes";
import { getTypeDetailFields } from "@/types/type-detail";
import { getStageFields, type StageFieldKey } from "./stage-fields";

/** PRD 6-2, 6-5, 8장의 필수 검사. 서버 코드에서 부른다. */

export type FormProblems = { missing: string[]; invalid: string[] };
export type TypeDetail = Record<string, string>;

/** 접수 필수 항목 (6-2, 7-1). 화면에 보이는 이름과 함께 둔다. */
const REGISTER_REQUIRED = {
  received_at: "접수 일시",
  channel: "접수 경로",
  grade: "등급",
  owner: "담당",
  vin: "차대번호",
  mileage_km: "주행거리",
  voc_type: "유형",
  system: "부위 대분류",
  part_name: "부품명",
  symptom: "증상 설명",
  frequency: "발생 빈도",
  reproduced: "재현 여부",
} as const;

export type RegisterFields = Record<keyof typeof REGISTER_REQUIRED, string>;

export const REGISTER_FIELD_NAMES = Object.keys(
  REGISTER_REQUIRED,
) as (keyof RegisterFields)[];

export function hasProblems({ missing, invalid }: FormProblems) {
  return missing.length > 0 || invalid.length > 0;
}

export function validateRegistration(
  fields: RegisterFields,
  detail: TypeDetail,
): FormProblems {
  const missing: string[] = REGISTER_FIELD_NAMES.filter(
    (name) => !fields[name],
  ).map((name) => REGISTER_REQUIRED[name]);
  const invalid: string[] = [];

  if (fields.vin && fields.vin.length !== 17) {
    invalid.push("차대번호는 17자여야 합니다.");
  }
  if (fields.mileage_km && !/^\d+$/.test(fields.mileage_km)) {
    invalid.push("주행거리는 0 이상의 정수여야 합니다.");
  }

  if (fields.voc_type) {
    for (const field of getTypeDetailFields(fields.voc_type)) {
      const value = detail[field.key];
      if (!value) {
        if (field.required) missing.push(field.label);
      } else if (field.input === "integer" && !/^\d+$/.test(value)) {
        invalid.push(`${field.label}은(는) 0 이상의 정수여야 합니다.`);
      }
    }
  }

  return { missing, invalid };
}

/** 지금 단계에서 비어 있는 필수 항목의 이름을 돌려준다. (PRD 6-2) */
export function getMissingStageFields(
  stage: Stage,
  values: Partial<Record<StageFieldKey, string | null>>,
): string[] {
  return getStageFields(stage)
    .filter((field) => field.required && !values[field.key]?.trim())
    .map((field) => field.label);
}
