import { requireUser } from "@/lib/auth";
import { toSeoulDate } from "@/lib/dates";
import { getVocReport } from "@/lib/db/report";
import { reportToDocx } from "@/lib/rules/report-docx";

const DOCX_TYPE =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

/** 8D 보고서를 Word 파일로 내려받는 주소. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireUser();
  const { id } = await params;

  const report = await getVocReport(id);
  if (!report) {
    return Response.json({ error: "VOC를 찾지 못했습니다." }, { status: 404 });
  }

  const file = await reportToDocx(report, toSeoulDate(new Date()));
  const fileName = encodeURIComponent(`8D보고서_${report.vocId}.docx`);

  return new Response(new Uint8Array(file), {
    headers: {
      "Content-Type": DOCX_TYPE,
      // 한글 파일 이름은 filename*로 보내고, 못 읽는 프로그램을 위해 영문 이름도 둔다.
      "Content-Disposition": `attachment; filename="8D_report.docx"; filename*=UTF-8''${fileName}`,
      "Cache-Control": "private, no-store",
    },
  });
}
