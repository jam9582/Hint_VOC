/**
 * PRD 9장 코드 값.
 * 화면의 선택 목록은 항상 code 표에서 읽는다. (src/lib/db/codes.ts)
 * 여기 값은 업무 규칙이 비교에 쓰는 값만 모은 것이다. (PRD 15장 결정 2)
 */

export const CODE_GROUPS = [
  "voc_type",
  "system",
  "channel",
  "grade",
  "frequency",
  "reproduced",
  "stage",
  "d4_method",
  "d4_verified",
  "d6_result",
  "d8_customer",
  "shift",
] as const;
export type CodeGroup = (typeof CODE_GROUPS)[number];

export const VOC_TYPES = [
  "NVH",
  "FUNC",
  "ELEC",
  "LEAK",
  "APPR",
  "ODOR",
  "TRIM",
  "ETC",
] as const;
export type VocType = (typeof VOC_TYPES)[number];

export const STAGES = ["D3", "D4", "D5-D6", "D6검증", "D7-D8", "종결"] as const;
export type Stage = (typeof STAGES)[number];

export const GRADE_SAFETY = "안전·법규";
export const D6_PASS = "합격";
export const D6_FAIL = "불합격";
