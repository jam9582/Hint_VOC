import Link from "next/link";
import { toSeoulDate } from "@/lib/dates";
import type { MetricVoc } from "@/lib/rules/metrics";
import { GradeTag } from "../grade-tag";

export type ReportVoc = Pick<
  MetricVoc,
  | "voc_id"
  | "received_at"
  | "closed_at"
  | "grade"
  | "voc_type"
  | "system"
  | "part_name"
  | "stage"
  | "owner"
>;

/** 8D 보고서 목록. 줄을 누르면 보고서가 열리고, Word는 바로 받는다. */
export function ReportTable({
  vocs,
  closed,
  labelOf,
}: {
  vocs: ReportVoc[];
  closed: boolean;
  labelOf: (group: string, value: string) => string;
}) {
  const titles = [
    "VOC",
    "등급",
    "유형 · 부품",
    "담당",
    closed ? "종결일" : "단계",
    "내보내기",
  ];

  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-[46rem] border-collapse text-left">
        <thead>
          <tr>
            {titles.map((title) => (
              <th
                key={title}
                scope="col"
                className="bg-inset px-3 py-2.5 text-xs font-semibold text-ink-2 first:pl-[22px]"
              >
                {title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {vocs.map((voc) => (
            <tr
              key={voc.voc_id}
              className="relative border-b border-line last:border-b-0 hover:bg-inset"
            >
              <td className="py-3 pr-3 pl-[22px] whitespace-nowrap">
                <Link
                  href={`/vocs/${voc.voc_id}/report`}
                  className="text-[13px] font-semibold after:absolute after:inset-0"
                >
                  {voc.voc_id}
                </Link>
                <small className="block text-xs font-medium text-ink-3">
                  {toSeoulDate(new Date(voc.received_at)).slice(5)} 접수
                </small>
              </td>
              <td className="p-3">
                <GradeTag grade={voc.grade} label={labelOf("grade", voc.grade)} />
              </td>
              <td className="max-w-64 p-3 text-[13px] font-medium">
                <span className="block truncate">
                  {labelOf("voc_type", voc.voc_type)} ·{" "}
                  {labelOf("system", voc.system)}
                </span>
                <small className="block truncate text-xs text-ink-3">
                  {voc.part_name}
                </small>
              </td>
              <td className="p-3 text-[13px] font-medium whitespace-nowrap">
                {voc.owner}
              </td>
              <td className="p-3 text-[13px] font-medium whitespace-nowrap">
                {closed && voc.closed_at
                  ? toSeoulDate(new Date(voc.closed_at))
                  : voc.stage}
              </td>
              <td className="p-3">
                {/* 줄 전체 링크보다 위에 놓아야 눌린다. */}
                <a
                  href={`/vocs/${voc.voc_id}/report/word`}
                  download
                  className="btn btn-light btn-sm relative z-10"
                >
                  Word
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
