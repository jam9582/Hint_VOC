import { toSeoulDateTimeLocal } from "@/lib/dates";
import type { VocDetail } from "@/lib/db/vocs";
import { STAGE_SECTIONS, type StageFieldKey } from "@/lib/rules/stage-fields";
import type { CodeOptions } from "@/types/codes";
import { getTypeDetailFields } from "@/types/type-detail";

/** VOC 한 건을 D1~D8 순서의 8D 보고서로 묶는다. 화면, 복사, PDF가 모두 이 내용을 쓴다. */

export const EMPTY_VALUE = "미입력";

export type ReportRow = { label: string; value: string };
export type ReportSection = {
  code: string;
  title: string;
  rows: ReportRow[];
};
export type Report = {
  vocId: string;
  closed: boolean;
  status: string;
  summary: ReportRow[];
  sections: ReportSection[];
  history: ReportRow[];
};

type LabelOf = (group: keyof CodeOptions, value: string) => string;

const STAGE_FIELDS = STAGE_SECTIONS.flatMap((section) => section.fields);

const formatDateTime = (value: string | null) =>
  value && toSeoulDateTimeLocal(new Date(value)).replace("T", " ");

const row = (label: string, value: string | number | null | undefined) => ({
  label,
  value: value === null || value === undefined || value === "" ? EMPTY_VALUE : String(value),
});

export function buildReport(detail: VocDetail, labelOf: LabelOf): Report {
  const { voc, voc8d, logs } = detail;
  const closed = voc.stage === "종결";
  const typeDetail = (voc.type_detail ?? {}) as Record<string, string | number>;

  /** 입력 항목 이름과 코드 이름은 상세 화면과 같은 정의에서 가져온다. */
  const fieldRows = (keys: readonly StageFieldKey[]) =>
    keys.map((key) => {
      const field = STAGE_FIELDS.find((item) => item.key === key);
      const value = voc8d[key];
      const shown =
        field?.input === "select" && value
          ? labelOf(field.codeGroup, value)
          : value;
      return row(field?.label ?? key, shown);
    });

  return {
    vocId: voc.voc_id,
    closed,
    status: closed ? "종결" : `진행 중 (${voc.stage} 단계)`,
    summary: [
      row("VOC 번호", voc.voc_id),
      row("접수 일시", formatDateTime(voc.received_at)),
      row("접수 경로", labelOf("channel", voc.channel)),
      row("등급", labelOf("grade", voc.grade)),
      row("처리 기한", voc.due_at),
      row("종결 일시", closed ? formatDateTime(voc.closed_at) : "-"),
    ],
    sections: [
      {
        code: "D1",
        title: "팀 구성",
        rows: [row("담당자", voc.owner), row("팀 구성", voc8d.team)],
      },
      {
        code: "D2",
        title: "문제 설명",
        rows: [
          row("부품명", voc.part_name),
          row("부품 번호", voc.part_no),
          row("차대번호", voc.vin),
          row("주행거리 (km)", voc.mileage_km),
          row("유형", labelOf("voc_type", voc.voc_type)),
          row("부위", labelOf("system", voc.system)),
          row("발생 빈도", labelOf("frequency", voc.frequency)),
          row("재현 여부", labelOf("reproduced", voc.reproduced)),
          ...getTypeDetailFields(voc.voc_type).map((field) =>
            row(field.label, typeDetail[field.key]),
          ),
          row("증상 설명", voc.symptom),
          row("사진·영상 링크", voc.media_links),
        ],
      },
      {
        code: "D3",
        title: "임시 봉쇄",
        rows: [
          ...fieldRows(["d3_scope", "d3_action"]),
          row("완료 일시", formatDateTime(voc8d.d3_done_at)),
        ],
      },
      {
        code: "D4",
        title: "근본 원인",
        rows: [
          ...fieldRows([
            "d4_occur_cause",
            "d4_escape_cause",
            "d4_method",
            "d4_verified",
          ]),
          row("완료 일시", formatDateTime(voc8d.d4_done_at)),
        ],
      },
      {
        code: "D5",
        title: "영구 대책",
        rows: fieldRows(["d5_occur_action", "d5_escape_action"]),
      },
      {
        code: "D6",
        title: "대책 적용과 효과 검증",
        rows: fieldRows([
          "d6_cutover",
          "d6_criteria",
          "d6_result",
          "d6_evidence",
        ]),
      },
      {
        code: "D7",
        title: "재발 방지",
        rows: fieldRows(["d7_docs", "d7_horizontal"]),
      },
      {
        code: "D8",
        title: "종결",
        rows: fieldRows(["d8_customer"]),
      },
    ],
    // 이력은 최신순으로 읽어 오므로 보고서에서는 시간순으로 뒤집는다.
    history: [...logs].reverse().map((log) => ({
      label: `${log.from_stage ?? "접수"} → ${log.to_stage}`,
      value: [formatDateTime(log.changed_at), log.changed_by, log.note]
        .filter(Boolean)
        .join(" · "),
    })),
  };
}

/** 메일 본문이나 메모장에 붙여 넣는 글자 형식. */
export function reportToText(report: Report): string {
  const block = (title: string, rows: ReportRow[]) =>
    [`[${title}]`, ...rows.map((item) => `${item.label}: ${item.value}`)].join(
      "\n",
    );

  return [
    `8D 보고서 - ${report.vocId}\n상태: ${report.status}`,
    block("기본 정보", report.summary),
    ...report.sections.map((section) =>
      block(`${section.code} ${section.title}`, section.rows),
    ),
    block("단계 이력", report.history),
  ].join("\n\n");
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** Word나 메일에 표 모양 그대로 붙여 넣는 형식. 붙여 넣는 곳에 CSS가 없어 style을 직접 쓴다. */
export function reportToHtml(report: Report): string {
  const cell = "border:1px solid #bbb;padding:6px 8px;vertical-align:top;";
  const table = (title: string, rows: ReportRow[]) => {
    const body = rows
      .map(
        (item) =>
          `<tr><th style="${cell}width:160px;text-align:left;background:#f2f2f2;">${escapeHtml(item.label)}</th>` +
          `<td style="${cell}">${escapeHtml(item.value).replace(/\n/g, "<br>")}</td></tr>`,
      )
      .join("");
    return (
      `<h3 style="margin:16px 0 6px;">${escapeHtml(title)}</h3>` +
      `<table style="border-collapse:collapse;width:100%;">${body}</table>`
    );
  };

  return [
    `<h2>8D 보고서 - ${escapeHtml(report.vocId)}</h2>`,
    `<p>상태: ${escapeHtml(report.status)}</p>`,
    table("기본 정보", report.summary),
    ...report.sections.map((section) =>
      table(`${section.code} ${section.title}`, section.rows),
    ),
    table("단계 이력", report.history),
  ].join("");
}
