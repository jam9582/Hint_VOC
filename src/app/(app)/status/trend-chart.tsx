"use client";

import { useState } from "react";
import type { TrendWeek } from "@/lib/rules/dashboard";

const WIDTH = 700;
const HEIGHT = 120;
const PAD = 8;

const SERIES = [
  { key: "received", label: "접수", color: "#2940d3" },
  { key: "closed", label: "종결", color: "#ff7a59" },
] as const;

const shortDate = (week: string) =>
  `${Number(week.slice(5, 7))}/${Number(week.slice(8))}`;

/** 최근 8주 접수·종결 건수. 값은 줄에 올리면 보이고, 표로도 읽을 수 있다. */
export function TrendChart({ weeks }: { weeks: TrendWeek[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const max = Math.max(1, ...weeks.flatMap((w) => [w.received, w.closed]));
  const xOf = (index: number) =>
    PAD + (index * (WIDTH - PAD * 2)) / (weeks.length - 1);
  const yOf = (value: number) =>
    HEIGHT - PAD - (value / max) * (HEIGHT - PAD * 2);
  const active = hovered === null ? null : weeks[hovered];

  return (
    <figure className="mt-5">
      <figcaption className="flex items-center justify-between gap-3">
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
        <span className="text-xs font-medium text-ink-3">최근 8주 · 주별 건수</span>
      </figcaption>

      <div className="relative mt-2" onMouseLeave={() => setHovered(null)}>
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
              points={weeks
                .map((week, index) => `${xOf(index)},${yOf(week[series.key])}`)
                .join(" ")}
            />
          ))}
        </svg>
        <span className="absolute top-0 left-0 text-[11px] font-medium text-ink-3">
          {max}건
        </span>

        <div className="absolute inset-0 flex">
          {weeks.map((week, index) => (
            <div
              key={week.week}
              className="flex-1"
              onMouseEnter={() => setHovered(index)}
            />
          ))}
        </div>

        {active && hovered !== null && (
          <div
            className="pointer-events-none absolute top-1 z-10 rounded-md bg-ink px-2.5 py-1.5 text-[11px] font-medium whitespace-nowrap text-white shadow-card"
            style={
              hovered < weeks.length / 2
                ? { left: `calc(${(hovered / (weeks.length - 1)) * 100}% + 10px)` }
                : { right: `calc(${(1 - hovered / (weeks.length - 1)) * 100}% + 10px)` }
            }
          >
            <p>{shortDate(active.week)} 주</p>
            {SERIES.map((series) => (
              <p key={series.key}>
                {series.label} {active[series.key]}건
              </p>
            ))}
          </div>
        )}
      </div>

      <div className="mt-1 flex justify-between text-[11px] font-medium text-ink-3">
        {weeks.map((week) => (
          <span key={week.week}>{shortDate(week.week)}</span>
        ))}
      </div>

      <table className="sr-only">
        <caption>주별 접수와 종결 건수</caption>
        <thead>
          <tr>
            <th scope="col">주 시작일</th>
            <th scope="col">접수</th>
            <th scope="col">종결</th>
          </tr>
        </thead>
        <tbody>
          {weeks.map((week) => (
            <tr key={week.week}>
              <th scope="row">{week.week}</th>
              <td>{week.received}</td>
              <td>{week.closed}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
