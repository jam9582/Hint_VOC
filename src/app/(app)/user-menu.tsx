import { requireUser } from "@/lib/auth";
import { logout } from "./actions";
import { RAIL_ICONS } from "./app-rail";

export async function UserMenu() {
  const user = await requireUser();
  const accountType = user.role === "admin" ? "관리자 계정" : "일반 계정";

  return (
    <div className="flex items-center gap-2 lg:flex-col lg:gap-3">
      <form action={logout}>
        <button
          type="submit"
          aria-label="로그아웃"
          title="로그아웃"
          className="grid size-10 cursor-pointer place-items-center rounded-lg text-ink-3 transition-colors hover:bg-inset hover:text-ink-2"
        >
          {RAIL_ICONS.logout}
        </button>
      </form>
      <div
        title={`${user.name} (${accountType})`}
        className="grid size-9 place-items-center rounded-full bg-primary-bg text-xs font-bold text-primary"
      >
        <span aria-hidden>{user.name.slice(0, 2)}</span>
        <span className="sr-only">
          {user.name} ({accountType})
        </span>
      </div>
    </div>
  );
}
