import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { logout } from "./actions";

export async function UserMenu() {
  const user = await requireUser();

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      {user.role === "admin" && (
        <Link href="/admin" className="underline">
          관리자
        </Link>
      )}
      <span>
        {user.name} ({user.role === "admin" ? "관리자 계정" : "일반 계정"})
      </span>
      <form action={logout}>
        <button type="submit" className="rounded border border-zinc-400 px-2 py-1">
          로그아웃
        </button>
      </form>
    </div>
  );
}
