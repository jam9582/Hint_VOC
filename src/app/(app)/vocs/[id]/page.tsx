import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import { toSeoulDate, toSeoulDateTimeLocal } from "@/lib/dates";
import { listActiveCodes, toCodeOptions } from "@/lib/db/codes";
import { getVocDetail, type VocDetail } from "@/lib/db/vocs";
import { getDueState } from "@/lib/rules/dashboard";
import {
  STAGE_SECTIONS,
  type StageField,
  type StageSection,
} from "@/lib/rules/stage-fields";
import { STAGES, type CodeOptions, type Stage } from "@/types/codes";
import { getTypeDetailFields } from "@/types/type-detail";
import { DueBadge } from "../../due-badge";
import { GradeTag } from "../../grade-tag";
import { HistoryPanel } from "../../history-panel";
import { PageHeader } from "../../page-header";
import { SimilarPanel } from "../../similar-panel";
import { StageProgress } from "../../status/stage-progress";
import { DeleteVocButton } from "./delete-voc-button";
import { StageForm } from "./stage-form";

const stageIndex = (stage: Stage) => STAGES.indexOf(stage);
const formatDateTime = (value: string) =>
  toSeoulDateTimeLocal(new Date(value)).replace("T", " ");

type StepState = "done" | "current" | "later";

const CIRCLE_CLASS: Record<StepState, string> = {
  done: "bg-ok-bg text-ok",
  current: "bg-primary text-white shadow-primary",
  later: "bg-inset text-ink-3",
};

function Item({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium text-ink-3">{label}</dt>
      <dd className="mt-0.5 text-[13px] font-medium break-words whitespace-pre-wrap">
        {value ?? "-"}
      </dd>
    </div>
  );
}

/** 주소만 눌러서 열 수 있게 한다. 다른 글자는 그대로 보여 준다. */
function MediaLinks({ value }: { value: string | null }) {
  if (!value) return "-";
  return (
    <span className="flex flex-col gap-1">
      {value.split(",").map((item) => {
        const text = item.trim();
        return /^https?:\/\//i.test(text) ? (
          <a
            key={text}
            href={text}
            target="_blank"
            rel="noreferrer"
            className="text-link break-all"
          >
            {text}
          </a>
        ) : (
          <span key={text}>{text}</span>
        );
      })}
    </span>
  );
}

/** 왼쪽에 단계 표시, 오른쪽에 내용이 오는 한 줄. 접으면 제목만 보인다. */
function Step({
  code,
  title,
  note,
  state,
  stage,
  collapsed = false,
  children,
}: {
  code: string;
  title: string;
  note: string;
  state: StepState;
  stage?: Stage;
  collapsed?: boolean;
  children: ReactNode;
}) {
  const heading = (
    <div className="flex items-start gap-3">
      <span
        className={`grid size-7 shrink-0 place-items-center rounded-full text-[11px] font-bold ${CIRCLE_CLASS[state]}`}
      >
        {code}
      </span>
      <div>
        <h2 className="text-sm font-semibold">{title}</h2>
        <small
          className={`text-xs font-medium ${state === "current" ? "font-semibold text-primary" : "text-ink-3"}`}
        >
          {note}
        </small>
      </div>
    </div>
  );

  if (collapsed) {
    return (
      <section data-stage={stage} className="border-t border-line first:border-t-0">
        <details className="group py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
            {heading}
            <span className="text-xs font-semibold text-ink-3 group-open:hidden">
              내용 보기
            </span>
            <span className="hidden text-xs font-semibold text-ink-3 group-open:inline">
              접기
            </span>
          </summary>
          <div className="mt-3 md:pl-[168px]">{children}</div>
        </details>
      </section>
    );
  }

  return (
    <section
      data-stage={stage}
      className="grid gap-3 border-t border-line py-4 first:border-t-0 md:grid-cols-[150px_minmax(0,1fr)] md:gap-[18px]"
    >
      {heading}
      <div className="min-w-0">{children}</div>
    </section>
  );
}

