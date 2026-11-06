import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { listProblemGroups } from "@/lib/db/metrics";
import type { ProblemGroup } from "@/types/database";

function groupTitle(group: ProblemGroup) {
  return group.kind === "lot"
    ? `같은 부품·LOT (${group.part_no}, ${group.part_lot})`
    : `같은 유형·부위·부품 (${group.voc_type}, ${group.system}, ${group.part_no})`;
}

/** 같은 문제가 미종결로 2건 이상 쌓인 묶음을 알린다. */
export async function ProblemWarnings() {
  await requireUser();
  const groups = await listProblemGroups();

  return (
    <section id="groups" className="card h-fit scroll-mt-20 p-5">
      <h2 className="card-title">같은 문제 묶음</h2>
      <p className="mt-0.5 mb-3.5 text-xs font-medium text-ink-3">
        같은 LOT 또는 같은 부품·유형의 미종결 VOC
      </p>
      {groups.length === 0 ? (
        <p className="text-[13px] text-ink-2">묶인 VOC가 없습니다.</p>
      ) : (
        <ul role="alert" className="flex flex-col gap-3">
          {groups.map((group) => (
            <li
              key={groupTitle(group)}
              className="flex gap-3 rounded-lg border border-line p-3.5"
            >
              <span
                className={`grid size-10 shrink-0 place-items-center rounded-lg text-[13px] font-bold ${
                  group.kind === "lot"
                    ? "bg-late-bg text-late"
                    : "bg-soon-bg text-soon-ink"
                }`}
              >
                {group.voc_ids.length}
              </span>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold break-words">
                  {groupTitle(group)}
                </p>
                <p className="mt-0.5 text-xs font-medium text-ink-2">
                  미종결 {group.voc_ids.length}건
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {group.voc_ids.map((vocId) => (
                    <Link
                      key={vocId}
                      href={`/vocs/${vocId}`}
                      aria-label={vocId}
                      className="rounded bg-inset px-1.5 py-0.5 text-[10px] font-semibold text-ink-2 hover:text-primary"
                    >
                      {vocId.slice(-4)}
                    </Link>
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
