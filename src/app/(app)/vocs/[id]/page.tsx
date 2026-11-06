import { notFound } from "next/navigation";
import { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import { toSeoulDate, toSeoulDateTimeLocal } from "@/lib/dates";
import { listActiveCodes, toCodeOptions } from "@/lib/db/codes";
import { getVocDetail, type VocDetail } from "@/lib/db/vocs";
import {
  STAGE_SECTIONS,
  type StageField,
  type StageSection,
} from "@/lib/rules/stage-fields";
import { STAGES, type CodeOptions, type Stage } from "@/types/codes";
import { getTypeDetailFields } from "@/types/type-detail";
import { HistoryPanel } from "../../history-panel";
import { SimilarPanel } from "../../similar-panel";
import { DeleteVocButton } from "./delete-voc-button";
import { StageForm } from "./stage-form";

const stageIndex = (stage: Stage) => STAGES.indexOf(stage);
const formatDateTime = (value: string) =>
  toSeoulDateTimeLocal(new Date(value)).replace("T", " ");

function Item({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div>
      <dt className="text-sm text-zinc-600">{label}</dt>
      <dd className="whitespace-pre-wrap break-words">{value ?? "-"}</dd>
    </div>
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
    <section className="rounded border border-zinc-300 p-4">
      <h2 className="font-medium">D0~D2 접수</h2>
      <dl className="mt-3 grid gap-3 sm:grid-cols-2">
        <Item label="접수 일시" value={formatDateTime(voc.received_at)} />
        <Item label="접수 경로" value={labelOf("channel", voc.channel)} />
        <Item label="등급" value={labelOf("grade", voc.grade)} />
        <Item label="담당" value={voc.owner} />
        <Item label="팀 구성" value={team} />
        <Item label="차대번호" value={voc.vin} />
        <Item label="주행거리 (km)" value={voc.mileage_km} />
        <Item label="유형" value={labelOf("voc_type", voc.voc_type)} />
        <Item label="부위 대분류" value={labelOf("system", voc.system)} />
        <Item label="부품명" value={voc.part_name} />
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
        <Item label="사진·영상 링크" value={voc.media_links} />
      </dl>
    </section>
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
    <dl className="mt-3 grid gap-3">
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

  return (
    <section
      data-stage={section.stage}
      className={`rounded border p-4 ${isCurrent ? "border-zinc-900" : "border-zinc-300"}`}
    >
      <h2 className="font-medium">
        {section.title}
        {isCurrent && " (지금 단계)"}
      </h2>
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
        <p className="mt-2 text-sm text-zinc-600">아직 시작 전입니다.</p>
      )}
      {!isCurrent && (!isLater || hasValue) && (
        <ReadOnlyFields
          fields={section.fields}
          voc8d={voc8d}
          labelOf={labelOf}
        />
      )}
    </section>
  );
}

function StageLogs({ logs }: { logs: VocDetail["logs"] }) {
  return (
    <section>
      <h3 className="font-medium">단계 이력</h3>
      <ol className="mt-1 flex flex-col gap-2 text-sm">
        {logs.map((log) => (
          <li key={log.log_id}>
            <p>
              {log.from_stage ?? "접수"} → {log.to_stage}
            </p>
            <p className="text-zinc-600">
              {formatDateTime(log.changed_at)} · {log.changed_by}
            </p>
            {log.note && <p className="break-words">{log.note}</p>}
          </li>
        ))}
      </ol>
    </section>
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
  const overdue = !closed && voc.due_at < toSeoulDate(new Date());

  return (
    <>
      <h1 className="text-xl font-semibold">{voc.voc_id}</h1>
      <p className={`mt-1 ${overdue ? "text-red-700" : ""}`}>
        현재 단계 {voc.stage}
        {closed
          ? ` · 종결 ${voc.closed_at ? formatDateTime(voc.closed_at) : ""}`
          : ` · 기한 ${voc.due_at}${overdue ? " (기한 초과)" : ""}`}
      </p>
      {user.role === "admin" && <DeleteVocButton vocId={voc.voc_id} />}
      <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="flex flex-col gap-4">
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
        <aside className="flex h-fit flex-col gap-4 rounded border border-zinc-300 p-4 lg:sticky lg:top-4">
          <HistoryPanel vin={voc.vin} partNo={voc.part_no ?? ""} />
          <div className="border-t border-zinc-300 pt-4">
            <SimilarPanel
              vin={voc.vin}
              partNo={voc.part_no ?? ""}
              vocType={voc.voc_type}
              system={voc.system}
              excludeVocId={voc.voc_id}
            />
          </div>
          <div className="border-t border-zinc-300 pt-4">
            <StageLogs logs={logs} />
          </div>
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
    <main className="mx-auto w-full max-w-5xl p-4 sm:p-8">
      <Suspense fallback={<p>불러오는 중입니다.</p>}>
        <VocContent params={params} />
      </Suspense>
    </main>
  );
}
