import "server-only";

import { toSeoulDate } from "@/lib/dates";
import { listAccounts } from "@/lib/db/admin";
import { listOverdueVocs, getAlertVoc, markAlerted } from "@/lib/db/alerts";
import { isMailConfigured, sendMail } from "@/lib/mail";
import {
  formatAlertLines,
  getRecipients,
  groupAlerts,
} from "@/lib/rules/alerts";

/** 기한이 지난 VOC를 담당자에게 알린다. 오늘 이미 알린 VOC는 뺀다. */
export async function sendOverdueAlerts() {
  if (!isMailConfigured()) return { skipped: true, mails: 0, vocs: 0 };

  const today = toSeoulDate(new Date());
  const [vocs, accounts] = await Promise.all([
    listOverdueVocs(today),
    listAccounts(),
  ]);

  let mailCount = 0;
  let vocCount = 0;
  const failures: string[] = [];

  for (const mail of groupAlerts(vocs, accounts)) {
    try {
      await sendMail({
        to: mail.to,
        subject: `[VOC] 기한 초과 ${mail.vocs.length}건`,
        text: `기한이 지난 VOC입니다.\n\n${formatAlertLines(mail.vocs)}`,
      });
      await markAlerted(
        mail.vocs.map((voc) => voc.voc_id),
        today,
      );
      mailCount += 1;
      vocCount += mail.vocs.length;
    } catch (error) {
      console.error("지연 알림 실패", error);
      failures.push(mail.to.join(","));
    }
  }

  return { skipped: false, mails: mailCount, vocs: vocCount, failures };
}

/** 안전·법규 VOC를 접수 즉시 알린다. 실패해도 접수에는 영향을 주지 않는다. */
export async function sendSafetyAlert(vocId: string) {
  if (!isMailConfigured()) return;
  try {
    const [voc, accounts] = await Promise.all([
      getAlertVoc(vocId),
      listAccounts(),
    ]);
    const to = voc ? getRecipients(voc.owner, accounts) : [];
    if (!voc || to.length === 0) return;

    await sendMail({
      to,
      subject: `[VOC] 안전·법규 접수 ${voc.voc_id}`,
      text: `안전·법규 등급 VOC가 접수됐습니다.\n\n${formatAlertLines([voc])}`,
    });
    await markAlerted([voc.voc_id], toSeoulDate(new Date()));
  } catch (error) {
    console.error("안전·법규 알림 실패", error);
  }
}