function ReceiptSection({
  voc,
  team,
  labelOf,
}: {
  voc: VocDetail["voc"];
  team: string | null;
  labelOf: (group: keyof CodeOptions, value: string) => string;
}) {
  const detail = (voc.type_detail ?? {}) as Record<string, string | number>;
  return (
    <Step code="D2" title="D0~D2 접수" note="완료" state="done">
      <dl className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
        <Item label="접수 일시" value={formatDateTime(voc.received_at)} />
        <Item label="접수 경로" value={labelOf("channel", voc.channel)} />
        <Item label="팀 구성" value={team} />
        <Item label="차대번호" value={voc.vin} />
        <Item label="주행거리 (km)" value={voc.mileage_km} />
        <Item label="부품 번호" value={voc.part_no} />
        <Item label="발생 빈도" value={labelOf("frequency", voc.frequency)} />
        <Item label="재현 여부" value={labelOf("reproduced", voc.reproduced)} />
        {getTypeDetailFields(voc.voc_type).map((field) => (
          <Item
            key={field.key}
            label={field.label}
            value={detail[field.key] ?? null}
          />
        ))}
      </dl>
      <dl className="mt-3 grid gap-3">
        <Item label="증상 설명" value={voc.symptom} />
        <Item
          label="사진·영상 링크"
          value={<MediaLinks value={voc.media_links} />}
        />
      </dl>
    </Step>
  );
}

function ReadOnlyFields({
  fields,
  voc8d,
  labelOf,
}: {
  fields: readonly StageField[];
  voc8d: VocDetail["voc8d"];
  labelOf: (group: keyof CodeOptions, value: string) => string;
}) {
  return (
    <dl className="grid gap-3">
      {fields.map((field) => {
        const value = voc8d[field.key];
        const shown =
          field.input === "select" && value
            ? labelOf(field.codeGroup, value)
            : value;
        return <Item key={field.key} label={field.label} value={shown} />;
      })}
    </dl>
  );
}

function StageBlock({
  section,
  detail,
  options,
  labelOf,
}: {
  section: StageSection;
  detail: VocDetail;
  options: CodeOptions;
  labelOf: (group: keyof CodeOptions, value: string) => string;
}) {
  const { voc, voc8d } = detail;
  const isCurrent = section.stage === voc.stage;
  const isLater = stageIndex(section.stage) > stageIndex(voc.stage);
  const hasValue = section.fields.some((field) => voc8d[field.key]);
  const state: StepState = isCurrent ? "current" : isLater ? "later" : "done";
  const note = { current: "지금 단계", later: "대기", done: "완료" }[state];

  return (
    <Step
      code={section.stage.slice(0, 2)}
      title={section.title}
      note={note}
      state={state}
      stage={section.stage}
      collapsed={state === "done" && voc.stage !== "종결"}
    >
      {isCurrent && (
        <StageForm
          key={voc.stage}
          vocId={voc.voc_id}
          stage={voc.stage}
          fields={section.fields}
          options={options}
          initialValues={Object.fromEntries(
            section.fields.map((field) => [field.key, voc8d[field.key] ?? ""]),
          )}
        />
      )}
      {!isCurrent && isLater && !hasValue && (
        <p className="pt-1 text-[13px] font-medium text-ink-3">
          아직 시작 전입니다.
        </p>
      )}
      {!isCurrent && (!isLater || hasValue) && (
        <ReadOnlyFields
          fields={section.fields}
          voc8d={voc8d}
          labelOf={labelOf}
        />
      )}
    </Step>
  );
}

