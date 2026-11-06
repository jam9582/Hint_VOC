import { redirect } from "next/navigation";

/** 상세는 VOC를 골라야 열리므로 목록이 있는 현황으로 보낸다. */
export default function VocsPage() {
  redirect("/status");
}
