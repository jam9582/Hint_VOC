"use client";

import { startTransition, useActionState, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import type {
  CodeGroup,
  CodeOption,
  CodeOptions,
} from "@/types/codes";
import { getTypeDetailFields, type TypeDetailField } from "@/types/type-detail";
import { HistoryPanel } from "../history-panel";
import { SimilarPanel } from "../similar-panel";
import { registerVocAction, type RegisterResult } from "./actions";

const inputClass = "input";

/** 수정 화면에서 채워 둘 값. 등록 화면은 쓰지 않는다. */
export type VocFormInitial = {
  voc_id: string;
  channel: string;
  grade: string;
  owner: string;
  team: string;
  vin: string;
  mileage_km: string;
  part_name: string;
  part_no: string;
  voc_type: string;
  system: string;
  frequency: string;
  reproduced: string;
  symptom: string;
  media_links: string;
  detail: Record<string, string>;
};

export function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="field-label">
      {label}
      {required && <span className="text-late"> *</span>}
      {children}
    </label>
  );
}

function FormSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-line pt-5 pb-6 first:border-t-0 first:pt-0">
      <h2 className="card-title mb-4">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function SelectField({
  label,
  name,
  options,
  required,
  defaultValue = "",
  onChange,
}: {
  label: string;
  name: string;
  options: readonly CodeOption[];
  required?: boolean;
  defaultValue?: string;
  onChange?: (value: string) => void;
}) {
  // 지금은 쓰지 않는 코드가 저장되어 있어도 선택된 채로 보여 준다.
  const shown =
    defaultValue && !options.some((option) => option.value === defaultValue)
      ? [...options, { value: defaultValue, label: defaultValue }]
      : options;
  return (
    <Field label={label} required={required}>
      <select
        name={name}
        required={required}
        defaultValue={defaultValue}
        onChange={(event) => onChange?.(event.target.value)}
        className={inputClass}
      >
        <option value="">선택</option>
        {shown.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

function TypeDetailInput({
  field,
  defaultValue,
}: {
  field: TypeDetailField;
  defaultValue?: string;
}) {
  const name = `detail.${field.key}`;
  if (field.input === "select") {
    return (
      <SelectField
        label={field.label}
        name={name}
        required={field.required}
        defaultValue={defaultValue}
        options={field.options.map((value) => ({ value, label: value }))}
      />
    );
  }
  const label =
    field.input === "integer" ? `${field.label} (${field.unit})` : field.label;
  return (
    <Field label={label} required={field.required}>
      <input
        name={name}
        type={field.input === "integer" ? "number" : "text"}
        min={field.input === "integer" ? 0 : undefined}
        step={field.input === "integer" ? 1 : undefined}
        required={field.required}
        defaultValue={defaultValue}
        className={inputClass}
      />
    </Field>
  );
}

export function SaveMessage({ result }: { result?: RegisterResult }) {
  if (!result || "vocId" in result) return null;
  const messages =
    "error" in result
      ? [result.error]
      : [
          ...(result.problems.missing.length > 0
            ? [`빠진 항목: ${result.problems.missing.join(", ")}`]
            : []),
          ...result.problems.invalid,
        ];
  return (
    <div role="alert" className="text-[13px] font-semibold text-late">
      {messages.map((message) => (
        <p key={message}>{message}</p>
      ))}
    </div>
  );
}

export function FormFields({
  options,
  defaultReceivedAt,
  initial,
  pending,
  saveMessage,
  beforeSave,
}: {
  options: CodeOptions;
  defaultReceivedAt: string;
  initial?: VocFormInitial;
  pending: boolean;
  saveMessage: ReactNode;
  beforeSave?: ReactNode;
}) {
  const [vocType, setVocType] = useState(initial?.voc_type ?? "");
  const [vin, setVin] = useState(initial?.vin ?? "");
  const [partNo, setPartNo] = useState(initial?.part_no ?? "");
  const [system, setSystem] = useState(initial?.system ?? "");
  const list = (group: CodeGroup) => options[group] ?? [];

  return (
    <div className="grid gap-[22px] xl:grid-cols-[minmax(0,1fr)_300px]">
      <div className="card min-w-0 p-5 sm:p-6">
        <FormSection title="접수">
          <Field label="접수 일시" required>
            <input
              name="received_at"
              type="datetime-local"
              required
              defaultValue={defaultReceivedAt}
              readOnly={Boolean(initial)}
              className={inputClass}
            />
          </Field>
          <SelectField
            label="접수 경로"
            name="channel"
            required
            defaultValue={initial?.channel}
            options={list("channel")}
          />
          <SelectField
            label="등급"
            name="grade"
            required
            defaultValue={initial?.grade}
            options={list("grade")}
          />
          <Field label="담당" required>
            <input
              name="owner"
              required
              maxLength={30}
              defaultValue={initial?.owner}
              className={inputClass}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="팀 구성">
              <input
                name="team"
                maxLength={200}
                defaultValue={initial?.team}
                className={inputClass}
              />
            </Field>
          </div>
        </FormSection>

        <FormSection title="차량·부품">
          <Field label="차대번호" required>
            <input
              name="vin"
              required
              maxLength={17}
              defaultValue={initial?.vin}
              onChange={(event) => setVin(event.target.value.trim())}
              className={inputClass}
            />
          </Field>
          <Field label="주행거리 (km)" required>
            <input
              name="mileage_km"
              type="number"
              min={0}
              step={1}
              required
              defaultValue={initial?.mileage_km}
              className={inputClass}
            />
          </Field>
          <Field label="부품명" required>
            <input
              name="part_name"
              required
              maxLength={50}
              defaultValue={initial?.part_name}
              className={inputClass}
            />
          </Field>
          <Field label="부품 번호">
            <input
              name="part_no"
              maxLength={20}
              defaultValue={initial?.part_no}
              onChange={(event) => setPartNo(event.target.value.trim())}
              className={inputClass}
            />
          </Field>
        </FormSection>

        <FormSection title="문제 내용">
          <SelectField
            label="유형"
            name="voc_type"
            required
            defaultValue={initial?.voc_type}
            options={list("voc_type")}
            onChange={setVocType}
          />
          <SelectField
            label="부위 대분류"
            name="system"
            required
            defaultValue={initial?.system}
            options={list("system")}
            onChange={setSystem}
          />
          <SelectField
            label="발생 빈도"
            name="frequency"
            required
            defaultValue={initial?.frequency}
            options={list("frequency")}
          />
          <SelectField
            label="재현 여부"
            name="reproduced"
            required
            defaultValue={initial?.reproduced}
            options={list("reproduced")}
          />
          <div className="sm:col-span-2">
            <Field label="증상 설명" required>
              <textarea
                name="symptom"
                required
                maxLength={2000}
                rows={4}
                defaultValue={initial?.symptom}
                className={inputClass}
              />
            </Field>
          </div>
          {vocType && (
            <fieldset className="rounded-lg border border-line bg-inset p-4 sm:col-span-2">
              <legend className="px-1 text-[13px] font-semibold">
                유형별 추가 항목
              </legend>
              <div className="grid gap-4 sm:grid-cols-2">
                {getTypeDetailFields(vocType).map((field) => (
                  <TypeDetailInput
                    key={`${vocType}.${field.key}`}
                    field={field}
                    defaultValue={
                      initial?.voc_type === vocType
                        ? initial.detail[field.key]
                        : undefined
                    }
                  />
                ))}
              </div>
            </fieldset>
          )}
          <div className="sm:col-span-2">
            <Field label="사진·영상 링크">
              <input
                name="media_links"
                placeholder="주소가 여러 개면 쉼표로 구분"
                defaultValue={initial?.media_links}
                className={inputClass}
              />
            </Field>
          </div>
        </FormSection>

        {beforeSave}
        <div className="flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center">
          <button
            type="submit"
            disabled={pending}
            className="btn w-full shrink-0 sm:w-auto sm:px-8"
          >
            {pending ? "저장 중" : "저장"}
          </button>
          {saveMessage}
        </div>
      </div>
      <aside className="flex h-fit flex-col gap-[22px] xl:sticky xl:top-[22px]">
        <div className="card p-5">
          <HistoryPanel vin={vin} partNo={partNo} />
        </div>
        <div className="card p-5">
          <SimilarPanel
            vin={vin}
            partNo={partNo}
            vocType={vocType}
            system={system}
            excludeVocId={initial?.voc_id}
          />
        </div>
      </aside>
    </div>
  );
}

type FormState = { result?: RegisterResult; savedCount: number };

async function submit(
  state: FormState,
  formData: FormData,
): Promise<FormState> {
  const result = await registerVocAction(formData);
  const saved = "vocId" in result ? 1 : 0;
  return { result, savedCount: state.savedCount + saved };
}

export function RegisterForm({
  options,
  defaultReceivedAt,
}: {
  options: CodeOptions;
  defaultReceivedAt: string;
}) {
  const [state, action, pending] = useActionState(submit, { savedCount: 0 });
  const { result, savedCount } = state;

  // React 기본 폼 전송은 실패해도 입력 칸을 비우므로 직접 보낸다.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => action(formData));
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-4">
      {result && "vocId" in result && (
        <p
          role="status"
          className="mb-4 rounded-lg bg-ok-bg px-4 py-3 text-[13px] font-semibold text-ok"
        >
          {result.vocId} 등록을 마쳤습니다.
        </p>
      )}
      {/* 저장에 성공할 때만 key가 바뀌어 빈 폼으로 돌아간다. */}
      <FormFields
        key={savedCount}
        options={options}
        defaultReceivedAt={defaultReceivedAt}
        pending={pending}
        saveMessage={<SaveMessage result={result} />}
      />
    </form>
  );
}
