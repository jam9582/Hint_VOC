import Link from "next/link";

export default function VocNotFound() {
  return (
    <main className="px-4 py-5 lg:px-7 lg:py-[22px]">
      <section className="card max-w-xl p-6">
        <h1 className="text-base font-semibold">VOC를 찾을 수 없습니다</h1>
        <p className="mt-1 text-[13px] font-medium text-ink-2">
          번호가 틀렸거나 삭제된 VOC입니다.
        </p>
        <Link href="/status" className="btn mt-4">
          현황으로 가기
        </Link>
      </section>
    </main>
  );
}
