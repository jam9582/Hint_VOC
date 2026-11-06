"use client";

/** 화면을 그리다 서버 오류가 나면 보여 준다. */
export default function AppError({ retry }: { retry: () => void }) {
  return (
    <main className="px-4 py-5 lg:px-7 lg:py-[22px]">
      <section className="card max-w-xl p-6">
        <h1 className="text-base font-semibold">화면을 불러오지 못했습니다</h1>
        <p className="mt-1 text-[13px] font-medium text-ink-2">
          잠시 뒤 다시 시도해 주세요. 계속되면 담당자에게 알려 주세요.
        </p>
        <button type="button" onClick={() => retry()} className="btn mt-4">
          다시 시도
        </button>
      </section>
    </main>
  );
}
