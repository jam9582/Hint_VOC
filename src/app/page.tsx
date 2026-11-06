import { connection } from "next/server";
import { Suspense } from "react";
import { listActiveCodes } from "@/lib/db/codes";
import { getSupabaseEnv } from "@/lib/supabase/env";
import type { CodeRow } from "@/types/database";

type Status =
  | { kind: "not-configured" }
  | { kind: "error"; message: string }
  | { kind: "ok"; codes: CodeRow[] };

async function getStatus(): Promise<Status> {
  if (!getSupabaseEnv()) return { kind: "not-configured" };
  try {
    return { kind: "ok", codes: await listActiveCodes() };
  } catch (error) {
    const message = error instanceof Error ? error.message : "알 수 없는 오류";
    return { kind: "error", message };
  }
}

function countByGroup(codes: CodeRow[]) {
  const counts = new Map<string, number>();
  for (const { code_group } of codes) {
    counts.set(code_group, (counts.get(code_group) ?? 0) + 1);
  }
  return [...counts];
}

async function ConnectionStatus() {
  await connection();
  const status = await getStatus();

  if (status.kind === "not-configured") {
    return (
      <p className="mt-2">
        연결 전입니다. .env.local에 Supabase 주소와 공개 키를 넣어 주세요.
      </p>
    );
  }
  if (status.kind === "error" && status.message.includes("permission denied")) {
    return (
      <p className="mt-2">
        Supabase 연결은 됐습니다. code 표는 로그인해야 읽을 수 있어서 로그인
        기능을 만든 뒤 코드 목록이 보입니다.
      </p>
    );
  }
  if (status.kind === "error") {
    return (
      <p className="mt-2 break-words text-red-700">
        연결 실패: {status.message}
      </p>
    );
  }
  if (status.codes.length === 0) {
    return (
      <p className="mt-2">
        연결은 됐지만 읽어 온 코드가 0건입니다. code 표가 비어 있거나, 로그인
        전이라 권한 정책이 막았을 수 있습니다.
      </p>
    );
  }
  return (
    <>
      <p className="mt-2">연결 성공: 코드 {status.codes.length}건</p>
      <ul className="mt-2 text-sm">
        {countByGroup(status.codes).map(([group, count]) => (
          <li key={group}>
            {group}: {count}건
          </li>
        ))}
      </ul>
    </>
  );
}

/** Step 0 확인용 화면. 연결 상태만 보여 주며 이후 실제 화면으로 바뀐다. */
export default function Home() {
  return (
    <main className="mx-auto w-full max-w-2xl p-4 sm:p-8">
      <h1 className="text-2xl font-semibold">VOC 통합 관리 (8D)</h1>
      <section className="mt-6 rounded border border-zinc-300 p-4">
        <h2 className="font-medium">Supabase 연결 상태</h2>
        <Suspense fallback={<p className="mt-2">확인 중입니다.</p>}>
          <ConnectionStatus />
        </Suspense>
      </section>
    </main>
  );
}
