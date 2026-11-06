"use client";

import { useActionState } from "react";
import { login } from "./actions";

const inputClass = "input";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <form action={action} className="mt-6 flex flex-col gap-4">
      <label className="field-label">
        이메일
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className={inputClass}
        />
      </label>
      <label className="field-label">
        비밀번호
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputClass}
        />
      </label>
      {state?.error && (
        <p role="alert" className="text-[13px] font-semibold text-late">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn w-full">
        {pending ? "로그인 중" : "로그인"}
      </button>
    </form>
  );
}
