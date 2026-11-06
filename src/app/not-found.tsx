import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh w-full place-items-center p-4">
      <section className="card w-full max-w-sm p-7 text-center">
        <h1 className="text-lg font-bold">페이지를 찾을 수 없습니다</h1>
        <p className="mt-1 text-[13px] font-medium text-ink-2">
          주소가 맞는지 확인해 주세요.
        </p>
        <Link href="/" className="btn mt-4">
          첫 화면으로 가기
        </Link>
      </section>
    </main>
  );
}
