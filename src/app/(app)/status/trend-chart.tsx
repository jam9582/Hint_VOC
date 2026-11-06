"use client";

import { useState, type PointerEvent } from "react";
import type { Trend } from "@/lib/rules/dashboard";

const WIDTH = 700;
const HEIGHT = 120;
const PAD = 8;

const SERIES = [
  { key: "received", label: "접수", color: "#2940d3" },
  { key: "closed", label: "종결", color: "#ff7a59" },
] as const;

const VIEWS = [
  { key: "weekly", label: "주별", note: "최근 8주 · 주별 건수", dateTitle: "주 시작일" },
  { key: "daily", label: "날짜별", note: "최근 8주 · 날짜별 건수", dateTitle: "날짜" },
  { key: "cumulative", label: "누적", note: "최근 8주 · 전체 기간 누적 건수", dateTitle: "날짜" },
] as const;

type ViewKey = (typeof VIEWS)[number]["key"];

const shortDate = (date: string) =>
  `${Number(date.slice(5, 7))}/${Number(date.slice(8))}`;

/** 최근 8주 접수·종결 추이. 값은 줄에 올리면 보이고, 표로도 읽을 수 있다. */
export function TrendChart({ trend }: { trend: Trend }) {
  const [viewKey, setViewKey] = useState<ViewKey>("weekly");
  const [hovered, setHovered] = useState<number | null>(null);
  const view = VIEWS.find((item) => item.key === viewKey) ?? VIEWS[0];
  const points = trend[viewKey];
  const lastIndex = points.length - 1;
  const max = Math.max(1, ...points.flatMap((p) => [p.received, p.closed]));
  const xOf = (index: number) =>
    PAD + (index * (WIDTH - PAD * 2)) / lastIndex;
  const yOf = (value: number) =>
    HEIGHT - PAD - (value / max) * (HEIGHT - PAD * 2);
  const active = hovered === null ? null : points[hovered];
  // 날짜별은 칸이 좁아 주 시작일(월요일)에만 날짜를 적는다.
  const ticks = points.flatMap((point, index) =>
    viewKey === "weekly" || index % 7 === 0 ? [{ point, index }] : [],
  );

  const hoverAt = (event: PointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - box.left) / box.width) * WIDTH;
    const index = Math.round(((x - PAD) / (WIDTH - PAD * 2)) * lastIndex);
    setHovered(Math.min(lastIndex, Math.max(0, index)));
  };

  return (
    <figure className="mt-5">
      <figcaption className="flex flex-wrap items-center justify-between gap-3">
        <span className="flex gap-3.5 text-xs font-medium text-ink-2">
          {SERIES.map((series) => (
            <span key={series.key} className="flex items-center gap-1.5">
              <i
                className="inline-block h-[3px] w-2.5 rounded-sm"
                style={{ background: series.color }}
              />
              {series.label}
            </span>
          ))}
        </span>
        <span className="flex items-center gap-3">
          <span className="text-xs font-medium text-ink-3">{view.note}</span>
          <span className="flex gap-1 rounded-md bg-inset p-[3px]">
            {VIEWS.map((item) => (
              <button
                key={item.key}
                type="button"
                aria-pressed={item.key === viewKey}
                onClick={() => {
                  setViewKey(item.key);
                  setHovered(null);
                }}
                className={`rounded-[5px] px-2.5 py-1 text-xs font-semibold ${
                  item.key === viewKey
                    ? "bg-card text-primary shadow-card"
                    : "text-ink-2"
                }`}
              >
                {item.label}
              </button>
            ))}
          </span>
        </span>
      </figcaption>

      <div
        className="relative mt-2"
        onPointerMove={hoverAt}
        onPointerLeave={() => setHovered(null)}
      >
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          preserveAspectRatio="none"
          className="block h-[120px] w-full"
          aria-hidden
        >
          {[0, max].map((value) => (
            <line
              key={value}
              x1={0}
              x2={WIDTH}
              y1={yOf(value)}
              y2={yOf(value)}
              stroke="#e5eaf2"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {hovered !== null && (
            <line
              x1={xOf(hovered)}
              x2={xOf(hovered)}
              y1={0}
              y2={HEIGHT}
              stroke="#94a4c4"
              strokeDasharray="3 3"
              vectorEffect="non-scaling-stroke"
            />
          )}
          {SERIES.map((series) => (
            <polyline
              key={series.key}
              fill="none"
              stroke={series.color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              points={points
                .map((point, index) => `${xOf(index)},${yOf(point[series.key])}`)
                .join(" ")}
            />
          ))}
        </svg>
        <span className="absolute top-0 left-0 text-[11px] font-medium text-ink-3">
          {max}건
        </span>

        {active && hovered !== null && (
          <div
            className="pointer-events-none absolute top-1 z-10 rounded-md bg-ink px-2.5 py-1.5 text-[11px] font-medium whitespace-nowrap text-white shadow-card"
            style={
              hovered < points.length / 2
                ? { left: `calc(${(hovered / lastIndex) * 100}% + 10px)` }
                : { right: `calc(${(1 - hovered / lastIndex) * 100}% + 10px)` }
            }
          >
            <p>
              {shortDate(active.date)}
              {viewKey === "weekly" && " 주"}
            </p>
            {SERIES.map((series) => (
              <p key={series.key}>
                {series.label} {active[series.key]}건
              </p>
            ))}
            {viewKey === "cumulative" && (
              <p>미종결 {active.received - active.closed}건</p>
            )}
          </div>
        )}
      </div>

      <div className="relative mt-1 h-4 text-[11px] font-medium text-ink-3">
        {ticks.map(({ point, index }) => (
          <span
            key={point.date}
            className={`absolute ${
              index === 0
                ? ""
                : index === lastIndex
                  ? "-translate-x-full"
                  : "-translate-x-1/2"
            }`}
            style={{ left: `${(index / lastIndex) * 100}%` }}
          >
            {shortDate(point.date)}
          </span>
        ))}
      </div>

      <div className="sr-only">
      <table>
        <caption>{view.note}</caption>
        <thead>
          <tr>
            <th scope="col">{view.dateTitle}</th>
            <th scope="col">접수</th>
            <th scope="col">종결</th>
          </tr>
        </thead>
        <tbody>
          {points.map((point) => (
            <tr key={point.date}>
              <th scope="row">{point.date}</th>
              <td>{point.received}</td>
              <td>{point.closed}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </figure>
  );
}
