"use client";

import { useCallback } from "react";
import { toSeoulDate } from "@/lib/dates";
import { lookupSimilarVocs } from "./history-actions";
import { useDelayedLookup } from "./use-delayed-lookup";

const VIN_LENGTH = 17;

const MATCH_LABELS: Record<number, string> = {
  1: "같은 부품·LOT",
  2: "같은 유형·부위·부품",
  3: "같은 차종·유형·부위",
};

/** 유사 VOC 목록. 등록과 상세 화면에서 함께 쓴다. */
export function SimilarPanel({
  vin,
  partNo,
  vocType,
  system,
  excludeVocId,
}: {
  vin: string;
  partNo: string;
  vocType: string;
  system: string;
  excludeVocId?: string;
}) {
  const hasVin = vin.length === VIN_LENGTH;
  const hasTypeAndSystem = Boolean(vocType && system);
  // 조건 ①②③ 중 하나라도 계산할 수 있어야 조회한다.
  const canLookup =
    (hasVin && Boolean(partNo)) ||
    (hasTypeAndSystem && (Boolean(partNo) || hasVin));

  const key = [vin, partNo, vocType, system, excludeVocId].join("|");
  const lookup = useCallback(
    () => lookupSimilarVocs({ vin, partNo, vocType, system, excludeVocId }),
    [vin, partNo, vocType, system, excludeVocId],
  );
  const result = useDelayedLookup(key, canLookup, lookup);

  return (
    <section>
      <h3 className="card-title">유사 VOC</h3>
      <div className="mt-2.5 text-[13px] font-medium text-ink-2">
        {!canLookup && (
          <p>차대번호, 부품 번호, 유형, 부위를 입력하면 나타납니다.</p>
        )}
        {canLookup && result.status === "loading" && <p>찾는 중입니다.</p>}
        {canLookup && result.status === "failed" && (
          <p role="alert" className="font-semibold text-late">
            유사 VOC를 불러오지 못했습니다.
          </p>
        )}
        {canLookup && result.status === "ready" && result.data.length === 0 && (
          <p>유사 VOC 없음</p>
        )}
        {canLookup && result.status === "ready" && result.data.length > 0 && (
          <ul className="flex flex-col divide-y divide-line">
            {result.data.map((voc) => (
              <li key={voc.voc_id} className="py-2.5 first:pt-0 last:pb-0">
                <a
                  href={`/vocs/${voc.voc_id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-link"
                >
                  {voc.voc_id}
                </a>
                <p>
                  {toSeoulDate(new Date(voc.received_at))} · {voc.part_name} ·{" "}
                  {voc.stage}
                </p>
                <p className="text-xs text-ink-3">
                  {voc.matched.map((number) => MATCH_LABELS[number]).join(", ")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
