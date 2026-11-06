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
  if (groups.length === 0) return null;

  return (
    <section
      role="alert"
      className="mt-4 rounded border border-amber-500 bg-amber-50 p-3 text-sm text-amber-950"
    >
      <h2 className="font-medium">같은 문제 묶음 경고</h2>
      <ul className="mt-1 flex flex-col gap-1">
        {groups.map((group) => (
          <li key={groupTitle(group)}>
            {groupTitle(group)}: 미종결 {group.voc_ids.length}건 ·{" "}
            {group.voc_ids.map((vocId, index) => (
              <span key={vocId}>
                {index > 0 && ", "}
                <Link href={`/vocs/${vocId}`} className="underline">
                  {vocId}
                </Link>
              </span>
            ))}
          </li>
        ))}
      </ul>
    </section>
  );
}
