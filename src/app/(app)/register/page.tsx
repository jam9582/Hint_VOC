import { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import { toSeoulDateTimeLocal } from "@/lib/dates";
import { listActiveCodes, toCodeOptions } from "@/lib/db/codes";
import { RegisterForm } from "./register-form";

async function RegisterContent() {
  await requireUser();
  const options = toCodeOptions(await listActiveCodes());

  return (
    <RegisterForm
      options={options}
      defaultReceivedAt={toSeoulDateTimeLocal(new Date())}
    />
  );
}

export default function RegisterPage() {
  return (
    <main className="mx-auto w-full max-w-5xl p-4 sm:p-8">
      <h1 className="text-xl font-semibold">VOC 등록</h1>
      <Suspense fallback={<p className="mt-4">불러오는 중입니다.</p>}>
        <RegisterContent />
      </Suspense>
    </main>
  );
}
