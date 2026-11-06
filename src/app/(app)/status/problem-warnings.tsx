import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { listProblemGroups } from "@/lib/db/metrics";
import type { ProblemGroup } from "@/types/database";
import { GroupKindBadge } from "../group-kind";

export function groupTitle(group: ProblemGroup) {
  return group.kind === "lot"
    ? `${group.part_no} · LOT ${group.part_lot}`
    : `${group.part_no} · ${group.voc_type} · ${group.system}`;
}

/** 같은 문제가 미종결로 2건 이상 쌓인 묶음을 알린다. */
export async function ProblemWarnings() {
  await requireUser();
  const groups = await listProblemGroups();

  return (
    <section id="groups" className="card h-fit scroll-mt-20 p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="card-title">같은 문제 묶음</h2>
        <Link href="/groups" className="text-link text-xs">
          전체 보기
        </Link>
      </div>
      <p className="mt-0.5 mb-3.5 text-xs font-medium text-ink-3">
        아직 끝나지 않은 VOC 중 원인이 같을 수 있는 건을 모았습니다
      </p>
      {groups.length === 0 ? (
        <p className="text-[13px] text-ink-2">묶인 VOC가 없습니다.</p>
      ) : (
        <ul role="alert" className="flex flex-col gap-3">
          {groups.map((group) => (
            <li
              key={groupTitle(group)}
              className="rounded-lg border border-line p-3.5"
            >
              <GroupKindBadge kind={group.kind} />
              <p className="mt-1.5 text-[13px] font-semibold break-words">
                {groupTitle(group)}
              </p>
              <p className="mt-0.5 text-xs font-medium text-ink-2">
                아직 끝나지 않은 VOC {group.voc_ids.length}건
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {group.voc_ids.map((vocId) => (
                  <Link
                    key={vocId}
                    href={`/vocs/${vocId}`}
                    className="rounded bg-inset px-1.5 py-0.5 text-[10px] font-semibold text-ink-2 hover:text-primary"
                  >
                    {vocId}
                  </Link>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
