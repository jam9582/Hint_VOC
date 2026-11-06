import Link from "next/link";
import type { Stage } from "@/types/codes";
import type { ProblemGroup } from "@/types/database";
import { DueBadge } from "../due-badge";
import { groupTitle } from "../status/problem-warnings";

export type GroupVoc = {
  voc_id: string;
  part_name: string;
  stage: Stage;
  owner: string;
  due_at: string;
};

/** 같은 문제 묶음 하나. 묶인 VOC의 단계·담당·기한을 한눈에 보여 준다. */
export function GroupCard({
  group,
  vocs,
  today,
}: {
  group: ProblemGroup;
  vocs: GroupVoc[];
  today: string;
}) {
  return (
    <section className="card min-w-0 pt-5 pb-1.5">
      <div className="flex items-center gap-3 px-[22px]">
        <span
          className={`grid size-10 shrink-0 place-items-center rounded-lg text-[13px] font-bold ${
            group.kind === "lot"
              ? "bg-late-bg text-late"
              : "bg-soon-bg text-soon-ink"
          }`}
        >
          {vocs.length}
        </span>
        <div className="min-w-0">
          <h2 className="card-title break-words">{groupTitle(group)}</h2>
          <p className="text-xs font-medium text-ink-3">미종결 {vocs.length}건</p>
        </div>
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[36rem] border-collapse text-left">
          <thead>
            <tr>
              {["VOC", "부품", "단계", "담당", "기한"].map((title) => (
                <th
                  key={title}
                  scope="col"
                  className="bg-inset px-3 py-2.5 text-xs font-semibold text-ink-2 first:pl-[22px]"
                >
                  {title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {vocs.map((voc) => (
              <tr
                key={voc.voc_id}
                className="relative border-b border-line last:border-b-0 hover:bg-inset"
              >
                <td className="py-3 pr-3 pl-[22px] whitespace-nowrap">
                  <Link
                    href={`/vocs/${voc.voc_id}`}
                    className="text-[13px] font-semibold after:absolute after:inset-0"
                  >
                    {voc.voc_id}
                  </Link>
                </td>
                <td className="max-w-56 truncate p-3 text-[13px] font-medium">
                  {voc.part_name}
                </td>
                <td className="p-3 text-[13px] font-medium whitespace-nowrap">
                  {voc.stage}
                </td>
                <td className="p-3 text-[13px] font-medium whitespace-nowrap">
                  {voc.owner}
                </td>
                <td className="p-3">
                  <DueBadge stage={voc.stage} dueAt={voc.due_at} today={today} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
