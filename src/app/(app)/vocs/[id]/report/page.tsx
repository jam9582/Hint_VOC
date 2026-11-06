import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import { toSeoulDate } from "@/lib/dates";
import { getVocReport } from "@/lib/db/report";
import {
  EMPTY_VALUE,
  reportToHtml,
  reportToText,
  type ReportRow,
} from "@/lib/rules/report";
import { ReportActions } from "./report-actions";

function Rows({ rows }: { rows: ReportRow[] }) {
  return (
    <dl className="divide-y divide-line border border-line">
      {rows.map((row, index) => (
        <div
          key={`${row.label}-${index}`}
          className="grid grid-cols-[130px_minmax(0,1fr)] print:break-inside-avoid"
        >
          <dt className="bg-inset px-3 py-2 text-xs font-semibold text-ink-2">
            {row.label}
          </dt>
          <dd
            className={`px-3 py-2 text-[13px] font-medium break-words whitespace-pre-wrap ${row.value === EMPTY_VALUE ? "text-ink-3" : ""}`}
          >
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function Block({ title, rows }: { title: string; rows: ReportRow[] }) {
  return (
    <section className="mt-5">
      <h3 className="mb-2 text-sm font-semibold print:break-after-avoid">
        {title}
      </h3>
      <Rows rows={rows} />
    </section>
  );
}

async function ReportContent({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  const report = await getVocReport(id);
  if (!report) notFound();

  return (
    <>
      <header className="mb-[18px] flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href={`/vocs/${report.vocId}`} className="text-link text-[13px]">
          상세로 돌아가기
        </Link>
        <ReportActions
          vocId={report.vocId}
          text={reportToText(report)}
          html={reportToHtml(report)}
        />
      </header>

      {!report.closed && (
        <p
          role="status"
          className="mb-[18px] rounded-md bg-soon-bg px-4 py-2.5 text-[13px] font-semibold text-soon-ink print:hidden"
        >
          아직 종결되지 않은 VOC입니다. 입력 전 항목은 “{EMPTY_VALUE}”로
          나옵니다.
        </p>
      )}

      <article className="card mx-auto max-w-[860px] px-8 py-7 print:max-w-none print:p-0 print:shadow-none">
        <div className="flex flex-wrap items-end justify-between gap-2 border-b-2 border-ink pb-3">
          <div>
            <h2 className="text-xl font-bold">8D 보고서</h2>
            <p className="text-[13px] font-medium text-ink-2">{report.vocId}</p>
          </div>
          <p className="text-xs font-medium text-ink-2">
            상태: {report.status} · 출력일 {toSeoulDate(new Date())}
          </p>
        </div>

        <Block title="기본 정보" rows={report.summary} />
        {report.sections.map((section) => (
          <Block
            key={section.code}
            title={`${section.code} ${section.title}`}
            rows={section.rows}
          />
        ))}
        <Block title="단계 이력" rows={report.history} />
      </article>
    </>
  );
}

export default function VocReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <main className="px-4 py-5 lg:px-7 lg:py-[22px] print:p-0">
      <Suspense fallback={<div className="card h-96 animate-pulse" />}>
        <ReportContent params={params} />
      </Suspense>
    </main>
  );
}
