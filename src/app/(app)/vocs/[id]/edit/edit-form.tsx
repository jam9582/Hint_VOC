"use client";

import { startTransition, useActionState } from "react";
import type { FormEvent } from "react";
import type { CodeOptions } from "@/types/codes";
import {
  Field,
  FormFields,
  SaveMessage,
  type VocFormInitial,
} from "../../../register/register-form";
import { EDIT_REASON_MAX_LENGTH } from "@/lib/rules/voc-edit";
import { editVocAction, type EditResult } from "./actions";

export function EditForm({
  options,
  receivedAt,
  initial,
}: {
  options: CodeOptions;
  receivedAt: string;
  initial: VocFormInitial;
}) {
  const [result, action, pending] = useActionState(
    (_: EditResult | undefined, formData: FormData) =>
      editVocAction(initial.voc_id, formData),
    undefined,
  );

  // React 기본 폼 전송은 실패해도 입력 칸을 비우므로 직접 보낸다.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => action(formData));
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-4">
      <FormFields
        options={options}
        defaultReceivedAt={receivedAt}
        initial={initial}
        pending={pending}
        saveMessage={<SaveMessage result={result} />}
        beforeSave={
          <div className="border-t border-line py-5">
            <Field label="수정 사유" required>
              <input
                name="reason"
                required
                maxLength={EDIT_REASON_MAX_LENGTH}
                placeholder="예: 담당자 변경"
                className="input"
              />
            </Field>
          </div>
        }
      />
    </form>
  );
}
