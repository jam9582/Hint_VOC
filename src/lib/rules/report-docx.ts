import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Packer,
  PageNumber,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import { EMPTY_VALUE, type Report, type ReportRow } from "@/lib/rules/report";

/** 8D 보고서를 Word 파일로 만든다. 받은 사람이 고칠 수 있도록 표와 글자로만 구성한다. */

// Word의 길이 단위는 1/20pt다. A4 용지에 좌우 여백 2cm를 뺀 폭이 표 폭이다.
const PAGE = { width: 11906, height: 16838, margin: 1134 };
const LABEL_WIDTH = 2200;
const VALUE_WIDTH = PAGE.width - PAGE.margin * 2 - LABEL_WIDTH;

const FONT = "Malgun Gothic";
const BORDER = { style: BorderStyle.SINGLE, size: 4, color: "BBBBBB" };
const CELL_BORDERS = {
  top: BORDER,
  bottom: BORDER,
  left: BORDER,
  right: BORDER,
};
const CELL_MARGINS = { top: 60, bottom: 60, left: 100, right: 100 };

/** Word가 읽지 못하는 제어 문자는 파일을 깨뜨리므로 뺀다. */
const cleanText = (value: string) =>
  value.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "");

function valueRuns(value: string) {
  const color = value === EMPTY_VALUE ? "8A8A8A" : undefined;
  return cleanText(value)
    .split(/\r?\n/)
    .map(
      (line, index) =>
        new TextRun({ text: line, color, break: index > 0 ? 1 : undefined }),
    );
}

function rowOf({ label, value }: ReportRow) {
  return new TableRow({
    cantSplit: true,
    children: [
      new TableCell({
        width: { size: LABEL_WIDTH, type: WidthType.DXA },
        borders: CELL_BORDERS,
        margins: CELL_MARGINS,
        shading: { type: ShadingType.CLEAR, color: "auto", fill: "F2F2F2" },
        children: [
          new Paragraph({
            children: [new TextRun({ text: cleanText(label), bold: true })],
          }),
        ],
      }),
      new TableCell({
        width: { size: VALUE_WIDTH, type: WidthType.DXA },
        borders: CELL_BORDERS,
        margins: CELL_MARGINS,
        children: [new Paragraph({ children: valueRuns(value) })],
      }),
    ],
  });
}

function block(title: string, rows: ReportRow[]) {
  return [
    new Paragraph({
      keepNext: true,
      spacing: { before: 280, after: 100 },
      children: [new TextRun({ text: title, bold: true, size: 24 })],
    }),
    new Table({
      layout: TableLayoutType.FIXED,
      width: { size: LABEL_WIDTH + VALUE_WIDTH, type: WidthType.DXA },
      columnWidths: [LABEL_WIDTH, VALUE_WIDTH],
      rows: rows.map(rowOf),
    }),
  ];
}

export async function reportToDocx(report: Report, printedOn: string) {
  const document = new Document({
    title: `8D 보고서 ${report.vocId}`,
    styles: {
      default: {
        document: {
          run: {
            size: 20,
            font: { ascii: FONT, eastAsia: FONT, hAnsi: FONT, cs: FONT },
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: PAGE.width, height: PAGE.height },
            margin: {
              top: PAGE.margin,
              bottom: PAGE.margin,
              left: PAGE.margin,
              right: PAGE.margin,
            },
          },
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    size: 16,
                    color: "8A8A8A",
                    children: [`${report.vocId} · `, PageNumber.CURRENT],
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          new Paragraph({
            children: [new TextRun({ text: "8D 보고서", bold: true, size: 36 })],
          }),
          new Paragraph({
            spacing: { before: 60 },
            children: [
              new TextRun({
                text: `${report.vocId} · 상태: ${report.status} · 출력일 ${printedOn}`,
                color: "5F6B85",
              }),
            ],
          }),
          ...block("기본 정보", report.summary),
          ...report.sections.flatMap((section) =>
            block(`${section.code} ${section.title}`, section.rows),
          ),
          ...block("단계 이력", report.history),
        ],
      },
    ],
  });

  return Packer.toBuffer(document);
}
