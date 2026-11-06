"use client";

import { useActionState } from "react";
import { login } from "./actions";

const inputClass = "mt-1 w-full rounded border border-zinc-400 p-2";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <form action={action} className="mt-6 flex flex-col gap-4">
      <label className="block">
        이메일
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className={inputClass}
        />
      </label>
      <label className="block">
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
        <p role="alert" className="text-red-700">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-zinc-900 p-2 text-white disabled:opacity-50"
      >
        {pending ? "로그인 중" : "로그인"}
      </button>
    </form>
  );
}
