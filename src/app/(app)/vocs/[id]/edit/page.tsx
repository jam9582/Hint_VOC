import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { toSeoulDateTimeLocal } from "@/lib/dates";
import { listActiveCodes, toCodeOptions } from "@/lib/db/codes";
import { getVocDetail } from "@/lib/db/vocs";
import { PageHeader } from "../../../page-header";
import { EditForm } from "./edit-form";

async function EditContent({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [detail, codes] = await Promise.all([
    getVocDetail(id),
    listActiveCodes(),
  ]);
  if (!detail) notFound();

  const { voc, voc8d } = detail;
  const typeDetail = (voc.type_detail ?? {}) as Record<string, unknown>;

  return (
    <>
      <PageHeader title={`${voc.voc_id} 수정`}>
        <Link href={`/vocs/${voc.voc_id}`} className="text-link text-[13px]">
          상세로 돌아가기
        </Link>
      </PageHeader>
      <EditForm
        options={toCodeOptions(codes)}
        receivedAt={toSeoulDateTimeLocal(new Date(voc.received_at))}
        initial={{
          voc_id: voc.voc_id,
          channel: voc.channel,
          grade: voc.grade,
          owner: voc.owner,
          team: voc8d.team ?? "",
          vin: voc.vin,
          mileage_km: String(voc.mileage_km),
          part_name: voc.part_name,
          part_no: voc.part_no ?? "",
          voc_type: voc.voc_type,
          system: voc.system,
          frequency: voc.frequency,
          reproduced: voc.reproduced,
          symptom: voc.symptom,
          media_links: voc.media_links ?? "",
          detail: Object.fromEntries(
            Object.entries(typeDetail).map(([key, value]) => [
              key,
              String(value),
            ]),
          ),
        }}
      />
    </>
  );
}

export default function EditVocPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <main className="px-4 py-5 lg:px-7 lg:py-[22px]">
      <Suspense fallback={<div className="card h-96 animate-pulse" />}>
        <EditContent params={params} />
      </Suspense>
    </main>
  );
}
