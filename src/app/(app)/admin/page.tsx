import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";

async function AdminContent() {
  await requireAdmin();
  return (
    <>
      <h1 className="text-xl font-semibold">관리자</h1>
      <p className="mt-2">code 관리와 계정 관리는 Step 9에서 만듭니다.</p>
    </>
  );
}

export default function AdminPage() {
  return (
    <main className="mx-auto w-full max-w-2xl p-4 sm:p-8">
      <Suspense fallback={<p>확인 중입니다.</p>}>
        <AdminContent />
      </Suspense>
    </main>
  );
}
