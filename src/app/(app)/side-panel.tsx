import { requireUser } from "@/lib/auth";
import { toSeoulDate } from "@/lib/dates";
import { listMetricVocs, listProblemGroups } from "@/lib/db/metrics";
import { GRADE_SAFETY } from "@/types/codes";
import { PanelLink } from "./nav-links";

const statusHref = (key: string, value: string) =>
  `/status?${new URLSearchParams({ [key]: value })}`;

/** 자주 찾는 목록 바로가기. 폭이 좁으면 옆으로 미는 줄이 된다. */
export async function SidePanel() {
  const user = await requireUser();
  const [vocs, groups] = await Promise.all([
    listMetricVocs(),
    listProblemGroups(),
  ]);
  const today = toSeoulDate(new Date());
  const count = (test: (voc: (typeof vocs)[number]) => boolean) =>
    vocs.filter(test).length;

  return (
    <nav
      aria-label="VOC 바로가기"
      className="flex gap-1 overflow-x-auto border-b border-line bg-card px-3 py-2 lg:sticky lg:top-0 lg:h-dvh lg:flex-col lg:border-r lg:border-b-0 lg:px-2.5 lg:py-[22px] print:hidden"
    >
      <p className="hidden px-3 pb-2 text-[13px] font-semibold text-primary lg:block">
        VOC 현황
      </p>
      <PanelLink href="/status" label="전체 현황" count={vocs.length} />
      <PanelLink
        href={statusHref("owner", user.name)}
        label="내 담당"
        count={count((voc) => voc.owner === user.name)}
      />
      <PanelLink
        href="/status?overdue=1"
        label="기한 초과"
        count={count((voc) => voc.stage !== "종결" && voc.due_at < today)}
      />
      <PanelLink
        href={statusHref("grade", GRADE_SAFETY)}
        label={GRADE_SAFETY}
        count={count((voc) => voc.grade === GRADE_SAFETY)}
      />
      <p className="mt-4 hidden px-3 pb-2 text-[13px] font-semibold text-ink lg:block">
        더 보기
      </p>
      <PanelLink href="/status#groups" label="같은 문제 묶음" count={groups.length} />
      <PanelLink
        href={statusHref("stage", "종결")}
        label="종결 보관함"
        count={count((voc) => voc.stage === "종결")}
      />
      {user.role === "admin" && <PanelLink href="/admin" label="관리자" />}
    </nav>
  );
}
