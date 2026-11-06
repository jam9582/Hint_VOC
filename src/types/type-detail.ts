import type { VocType } from "./codes";

/** PRD 8장 유형별 추가 항목. voc.type_detail(jsonb)에 {키: 값}으로 저장한다. */

export type TypeDetailField = {
  key: string;
  label: string;
  required: boolean;
} & (
  | { input: "select"; options: readonly string[] }
  | { input: "text" }
  | { input: "integer"; unit: string }
);

const WARNING_LAMP = ["있음", "없음"] as const;

/** 유형 전용 항목. ETC는 전용 항목이 없다. */
export const TYPE_DETAIL_FIELDS: Record<VocType, readonly TypeDetailField[]> = {
  NVH: [
    {
      key: "sound_kind",
      label: "소리 성격",
      required: true,
      input: "select",
      options: ["덜그럭", "찌익", "딱딱", "웅웅", "떨림", "기타"],
    },
    {
      key: "road",
      label: "노면 조건",
      required: true,
      input: "select",
      options: ["요철·방지턱", "비포장", "평탄한 길도", "모름"],
    },
    {
      key: "speed",
      label: "속도 구간",
      required: false,
      input: "select",
      options: ["정차", "저속", "중속", "고속", "모름"],
    },
    {
      key: "press_test",
      label: "눌렀을 때 멈춤",
      required: false,
      input: "select",
      options: ["멈춤", "안 멈춤", "안 해봄"],
    },
  ],
  FUNC: [
    {
      key: "failure_mode",
      label: "고장 형태",
      required: true,
      input: "select",
      options: ["작동 안 함", "간헐 작동", "오작동"],
    },
    {
      key: "warning_lamp",
      label: "경고등",
      required: false,
      input: "select",
      options: WARNING_LAMP,
    },
  ],
  ELEC: [
    {
      key: "warning_lamp",
      label: "경고등",
      required: true,
      input: "select",
      options: WARNING_LAMP,
    },
    { key: "dtc", label: "고장 코드(DTC)", required: false, input: "text" },
    {
      key: "sw_version",
      label: "소프트웨어 버전",
      required: false,
      input: "text",
    },
  ],
  LEAK: [
    {
      key: "fluid",
      label: "유체 종류",
      required: true,
      input: "select",
      options: ["물", "오일", "냉각수", "기타"],
    },
    {
      key: "trigger",
      label: "발생 상황",
      required: true,
      input: "select",
      options: ["우천", "세차", "주행 후", "상시"],
    },
  ],
  APPR: [
    {
      key: "damage",
      label: "손상 형태",
      required: true,
      input: "select",
      options: ["긁힘", "들뜸", "색 차이", "부식", "기타"],
    },
    { key: "size_mm", label: "크기", required: false, input: "integer", unit: "mm" },
    {
      key: "since_delivery",
      label: "출고 때부터",
      required: true,
      input: "select",
      options: ["예", "아니오", "모름"],
    },
  ],
  ODOR: [
    {
      key: "odor_kind",
      label: "냄새 종류",
      required: true,
      input: "select",
      options: ["곰팡이", "탄 냄새", "연료", "기타"],
    },
    {
      key: "hvac_mode",
      label: "공조 상태",
      required: false,
      input: "select",
      options: ["냉방", "난방", "송풍", "꺼짐"],
    },
  ],
  TRIM: [
    {
      key: "defect",
      label: "결함 형태",
      required: true,
      input: "select",
      options: ["단차", "유격", "들뜸", "기타"],
    },
  ],
  ETC: [],
};

/** 모든 유형(ETC 포함)에 나오는 공통 추가 항목. */
export const COMMON_DETAIL_FIELDS: readonly TypeDetailField[] = [
  {
    key: "repair_history",
    label: "이전 정비",
    required: false,
    input: "select",
    options: ["없음", "내장재 탈착", "용품 장착", "사고 수리", "기타"],
  },
];

/** 고른 유형의 폼에 보여 줄 항목 전체. */
export function getTypeDetailFields(type: VocType): readonly TypeDetailField[] {
  return [...TYPE_DETAIL_FIELDS[type], ...COMMON_DETAIL_FIELDS];
}
