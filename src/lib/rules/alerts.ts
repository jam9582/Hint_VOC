import type { VocRow } from "@/types/database";

/** 지연 알림 수신자 정하기 (PRD 15장 결정 9). */

export type AlertVoc = Pick<
  VocRow,
  "voc_id" | "owner" | "stage" | "due_at" | "part_name"
>;

export type AlertAccount = {
  name: string;
  role: "user" | "admin";
  email: string | null;
};

export type AlertMail = { to: string[]; vocs: AlertVoc[] };

/** 담당과 이름이 같은 계정이 하나면 그 메일로, 아니면 관리자들에게 보낸다. */
export function getRecipients(owner: string, accounts: AlertAccount[]) {
  const matched = accounts.filter((account) => account.name === owner);
  if (matched.length === 1 && matched[0].email) return [matched[0].email];
  return accounts
    .filter((account) => account.role === "admin" && account.email)
    .map((account) => account.email as string);
}

/** 수신자가 같은 VOC를 메일 한 통으로 묶는다. 수신자가 없으면 뺀다. */
export function groupAlerts(vocs: AlertVoc[], accounts: AlertAccount[]) {
  const mails = new Map<string, AlertMail>();
  for (const voc of vocs) {
    const to = getRecipients(voc.owner, accounts);
    if (to.length === 0) continue;
    const key = [...to].sort().join(",");
    const mail = mails.get(key) ?? { to, vocs: [] };
    mail.vocs.push(voc);
    mails.set(key, mail);
  }
  return [...mails.values()];
}

export function formatAlertLines(vocs: AlertVoc[]) {
  return vocs
    .map(
      (voc) =>
        `${voc.voc_id} | ${voc.stage} | 기한 ${voc.due_at} | ${voc.part_name}`,
    )
    .join("\n");
}
