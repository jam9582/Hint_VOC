"use client";

import { useEffect, useState } from "react";
import type { VehicleHistory } from "@/lib/db/history";
import { lookupHistory } from "./history-actions";

const VIN_LENGTH = 17;
const LOOKUP_DELAY_MS = 300;

type Loaded = { key: string; history: VehicleHistory | null };

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-zinc-600">{label}</dt>
      <dd className="text-right">{value ?? "-"}</dd>
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
      <h3 className="font-medium">{title}</h3>
      <div className="mt-1 text-sm">{children}</div>
    </section>
  );
}

/** 차대번호와 부품 번호로 찾은 이력. 등록과 상세 화면에서 함께 쓴다. */
export function HistoryPanel({ vin, partNo }: { vin: string; partNo: string }) {
  const [loaded, setLoaded] = useState<Loaded>();
  const canLookup = vin.length === VIN_LENGTH;
  const key = `${vin}|${partNo}`;

  useEffect(() => {
    if (!canLookup) return;
    let stale = false;
    const timer = setTimeout(() => {
      lookupHistory(vin, partNo)
        .then((history) => {
          if (!stale) setLoaded({ key, history });
        })
        .catch(() => {
          if (!stale) setLoaded({ key, history: null });
        });
    }, LOOKUP_DELAY_MS);
    return () => {
      stale = true;
      clearTimeout(timer);
    };
  }, [canLookup, key, partNo, vin]);

  if (!canLookup) {
    return (
      <p className="text-sm">차대번호 17자를 입력하면 이력이 나타납니다.</p>
    );
  }
  if (loaded?.key !== key)
    return <p className="text-sm">이력을 찾는 중입니다.</p>;

  const { history } = loaded;
  if (!history) {
    return (
      <p role="alert" className="text-sm text-red-700">
        이력을 불러오지 못했습니다. 잠시 뒤 다시 시도해 주세요.
      </p>
    );
  }

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
