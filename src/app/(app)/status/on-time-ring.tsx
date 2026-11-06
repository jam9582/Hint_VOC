import { SOON_DAYS } from "@/lib/rules/dashboard";

const RADIUS = 60;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** 미종결 VOC 중 기한을 넘기지 않은 비율. */
export function OnTimeRing({
  open,
  late,
  soon,
}: {
  open: number;
  late: number;
  soon: number;
}) {
  const breakdown = [
    { label: "기한 초과", value: late, className: "bg-late" },
    { label: `${SOON_DAYS}일 안`, value: soon, className: "bg-soon" },
    { label: "여유", value: open - late - soon, className: "bg-chart" },
  ];
  const rate = open === 0 ? null : ((open - late) / open) * 100;

  return (
    <section className="card flex flex-col items-center gap-0 p-5">
      <h2 className="card-title self-stretch">기한 안에 진행 중</h2>
      <div className="relative my-3.5 size-[150px]">
        <svg viewBox="0 0 150 150" className="size-full" aria-hidden>
          <circle
            cx="75"
            cy="75"
            r={RADIUS}
            fill="none"
            stroke="#eef1f7"
            strokeWidth="12"
          />
          {rate !== null && (
            <circle
              cx="75"
              cy="75"
              r={RADIUS}
              fill="none"
              stroke="#2940d3"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${(rate / 100) * CIRCUMFERENCE} ${CIRCUMFERENCE}`}
              transform="rotate(-90 75 75)"
            />
          )}
        </svg>
        <p className="absolute inset-0 grid place-items-center text-[30px] font-semibold">
          {rate === null ? "-" : `${Math.round(rate)}%`}
        </p>
      </div>
      <p className="mb-4 text-center text-xs font-medium text-ink-3">
        미종결 {open}건 중 {open - late}건이 기한 안에 있어요
      </p>
      <ul className="mt-auto flex w-full flex-col gap-2 border-t border-line pt-4">
        {breakdown.map((item) => (
          <li
            key={item.label}
            className="flex items-center justify-between text-[13px] font-medium text-ink-2"
          >
            <span className="flex items-center gap-2">
              <i className={`size-2 rounded-full ${item.className}`} />
              {item.label}
            </span>
            <b className="font-semibold text-ink">{item.value}건</b>
          </li>
        ))}
      </ul>
    </section>
  );
}
