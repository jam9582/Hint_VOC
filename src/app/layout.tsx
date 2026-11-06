import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "VOC 통합 관리 (8D)",
  description: "VOC를 8D 단계 단일 양식으로 관리하는 웹 앱",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${montserrat.variable} h-full antialiased`}>
      <head>
        {/* 한글 글꼴. 숫자와 영문은 Montserrat를 쓴다. */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
