"use client";

import { useState, useTransition } from "react";
import type { FormEvent, ReactNode } from "react";
import type { AdminResult } from "./actions";

/** 관리자 화면의 폼. 결과 문구를 보여 주고, 실패하면 입력을 그대로 둔다. */
export function ActionForm({
  action,
  resetOnSuccess,
  className,
  children,
}: {
  action: (formData: FormData) => Promise<AdminResult>;
  resetOnSuccess?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const [result, setResult] = useState<AdminResult>();
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    startTransition(async () => {
      const next = await action(formData);
      setResult(next);
      if (next.ok && resetOnSuccess) form.reset();
    });
  }

  return (
    <form onSubmit={handleSubmit} aria-busy={pending} className={className}>
      {children}
      {result && (
        <p
          role={result.ok ? "status" : "alert"}
          className={`text-sm ${result.ok ? "text-green-800" : "text-red-700"}`}
        >
          {result.message}
        </p>
      )}
    </form>
  );
}