function StageLogs({ logs }: { logs: VocDetail["logs"] }) {
  return (
    <section className="card p-5">
      <h3 className="card-title">단계 이력</h3>
      <ol className="mt-3 flex flex-col gap-3">
        {logs.map((log) => (
          <li key={log.log_id} className="flex gap-2.5 text-xs font-medium">
            <i className="mt-[5px] size-2 shrink-0 rounded-full bg-chart" />
            <div className="min-w-0">
              <p className="font-semibold">
                {log.from_stage ?? "접수"} → {log.to_stage}
              </p>
              <p className="text-ink-3">
                {formatDateTime(log.changed_at)} · {log.changed_by}
              </p>
              {log.note && <p className="break-words text-ink-2">{log.note}</p>}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-xl bg-inset px-2.5 py-[3px] text-xs font-medium text-ink-2">
      {label}
      <b className="ml-1 font-semibold text-ink">{value}</b>
    </span>
  );
}

async function VocContent({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const [detail, codes] = await Promise.all([
    getVocDetail(id),
    listActiveCodes(),
  ]);
  if (!detail) notFound();

  const options = toCodeOptions(codes);
  const labelOf = (group: keyof CodeOptions, value: string) =>
    options[group]?.find((option) => option.value === value)?.label ?? value;
  const { voc, voc8d, logs } = detail;
  const closed = voc.stage === "종결";
  const today = toSeoulDate(new Date());
  const overdue = !closed && voc.due_at < today;

  return (
    <>
      <PageHeader title={voc.voc_id}>
        <div className="flex flex-wrap items-center gap-4">
          <Link href={`/vocs/${voc.voc_id}/report`} className="text-link text-[13px]">
            8D 보고서
          </Link>
          <Link href="/status" className="text-link text-[13px]">
            현황으로 돌아가기
          </Link>
        </div>
      </PageHeader>

      <section className="card mb-[22px] flex flex-wrap items-center justify-between gap-4 px-6 py-5">
        <div className="min-w-0">
          <p className="text-xs font-medium text-ink-3">
            {toSeoulDate(new Date(voc.received_at))} 접수 ·{" "}
            {labelOf("channel", voc.channel)}
          </p>
          <h2 className="mt-0.5 mb-2 text-[19px] font-bold tracking-tight break-words">
            {voc.part_name}
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <GradeTag grade={voc.grade} label={labelOf("grade", voc.grade)} />
            <Fact label="유형" value={labelOf("voc_type", voc.voc_type)} />
            <Fact label="부위" value={labelOf("system", voc.system)} />
            <Fact label="담당" value={voc.owner} />
          </div>
        </div>
        <div className="flex flex-col items-start gap-3 sm:items-end">
          <p className="flex items-center gap-2 text-xs font-medium text-ink-3">
            {closed
              ? voc.closed_at && `종결 ${formatDateTime(voc.closed_at)}`
              : `기한 ${voc.due_at}`}
            {getDueState(voc.stage, voc.due_at, today) !== "ok" && (
              <DueBadge stage={voc.stage} dueAt={voc.due_at} today={today} />
            )}
          </p>
          <StageProgress stage={voc.stage} overdue={overdue} wide />
          {user.role === "admin" && <DeleteVocButton vocId={voc.voc_id} />}
        </div>
      </section>

      <div className="grid gap-[22px] xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="card min-w-0 px-6 py-2">
          <ReceiptSection voc={voc} team={voc8d.team} labelOf={labelOf} />
          {STAGE_SECTIONS.map((section) => (
            <StageBlock
              key={section.stage}
              section={section}
              detail={detail}
              options={options}
              labelOf={labelOf}
            />
          ))}
        </div>
        <aside className="flex h-fit min-w-0 flex-col gap-[22px]">
          <div className="card p-5">
            <HistoryPanel vin={voc.vin} partNo={voc.part_no ?? ""} />
          </div>
          <div className="card p-5">
            <SimilarPanel
              vin={voc.vin}
              partNo={voc.part_no ?? ""}
              vocType={voc.voc_type}
              system={voc.system}
              excludeVocId={voc.voc_id}
            />
          </div>
          <StageLogs logs={logs} />
        </aside>
      </div>
    </>
  );
}

export default function VocPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <main className="px-4 py-5 lg:px-7 lg:py-[22px]">
      <Suspense fallback={<div className="card h-96 animate-pulse" />}>
        <VocContent params={params} />
      </Suspense>
    </main>
  );
}
