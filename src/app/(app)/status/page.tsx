import Form from "next/form";
import Link from "next/link";
import { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import { toSeoulDate, toSeoulDateTimeLocal } from "@/lib/dates";
import { listActiveCodes } from "@/lib/db/codes";
import { listMetricVocs, listProblemGroups } from "@/lib/db/metrics";
import {
  listStatusFilterOptions,
  listStatusRows,
  STATUS_FILTER_KEYS,
  STATUS_LIMIT,
  type StatusFilterKey,
  type StatusFilters,
  type StatusSort,
} from "@/lib/db/status";
import {
  buildTrend,
  countByStage,
  getDueState,
} from "@/lib/rules/dashboard";
import type { CodeRow } from "@/types/database";
import { DueBadge } from "../due-badge";
import { GradeTag } from "../grade-tag";
import { PageHeader } from "../page-header";
import { MetricsSummary } from "./metrics-summary";
import { OnTimeRing } from "./on-time-ring";
import { ProblemWarnings } from "./problem-warnings";
import { StageBoard } from "./stage-board";
import { StageProgress } from "./stage-progress";
import { TrendChart } from "./trend-chart";

type SearchParams = Record<string, string | string[] | undefined>;
type Option = { value: string; label: string };

function readFilters(params: SearchParams): StatusFilters {
  const filters: StatusFilters = {};
  for (const key of STATUS_FILTER_KEYS) {
    const value = params[key];
    if (typeof value === "string" && value) filters[key] = value;
  }
  return filters;
}

const readSort = (params: SearchParams): StatusSort =>
  params.sort === "due" ? "due" : "recent";

function codeOptions(codes: CodeRow[], group: string): Option[] {
  return codes
    .filter((code) => code.code_group === group)
    .map(({ code, label }) => ({ value: code, label: label ?? code }));
}

const toOptions = (values: string[]): Option[] =>
  values.map((value) => ({ value, label: value }));

function FilterSelect({
  name,
  label,
  options,
  value,
}: {
  name: StatusFilterKey;
  label: string;
  options: Option[];
  value?: string;
}) {
  return (
    <label className="field-label">
      {label}
      <select name={name} defaultValue={value ?? ""} className="input">
        <option value="">전체</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const user = await requireUser();
  const [params, vocs, groups] = await Promise.all([
    searchParams,
    listMetricVocs(),
    listProblemGroups(),
  ]);
  const now = new Date();
  const today = toSeoulDate(now);
  const open = vocs.filter((voc) => voc.stage !== "종결");
  const late = open.filter((voc) => voc.due_at < today).length;
  const dueToday = open.filter((voc) => voc.due_at === today).length;
  const urgent = late + dueToday;

  return (
    <>
      <PageHeader title="VOC 현황">
        <p className="text-[13px] text-ink-3">
          {toSeoulDateTimeLocal(now).replace("T", " ")} 기준
        </p>
      </PageHeader>

      <section className="card mb-[22px] flex flex-wrap items-center justify-between gap-4 px-6 py-5">
        <div className="flex items-center gap-4">
          <div className="grid size-[54px] shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,#61a9ff,#2940d3)] text-base font-bold text-white">
            {user.name.slice(0, 2)}
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">
              {user.name}님,{" "}
              {urgent > 0 ? (
                <Link href="/status?urgent=1&sort=due#list" className="text-link">
                  먼저 볼 VOC가 {urgent}건 있어요 ›
                </Link>
              ) : (
                "먼저 볼 VOC가 없어요"
              )}
            </h2>
            <p className="mt-0.5 text-[13px] font-medium text-ink-2">
              기한 초과 <b className="text-late">{late}건</b> · 오늘 기한{" "}
              {dueToday}건 ·{" "}
              <Link href="#groups" className="text-link">
                같은 문제 묶음 {groups.length}개
              </Link>
            </p>
          </div>
        </div>
        <Link href="/register" className="btn">
          새 VOC 등록
        </Link>
      </section>

      <div className="mb-[22px] grid gap-[22px] xl:grid-cols-[minmax(240px,1fr)_minmax(0,2.6fr)]">
        <OnTimeRing
          open={open.length}
          late={late}
          soon={
            open.filter(
              (voc) => getDueState(voc.stage, voc.due_at, today) === "soon",
            ).length
          }
        />
        <section className="card min-w-0 p-5">
          <h2 className="card-title">핵심 지표</h2>
          <MetricsSummary overdueOnly={params.overdue === "1"} />
          <TrendChart
            trend={buildTrend(vocs, today, (value) =>
              toSeoulDate(new Date(value)),
            )}
          />
        </section>
      </div>

      <StageBoard counts={countByStage(vocs, today)} />
    </>
  );
}

function ListTabs({
  params,
  sort,
  mine,
}: {
  params: SearchParams;
  sort: StatusSort;
  mine: string;
}) {
  const query = new URLSearchParams(
    Object.entries(params).flatMap(([key, value]) =>
      typeof value === "string" && key !== "sort" ? [[key, value]] : [],
    ),
  );
  const isMine = params.owner === mine;
  // 내 담당을 보다가 다른 탭을 누르면 담당 조건을 푼다.
  const hrefOf = (nextSort: StatusSort, owner?: string) => {
    const next = new URLSearchParams(query);
    if (isMine) next.delete("owner");
    if (owner) next.set("owner", owner);
    if (nextSort === "due") next.set("sort", "due");
    const text = next.toString();
    return text ? `/status?${text}` : "/status";
  };
  const tabs = [
    { label: "최근 접수", href: hrefOf("recent"), on: sort === "recent" && !isMine },
    { label: "기한순", href: hrefOf("due"), on: sort === "due" && !isMine },
    { label: "내 담당", href: hrefOf(sort, mine), on: isMine },
  ];

  return (
    <div className="flex gap-1 rounded-md bg-inset p-[3px]">
      {tabs.map((tab) => (
        <Link
          key={tab.label}
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
  );
}

async function StatusContent({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const filters = readFilters(params);
  const sort = readSort(params);
  const overdueOnly = params.overdue === "1";
  const urgentOnly = params.urgent === "1";
  const today = toSeoulDate(new Date());
  const [{ rows, total }, codes, { models, owners }] = await Promise.all([
    listStatusRows(filters, {
      sort,
      overdueBefore: overdueOnly ? today : undefined,
      dueThrough: urgentOnly ? today : undefined,
    }),
    listActiveCodes(),
    listStatusFilterOptions(),
  ]);

  const labelOf = (group: string, value: string) =>
    codes.find((code) => code.code_group === group && code.code === value)
      ?.label ?? value;

  return (
    <section id="list" className="card h-fit min-w-0 scroll-mt-20 pt-5 pb-1.5">
      <div className="flex flex-wrap items-center justify-between gap-3 px-[22px]">
        <h2 className="card-title">
          {overdueOnly
            ? "기한 초과 VOC"
            : urgentOnly
              ? "먼저 볼 VOC (기한 초과 · 오늘 기한)"
              : "VOC 목록"}
        </h2>
        <ListTabs params={params} sort={sort} mine={user.name} />
      </div>

      {/* 초기화하면 선택 칸도 비워지도록 조건마다 새로 그린다. */}
      <Form
        key={JSON.stringify(filters)}
        action="/status"
        className="mt-4 grid grid-cols-2 items-end gap-3 px-[22px] md:grid-cols-3 xl:grid-cols-6"
      >
        {sort === "due" && <input type="hidden" name="sort" value="due" />}
        {overdueOnly && <input type="hidden" name="overdue" value="1" />}
        {urgentOnly && <input type="hidden" name="urgent" value="1" />}
        <FilterSelect
          name="stage"
          label="단계"
          value={filters.stage}
          options={codeOptions(codes, "stage")}
        />
        <FilterSelect
          name="grade"
          label="등급"
          value={filters.grade}
          options={codeOptions(codes, "grade")}
        />
        <FilterSelect
          name="voc_type"
          label="유형"
          value={filters.voc_type}
          options={codeOptions(codes, "voc_type")}
        />
        <FilterSelect
          name="system"
          label="부위"
          value={filters.system}
          options={codeOptions(codes, "system")}
        />
        <FilterSelect
          name="model"
          label="차종"
          value={filters.model}
          options={toOptions(models)}
        />
        <FilterSelect
          name="owner"
          label="담당"
          value={filters.owner}
          options={toOptions(owners)}
        />
        <div className="col-span-full flex items-center gap-3">
          <button type="submit" className="btn btn-sm">
            거르기
          </button>
          <Link href="/status" className="text-link text-xs">
            초기화
          </Link>
          <p className="ml-auto text-xs font-medium text-ink-3">
            {total > STATUS_LIMIT
              ? `전체 ${total}건 중 ${STATUS_LIMIT}건을 보여 줍니다. 조건을 좁혀 주세요.`
              : `${total}건`}
          </p>
        </div>
      </Form>

      {rows.length === 0 ? (
        <p className="px-[22px] py-8 text-center text-ink-2">
          조건에 맞는 VOC가 없습니다.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[46rem] border-collapse text-left">
            <thead>
              <tr>
                {["VOC", "등급", "유형 · 부품", "진행", "담당", "기한"].map(
                  (title) => (
                    <th
                      key={title}
                      scope="col"
                      className="bg-inset px-3 py-2.5 text-xs font-semibold text-ink-2 first:pl-[22px]"
                    >
                      {title}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const overdue = row.stage !== "종결" && row.due_at < today;
                return (
                  <tr
                    key={row.voc_id}
                    data-overdue={overdue}
                    className={`relative border-b border-line last:border-b-0 ${
                      overdue
                        ? "bg-late-bg/50 hover:bg-late-bg"
                        : "hover:bg-inset"
                    }`}
                  >
                    <td className="py-3 pr-3 pl-[22px] whitespace-nowrap">
                      <Link
                        href={`/vocs/${row.voc_id}`}
                        className="text-[13px] font-semibold after:absolute after:inset-0"
                      >
                        {row.voc_id}
                      </Link>
                      <small className="block text-xs font-medium text-ink-3">
                        {row.model ?? "차종 없음"} ·{" "}
                        {toSeoulDate(new Date(row.received_at)).slice(5)} 접수
                      </small>
                    </td>
                    <td className="p-3">
                      <GradeTag
                        grade={row.grade}
                        label={labelOf("grade", row.grade)}
                      />
                    </td>
                    <td className="max-w-64 p-3 text-[13px] font-medium">
                      <span className="block truncate">
                        {labelOf("voc_type", row.voc_type)} ·{" "}
                        {labelOf("system", row.system)}
                      </span>
                      <small className="block truncate text-xs text-ink-3">
                        {row.part_name}
                      </small>
                    </td>
                    <td className="p-3">
                      <StageProgress stage={row.stage} overdue={overdue} />
                    </td>
                    <td className="p-3 text-[13px] font-medium whitespace-nowrap">
                      {row.owner}
                    </td>
                    <td className="p-3">
                      <DueBadge
                        stage={row.stage}
                        dueAt={row.due_at}
                        today={today}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

const Skeleton = ({ className }: { className: string }) => (
  <div className={`card animate-pulse ${className}`} />
);

export default function StatusPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return (
    <main className="px-4 py-5 lg:px-7 lg:py-[22px]">
      <Suspense fallback={<Skeleton className="mb-[22px] h-96" />}>
        <Dashboard searchParams={searchParams} />
      </Suspense>
      <div className="grid gap-[22px] xl:grid-cols-[minmax(0,1fr)_300px]">
        <Suspense fallback={<Skeleton className="h-80" />}>
          <StatusContent searchParams={searchParams} />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-80" />}>
          <ProblemWarnings />
        </Suspense>
      </div>
    </main>
  );
}
