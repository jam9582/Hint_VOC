import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "./login-form";

/** 이미 로그인한 사람은 첫 화면으로 보낸다. */
async function LoggedInRedirect() {
  if (await getCurrentUser()) redirect("/");
  return null;
}

export default function LoginPage() {
  return (
    <main className="grid min-h-dvh w-full place-items-center p-4">
      <div className="card w-full max-w-sm p-7">
        <div className="grid size-11 place-items-center rounded-[10px] bg-primary text-sm font-bold text-white">
          8D
        </div>
        <h1 className="mt-4 text-xl font-bold tracking-tight">
          VOC 통합 관리 (8D)
        </h1>
        <p className="mt-1 text-[13px] font-medium text-ink-2">
          접수부터 종결까지 한 양식으로 관리해요
        </p>
        <Suspense>
          <LoggedInRedirect />
        </Suspense>
        <LoginForm />
      </div>
    </main>
  );
}
