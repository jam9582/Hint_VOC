import Form from "next/form";
import Link from "next/link";
import { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import { toSeoulDate } from "@/lib/dates";
import { listActiveCodes } from "@/lib/db/codes";
import {
  listStatusFilterOptions,
  listStatusRows,
  STATUS_FILTER_KEYS,
  STATUS_LIMIT,
  type StatusFilterKey,
  type StatusFilters,
} from "@/lib/db/status";
import type { CodeRow } from "@/types/database";
import { MetricsSummary } from "./metrics-summary";
import { ProblemWarnings } from "./problem-warnings";
import { StageProgress } from "./stage-progress";

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
    <label className="block text-sm">
      {label}
      <select
        name={name}
        defaultValue={value ?? ""}
        className="mt-1 w-full rounded border border-zinc-400 bg-white p-2"
      >
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

async function StatusContent({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireUser();
  const filters = readFilters(await searchParams);
  const [{ rows, total }, codes, { models, owners }] = await Promise.all([
    listStatusRows(filters),
    listActiveCodes(),
    listStatusFilterOptions(),
  ]);

  const today = toSeoulDate(new Date());
  const labelOf = (group: string, value: string) =>
    codes.find((code) => code.code_group === group && code.code === value)
      ?.label ?? value;

  return (
    <>
      {/* 초기화하면 선택 칸도 비워지도록 조건마다 새로 그린다. */}
      <Form
        key={JSON.stringify(filters)}
        action="/status"
        className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6"
      >
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
          <button
            type="submit"
            className="rounded bg-zinc-900 px-6 py-2 text-white"
          >
            거르기
          </button>
          <Link href="/status" className="text-sm underline">
            초기화
          </Link>
        </div>
      </Form>

      <p className="mt-4 text-sm">
        {total > STATUS_LIMIT
          ? `전체 ${total}건 중 최근 ${STATUS_LIMIT}건을 보여 줍니다. 조건을 좁혀 주세요.`
          : `${total}건`}
      </p>

      {rows.length === 0 ? (
        <p className="mt-4">조건에 맞는 VOC가 없습니다.</p>
      ) : (
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[56rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-400">
                {[
                  "VOC 번호",
                  "단계",
                  "등급",
                  "유형",
                  "부위",
                  "차종",
                  "담당",
                  "기한",
                ].map((title) => (
                  <th key={title} scope="col" className="p-2 font-medium">
                    {title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const overdue = row.stage !== "종결" && row.due_at < today;
                return (
                  <tr
                    key={row.voc_id}
                    data-overdue={overdue}
                    className={`border-b border-zinc-200 ${overdue ? "bg-red-50 text-red-700" : ""}`}
                  >
                    <td className="whitespace-nowrap p-2">
                      <Link href={`/vocs/${row.voc_id}`} className="underline">
                        {row.voc_id}
                      </Link>
                    </td>
                    <td className="p-2">
                      <StageProgress stage={row.stage} />
                    </td>
                    <td className="p-2">{labelOf("grade", row.grade)}</td>
                    <td className="p-2">{labelOf("voc_type", row.voc_type)}</td>
                    <td className="p-2">{labelOf("system", row.system)}</td>
                    <td className="p-2">{row.model ?? "-"}</td>
                    <td className="p-2">{row.owner}</td>
                    <td className="whitespace-nowrap p-2">
                      {row.due_at}
                      {overdue && " (기한 초과)"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default function StatusPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return (
    <main className="mx-auto w-full max-w-6xl p-4 sm:p-8">
      <h1 className="text-xl font-semibold">VOC 현황</h1>
      <Suspense>
        <ProblemWarnings />
      </Suspense>
      <Suspense>
        <MetricsSummary />
      </Suspense>
      <Suspense fallback={<p className="mt-4">불러오는 중입니다.</p>}>
        <StatusContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
