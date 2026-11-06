import Link from "next/link";
import { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import { listActiveCodes } from "@/lib/db/codes";
import { listMetricVocs } from "@/lib/db/metrics";
import { PageHeader } from "../page-header";
import { ReportTable } from "./report-table";

type SearchParams = Record<string, string | string[] | undefined>;

async function ReportsContent({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireUser();
  const [params, vocs, codes] = await Promise.all([
    searchParams,
    listMetricVocs(),
    listActiveCodes(),
  ]);
  const closed = params.state !== "open";
  const finished = vocs
    .filter((voc) => voc.closed_at)
    .sort((a, b) => (b.closed_at as string).localeCompare(a.closed_at as string));
  const open = vocs
    .filter((voc) => !voc.closed_at)
    .sort((a, b) => b.received_at.localeCompare(a.received_at));
  const rows = closed ? finished : open;
  const labelOf = (group: string, value: string) =>
    codes.find((code) => code.code_group === group && code.code === value)
      ?.label ?? value;
  const tabs = [
    { label: `종결 ${finished.length}`, href: "/reports", on: closed },
    {
      label: `진행 중 ${open.length}`,
      href: "/reports?state=open",
      on: !closed,
    },
  ];

  return (
    <section className="card min-w-0 pt-5 pb-1.5">
      <div className="flex flex-wrap items-center justify-between gap-3 px-[22px]">
        <h2 className="card-title">
          {closed ? "종결된 VOC 보고서" : "작성 중인 보고서"}
        </h2>
        <div className="flex gap-1 rounded-md bg-inset p-[3px]">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={tab.on ? "true" : undefined}
              className={`rounded-[5px] px-3 py-[5px] text-xs font-semibold ${
                tab.on ? "bg-card text-primary shadow-card" : "text-ink-2"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>
      {rows.length === 0 ? (
        <p className="px-[22px] py-8 text-center text-ink-2">
          {closed ? "종결된 VOC가 없습니다." : "진행 중인 VOC가 없습니다."}
        </p>
      ) : (
        <ReportTable vocs={rows} closed={closed} labelOf={labelOf} />
      )}
    </section>
  );
}

export default function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return (
    <main className="px-4 py-5 lg:px-7 lg:py-[22px]">
      <PageHeader title="8D 보고서" />
      <Suspense fallback={<div className="card h-80 animate-pulse" />}>
        <ReportsContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
