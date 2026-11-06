import { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import { toSeoulDateTimeLocal } from "@/lib/dates";
import { listActiveCodes, toCodeOptions } from "@/lib/db/codes";
import { PageHeader } from "../page-header";
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
    <main className="px-4 py-5 lg:px-7 lg:py-[22px]">
      <PageHeader title="VOC 등록" />
      <Suspense fallback={<div className="card h-96 animate-pulse" />}>
        <RegisterContent />
      </Suspense>
    </main>
  );
}
