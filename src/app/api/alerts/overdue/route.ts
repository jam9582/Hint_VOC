import { timingSafeEqual } from "node:crypto";
import { sendOverdueAlerts } from "@/lib/alerts";

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const expected = Buffer.from(`Bearer ${secret}`);
  const received = Buffer.from(request.headers.get("authorization") ?? "");
  return (
    expected.length === received.length && timingSafeEqual(expected, received)
  );
}

/** 예약 실행이 하루에 한 번 부르는 주소. 로그인 대신 CRON_SECRET으로 확인한다. */
async function handle(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "권한이 없습니다." }, { status: 401 });
  }
  try {
    return Response.json(await sendOverdueAlerts());
  } catch (error) {
    console.error("지연 알림 실행 실패", error);
    return Response.json({ error: "실행하지 못했습니다." }, { status: 500 });
  }
}

export const GET = handle;
export const POST = handle;
