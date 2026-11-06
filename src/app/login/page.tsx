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
    <main className="mx-auto w-full max-w-sm p-4 pt-16">
      <h1 className="text-2xl font-semibold">VOC 통합 관리 (8D)</h1>
      <Suspense>
        <LoggedInRedirect />
      </Suspense>
      <LoginForm />
    </main>
  );
}
