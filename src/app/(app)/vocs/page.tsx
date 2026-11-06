import Link from "next/link";

export default function VocsPage() {
  return (
    <main className="mx-auto w-full max-w-2xl p-4 sm:p-8">
      <h1 className="text-xl font-semibold">VOC 상세</h1>
      <p className="mt-2">
        <Link href="/status" className="underline">
          현황
        </Link>
        에서 VOC 번호를 누르면 상세 내용이 열립니다.
      </p>
    </main>
  );
}
