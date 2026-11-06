import { redirect } from "next/navigation";

/** 첫 화면은 현황이다. */
export default function Home() {
  redirect("/status");
}
