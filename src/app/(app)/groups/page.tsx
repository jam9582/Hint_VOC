import { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import { toSeoulDate } from "@/lib/dates";
import { listMetricVocs, listProblemGroups } from "@/lib/db/metrics";
import { PageHeader } from "../page-header";
import { GroupCard } from "./group-card";

async function GroupsContent() {
  await requireUser();
  const [groups, vocs] = await Promise.all([
    listProblemGroups(),
    listMetricVocs(),
  ]);
  const today = toSeoulDate(new Date());
  const byId = new Map(vocs.map((voc) => [voc.voc_id, voc]));

  if (groups.length === 0) {
    return (
      <section className="card p-6 text-center text-[13px] text-ink-2">
        묶인 VOC가 없습니다.
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-[22px]">
      {groups.map((group) => (
        <GroupCard
          key={`${group.kind}-${group.voc_ids.join()}`}
          group={group}
          today={today}
          vocs={group.voc_ids.flatMap((id) => {
            const voc = byId.get(id);
            return voc ? [voc] : [];
          })}
        />
      ))}
    </div>
  );
}

export default function GroupsPage() {
  return (
    <main className="px-4 py-5 lg:px-7 lg:py-[22px]">
      <PageHeader title="같은 문제 묶음">
        <p className="text-[13px] text-ink-3">
          같은 LOT 또는 같은 부품·유형의 미종결 VOC
        </p>
      </PageHeader>
      <Suspense fallback={<div className="card h-80 animate-pulse" />}>
        <GroupsContent />
      </Suspense>
    </main>
  );
}
