import { VOC_TYPES, type Stage, type VocType } from "@/types/codes";
import type { Voc8dRow } from "@/types/database";
import { getTypeDetailFields } from "@/types/type-detail";

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

export function isVocType(value: string): value is VocType {
  return (VOC_TYPES as readonly string[]).includes(value);
}

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

  if (fields.voc_type && !isVocType(fields.voc_type)) {
    invalid.push("유형을 다시 선택해 주세요.");
  } else if (isVocType(fields.voc_type)) {
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

type StageField = keyof Omit<Voc8dRow, "voc_id">;

/** 단계별 필수 항목 (6-2). 이 항목이 모두 차야 다음 단계로 넘어간다. */
const STAGE_REQUIRED: Record<Stage, Partial<Record<StageField, string>>> = {
  D3: { d3_scope: "봉쇄 범위", d3_action: "봉쇄 조치" },
  D4: {
    d4_occur_cause: "발생 원인",
    d4_escape_cause: "유출 원인",
    d4_verified: "재현 검증 결과",
  },
  "D5-D6": {
    d5_occur_action: "발생 대책",
    d5_escape_action: "유출 대책",
    d6_cutover: "적용 시작 차대번호 또는 LOT",
    d6_criteria: "검증 기준",
  },
  D6검증: { d6_result: "검증 결과", d6_evidence: "검증 근거" },
  "D7-D8": {
    d7_docs: "표준 반영 문서",
    d7_horizontal: "수평 전개 대상",
    d8_customer: "고객 확인 결과",
  },
  종결: {},
};

/** 지금 단계에서 비어 있는 필수 항목의 이름을 돌려준다. */
export function getMissingStageFields(
  stage: Stage,
  values: Partial<Record<StageField, string | null>>,
): string[] {
  return Object.entries(STAGE_REQUIRED[stage])
    .filter(([key]) => !values[key as StageField]?.trim())
    .map(([, label]) => label);
}
