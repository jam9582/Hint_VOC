import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VOC 통합 관리 (8D)",
  description: "VOC를 8D 단계 단일 양식으로 관리하는 웹 앱",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
