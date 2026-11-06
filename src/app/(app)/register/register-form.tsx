"use client";

import { startTransition, useActionState, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import type {
  CodeGroup,
  CodeOption,
  CodeOptions,
  VocType,
} from "@/types/codes";
import { getTypeDetailFields, type TypeDetailField } from "@/types/type-detail";
import { HistoryPanel } from "../history-panel";
import { SimilarPanel } from "../similar-panel";
import { registerVocAction, type RegisterResult } from "./actions";

const inputClass = "mt-1 w-full rounded border border-zinc-400 bg-white p-2";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      {label}
      {required && <span className="text-red-700"> *</span>}
      {children}
    </label>
  );
}

function SelectField({
  label,
  name,
  options,
  required,
  onChange,
}: {
  label: string;
  name: string;
  options: readonly CodeOption[];
  required?: boolean;
  onChange?: (value: string) => void;
}) {
  return (
    <Field label={label} required={required}>
      <select
        name={name}
        required={required}
        defaultValue=""
        onChange={(event) => onChange?.(event.target.value)}
        className={inputClass}
      >
        <option value="">선택</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

function TypeDetailInput({ field }: { field: TypeDetailField }) {
  const name = `detail.${field.key}`;
  if (field.input === "select") {
    return (
      <SelectField
        label={field.label}
        name={name}
        required={field.required}
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
        className={inputClass}
      />
    </Field>
  );
}

function SaveMessage({ result }: { result?: RegisterResult }) {
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
    <div role="alert" className="text-red-700">
      {messages.map((message) => (
        <p key={message}>{message}</p>
      ))}
    </div>
  );
}

function FormFields({
  options,
  defaultReceivedAt,
  pending,
  saveMessage,
}: {
  options: CodeOptions;
  defaultReceivedAt: string;
  pending: boolean;
  saveMessage: ReactNode;
}) {
  const [vocType, setVocType] = useState("");
  const [vin, setVin] = useState("");
  const [partNo, setPartNo] = useState("");
  const [system, setSystem] = useState("");
  const list = (group: CodeGroup) => options[group] ?? [];

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="접수 일시" required>
            <input
              name="received_at"
              type="datetime-local"
              required
              defaultValue={defaultReceivedAt}
              className={inputClass}
            />
          </Field>
          <SelectField
            label="접수 경로"
            name="channel"
            required
            options={list("channel")}
          />
          <SelectField
            label="등급"
            name="grade"
            required
            options={list("grade")}
          />
          <Field label="담당" required>
            <input
              name="owner"
              required
              maxLength={30}
              className={inputClass}
            />
          </Field>
          <Field label="팀 구성">
            <input name="team" maxLength={200} className={inputClass} />
          </Field>
          <Field label="차대번호" required>
            <input
              name="vin"
              required
              maxLength={17}
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
              className={inputClass}
            />
          </Field>
          <SelectField
            label="유형"
            name="voc_type"
            required
            options={list("voc_type")}
            onChange={setVocType}
          />
          <SelectField
            label="부위 대분류"
            name="system"
            required
            options={list("system")}
            onChange={setSystem}
          />
          <Field label="부품명" required>
            <input
              name="part_name"
              required
              maxLength={50}
              className={inputClass}
            />
          </Field>
          <Field label="부품 번호">
            <input
              name="part_no"
              maxLength={20}
              onChange={(event) => setPartNo(event.target.value.trim())}
              className={inputClass}
            />
          </Field>
          <SelectField
            label="발생 빈도"
            name="frequency"
            required
            options={list("frequency")}
          />
          <SelectField
            label="재현 여부"
            name="reproduced"
            required
            options={list("reproduced")}
          />
        </div>

        <div className="mt-4">
          <Field label="증상 설명" required>
            <textarea
              name="symptom"
              required
              maxLength={2000}
              rows={4}
              className={inputClass}
            />
          </Field>
        </div>

        {vocType && (
          <fieldset className="mt-4 rounded border border-zinc-300 p-4">
            <legend className="px-1 font-medium">유형별 추가 항목</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              {getTypeDetailFields(vocType as VocType).map((field) => (
                <TypeDetailInput
                  key={`${vocType}.${field.key}`}
                  field={field}
                />
              ))}
            </div>
          </fieldset>
        )}

        <div className="mt-4">
          <Field label="사진·영상 링크">
            <input
              name="media_links"
              placeholder="주소가 여러 개면 쉼표로 구분"
              className={inputClass}
            />
          </Field>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="submit"
            disabled={pending}
            className="w-full shrink-0 rounded bg-zinc-900 p-2 text-white disabled:opacity-50 sm:w-auto sm:px-8"
          >
            {pending ? "저장 중" : "저장"}
          </button>
          {saveMessage}
        </div>
      </div>
      <aside className="h-fit rounded border border-zinc-300 p-4 lg:sticky lg:top-4">
        <HistoryPanel vin={vin} partNo={partNo} />
        <div className="mt-4 border-t border-zinc-300 pt-4">
          <SimilarPanel
            vin={vin}
            partNo={partNo}
            vocType={vocType}
            system={system}
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
          className="mb-4 rounded bg-green-100 p-3 text-green-900"
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
