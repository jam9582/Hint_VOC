import { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import { toSeoulDateTimeLocal } from "@/lib/dates";
import { listActiveCodes } from "@/lib/db/codes";
import type { CodeGroup } from "@/types/codes";
import { RegisterForm, type CodeOptions } from "./register-form";

async function RegisterContent() {
  await requireUser();
  const codes = await listActiveCodes();

  const options: CodeOptions = {};
  for (const { code_group, code, label } of codes) {
    const group = code_group as CodeGroup;
    (options[group] ??= []).push({ value: code, label: label ?? code });
  }

  return (
    <RegisterForm
      options={options}
      defaultReceivedAt={toSeoulDateTimeLocal(new Date())}
    />
  );
}

export default function RegisterPage() {
  return (
    <main className="mx-auto w-full max-w-3xl p-4 sm:p-8">
      <h1 className="text-xl font-semibold">VOC 등록</h1>
      <Suspense fallback={<p className="mt-4">불러오는 중입니다.</p>}>
        <RegisterContent />
      </Suspense>
    </main>
  );
}
