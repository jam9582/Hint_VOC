"use client";

import { useCallback } from "react";
import { lookupHistory } from "./history-actions";
import { useDelayedLookup } from "./use-delayed-lookup";

const VIN_LENGTH = 17;

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ink-3">{label}</dt>
      <dd className="text-right font-semibold break-all">{value ?? "-"}</dd>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-4 first:mt-0">
      <h3 className="card-title">{title}</h3>
      <div className="mt-2.5 flex flex-col gap-2 text-[13px] font-medium [&>dl]:flex [&>dl]:flex-col [&>dl]:gap-2">
        {children}
      </div>
    </section>
  );
}

/** 차대번호와 부품 번호로 찾은 이력. 등록과 상세 화면에서 함께 쓴다. */
export function HistoryPanel({ vin, partNo }: { vin: string; partNo: string }) {
  const canLookup = vin.length === VIN_LENGTH;
  const key = `${vin}|${partNo}`;
  const lookup = useCallback(() => lookupHistory(vin, partNo), [vin, partNo]);
  const result = useDelayedLookup(key, canLookup, lookup);

  if (!canLookup) {
    return (
      <p className="text-[13px] text-ink-2">
        차대번호 17자를 입력하면 이력이 나타납니다.
      </p>
    );
  }
  if (result.status === "loading") {
    return <p className="text-[13px] text-ink-2">이력을 찾는 중입니다.</p>;
  }
  if (result.status === "failed") {
    return (
      <p role="alert" className="text-[13px] font-semibold text-late">
        이력을 불러오지 못했습니다. 잠시 뒤 다시 시도해 주세요.
      </p>
    );
  }

  const history = result.data;
  return (
    <>
      <Section title="차량 이력">
        {history.vehicle ? (
          <dl>
            <Row label="차종" value={history.vehicle.model} />
            <Row label="생산일" value={history.vehicle.prod_date} />
            <Row label="공장" value={history.vehicle.plant} />
            <Row label="라인" value={history.vehicle.line} />
            <Row label="근무조" value={history.vehicle.shift} />
          </dl>
        ) : (
          <p>이력 없음</p>
        )}
      </Section>
      <Section title="부품 이력">
        {!partNo && <p>부품 번호를 입력하면 나타납니다.</p>}
        {partNo && !history.part && <p>이력 없음</p>}
        {partNo && history.part && (
          <dl>
            <Row label="부품 LOT" value={history.part.part_lot} />
            <Row label="협력사" value={history.part.supplier} />
          </dl>
        )}
      </Section>
    </>
  );
}
