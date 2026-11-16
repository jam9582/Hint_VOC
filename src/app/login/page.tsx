import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "./login-form";

/** 이미 로그인한 사람은 첫 화면으로 보낸다. */
async function LoggedInRedirect() {
  if (await getCurrentUser()) redirect("/");
  return null;
}

/** 체험용 계정과 테스트 값을 알려주는 안내 상자. */
function TestGuide() {
  return (
    <aside className="w-full rounded-xl border border-line bg-inset p-6 text-[13px] leading-relaxed text-ink-2 md:flex-1">
      <h2 className="text-sm font-bold text-ink">체험 안내</h2>

      <h3 className="mt-4 font-semibold text-ink">테스트 계정</h3>
      <ul className="mt-1 space-y-0.5">
        <li>
          일반 계정{" "}
          <code className="font-mono text-ink">user@voc-test.example</code>
        </li>
        <li>
          관리자 계정{" "}
          <code className="font-mono text-ink">admin@voc-test.example</code>
        </li>
        <li>
          비밀번호 모두 <code className="font-mono text-ink">000000</code>
        </li>
      </ul>

      <h3 className="mt-4 font-semibold text-ink">VOC 등록 테스트 값</h3>
      <p className="mt-1">
        차대번호 <code className="font-mono text-ink">TESTVIN0000000001</code>,
        부품 번호 <code className="font-mono text-ink">CC-1001</code>을 넣으면
        연결된 LOT과 협력사가 보입니다.
      </p>

      <p className="mt-4 border-t border-line pt-3 text-ink-3">
        모든 데이터는 가상입니다.
      </p>
    </aside>
  );
}

export default function LoginPage() {
  return (
    <main className="grid min-h-dvh w-full place-items-center p-4">
      <div className="flex w-full max-w-sm flex-col gap-4 md:max-w-3xl md:flex-row md:items-stretch">
        <div className="card w-full p-7 md:max-w-sm">
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
        <TestGuide />
      </div>
    </main>
  );
}
