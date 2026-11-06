import { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import { listActiveCodes } from "@/lib/db/codes";

async function CodeSummary() {
  await requireUser();
  const codes = await listActiveCodes();
  const groups = new Set(codes.map((code) => code.code_group));

  return (
    <p className="mt-2">
      code 표 읽기 성공: {groups.size}개 묶음, {codes.length}건
    </p>
  );
}

/** 임시 첫 화면. 등록·현황 화면이 생기면 바뀐다. */
export default function Home() {
  return (
    <main className="mx-auto w-full max-w-2xl p-4 sm:p-8">
      <h1 className="text-xl font-semibold">로그인 완료</h1>
      <Suspense fallback={<p className="mt-2">확인 중입니다.</p>}>
        <CodeSummary />
      </Suspense>
    </main>
  );
}
