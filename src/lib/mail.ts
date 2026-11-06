import "server-only";

import nodemailer from "nodemailer";

function getMailConfig() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, MAIL_FROM } =
    process.env;
  if (!SMTP_HOST || !MAIL_FROM) return null;
  return {
    from: MAIL_FROM,
    transport: {
      host: SMTP_HOST,
      port: Number(SMTP_PORT || 587),
      secure: Number(SMTP_PORT) === 465,
      auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASSWORD } : undefined,
    },
  };
}

export function isMailConfigured() {
  return getMailConfig() !== null;
}

export async function sendMail(mail: {
  to: string[];
  subject: string;
  text: string;
}) {
  const config = getMailConfig();
  if (!config) throw new Error("메일 설정이 없습니다.");
  await nodemailer
    .createTransport(config.transport)
    .sendMail({ from: config.from, ...mail });
}
