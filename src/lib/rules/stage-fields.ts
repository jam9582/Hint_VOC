import type { CodeGroup, Stage } from "@/types/codes";
import type { Voc8dRow } from "@/types/database";

/** 단계별 입력 항목 (PRD 6-2, 7-2). 상세 화면과 필수 검사가 함께 쓴다. */

export type StageFieldKey = keyof Omit<Voc8dRow, "voc_id">;

export type StageField = {
  key: StageFieldKey;
  label: string;
  required: boolean;
} & (
  | { input: "textarea" }
  | { input: "text"; maxLength: number; placeholder?: string }
  | { input: "select"; codeGroup: CodeGroup }
);

export type StageSection = {
  stage: Exclude<Stage, "종결">;
  title: string;
  fields: readonly StageField[];
};

export const STAGE_SECTIONS: readonly StageSection[] = [
  {
    stage: "D3",
    title: "D3 임시 봉쇄",
    fields: [
      {
        key: "d3_scope",
        label: "봉쇄 범위",
        required: true,
        input: "textarea",
      },
      {
        key: "d3_action",
        label: "봉쇄 조치",
        required: true,
        input: "textarea",
      },
    ],
  },
  {
    stage: "D4",
    title: "D4 근본 원인",
    fields: [
      {
        key: "d4_occur_cause",
        label: "발생 원인",
        required: true,
        input: "textarea",
      },
      {
        key: "d4_escape_cause",
        label: "유출 원인",
        required: true,
        input: "textarea",
      },
      {
        key: "d4_method",
        label: "분석 방법",
        required: false,
        input: "select",
        codeGroup: "d4_method",
      },
      {
        key: "d4_verified",
        label: "재현 검증 결과",
        required: true,
        input: "select",
        codeGroup: "d4_verified",
      },
    ],
  },
  {
    stage: "D5-D6",
    title: "D5~D6 대책",
    fields: [
      {
        key: "d5_occur_action",
        label: "발생 대책",
        required: true,
        input: "textarea",
      },
      {
        key: "d5_escape_action",
        label: "유출 대책",
        required: true,
        input: "textarea",
      },
      {
        key: "d6_cutover",
        label: "적용 시작 차대번호 또는 LOT",
        required: true,
        input: "text",
        maxLength: 50,
      },
      {
        key: "d6_criteria",
        label: "검증 기준",
        required: true,
        input: "textarea",
      },
    ],
  },
  {
    stage: "D6검증",
    title: "D6 효과 검증",
    fields: [
      {
        key: "d6_result",
        label: "검증 결과",
        required: true,
        input: "select",
        codeGroup: "d6_result",
      },
      {
        key: "d6_evidence",
        label: "검증 근거",
        required: true,
        input: "textarea",
      },
    ],
  },
  {
    stage: "D7-D8",
    title: "D7~D8 종결",
    fields: [
      {
        key: "d7_docs",
        label: "표준 반영 문서",
        required: true,
        input: "text",
        maxLength: 200,
      },
      {
        key: "d7_horizontal",
        label: "수평 전개 대상",
        required: true,
        input: "text",
        maxLength: 200,
        placeholder: '없으면 "없음"',
      },
      {
        key: "d8_customer",
        label: "고객 확인 결과",
        required: true,
        input: "select",
        codeGroup: "d8_customer",
      },
    ],
  },
];

export function getStageFields(stage: Stage): readonly StageField[] {
  return (
    STAGE_SECTIONS.find((section) => section.stage === stage)?.fields ?? []
  );
}
