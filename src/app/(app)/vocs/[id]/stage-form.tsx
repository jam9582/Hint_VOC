"use client";

import { useState, useTransition } from "react";
import type { StageField } from "@/lib/rules/stage-fields";
import { getMissingStageFields } from "@/lib/rules/validation";
import { showToast } from "../../toast";
import { D6_FAIL, type CodeOptions, type Stage } from "@/types/codes";
import {
  advanceStageAction,
  saveStageAction,
  type StageActionResult,
} from "./actions";

const inputClass = "input";

function advanceLabel(stage: Stage, result: string) {
  if (stage === "D7-D8") return "종결";
  if (stage === "D6검증" && result === D6_FAIL) return "불합격 저장 (D4로 되돌림)";
  return "다음 단계";
}

function FieldInput({
  field,
  value,
  options,
  onChange,
}: {
  field: StageField;
  value: string;
  options: CodeOptions;
  onChange: (value: string) => void;
}) {
  const common = { name: field.key, value, className: inputClass };

  if (field.input === "select") {
    return (
      <select {...common} onChange={(event) => onChange(event.target.value)}>
        <option value="">선택</option>
        {(options[field.codeGroup] ?? []).map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }
  if (field.input === "text") {
    return (
      <input
        {...common}
        maxLength={field.maxLength}
        placeholder={field.placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }
  return (
    <textarea
      {...common}
      maxLength={2000}
      rows={3}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

/** 지금 단계의 입력 칸. 필수 항목이 비면 다음 단계 버튼이 눌리지 않는다. */
export function StageForm({
  vocId,
  stage,
  fields,
  initialValues,
  options,
}: {
  vocId: string;
  stage: Stage;
  fields: readonly StageField[];
  initialValues: Record<string, string>;
  options: CodeOptions;
}) {
  const [values, setValues] = useState(initialValues);
  const [result, setResult] = useState<StageActionResult>();
  const [pending, startTransition] = useTransition();

  const missing = getMissingStageFields(stage, values);
  const run = (action: typeof saveStageAction) =>
    startTransition(async () => {
      const next = await action(vocId, stage, values);
      // 단계가 바뀌면 이 폼이 새로 그려지므로 공통 알림으로 보여 준다.
      if (next.ok && action === advanceStageAction) showToast(next.message);
      else setResult(next);
    });

  return (
    <div className="flex flex-col gap-4">
      {fields.map((field) => (
        <label key={field.key} className="field-label">
          {field.label}
          {field.required && <span className="text-late"> *</span>}
          <FieldInput
            field={field}
            value={values[field.key] ?? ""}
            options={options}
            onChange={(value) =>
              setValues((current) => ({ ...current, [field.key]: value }))
            }
          />
        </label>
      ))}

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <button
          type="button"
          disabled={pending}
          onClick={() => run(saveStageAction)}
          className="btn btn-light"
        >
          저장
        </button>
        <button
          type="button"
          disabled={pending || missing.length > 0}
          onClick={() => run(advanceStageAction)}
          className="btn"
        >
          {advanceLabel(stage, values.d6_result ?? "")}
        </button>
        {missing.length > 0 && (
          <p className="text-xs font-semibold text-late">
            빠진 항목: {missing.join(", ")}
          </p>
        )}
      </div>

      {result && (
        <p
          role={result.ok ? "status" : "alert"}
          className={`text-[13px] font-semibold ${result.ok ? "text-ok" : "text-late"}`}
        >
          {result.message}
          {result.missing?.length ? ` (${result.missing.join(", ")})` : ""}
        </p>
      )}
    </div>
  );
}
