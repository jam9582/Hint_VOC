import Link from "next/link";
import { PageHeader } from "../page-header";

export default function VocsPage() {
  return (
    <main className="px-4 py-5 lg:px-7 lg:py-[22px]">
      <PageHeader title="VOC 상세" />
      <section className="card max-w-xl p-6">
        <p className="text-[13px] font-medium text-ink-2">
          현황에서 VOC 번호를 누르면 상세 내용이 열립니다.
        </p>
        <Link href="/status" className="btn mt-4">
          현황으로 가기
        </Link>
      </section>
    </main>
  );
}
