"use client";

import { useState } from "react";

type CopyState = "idle" | "copied" | "failed";

const COPY_LABEL: Record<CopyState, string> = {
  idle: "복사",
  copied: "복사했습니다",
  failed: "복사하지 못했습니다",
};

/** 표 모양과 글자를 함께 넣어, 붙여 넣는 곳이 알맞은 쪽을 고르게 한다. */
async function copyReport(text: string, html: string) {
  if (typeof ClipboardItem === "undefined") {
    await navigator.clipboard.writeText(text);
    return;
  }
  await navigator.clipboard.write([
    new ClipboardItem({
      "text/plain": new Blob([text], { type: "text/plain" }),
      "text/html": new Blob([html], { type: "text/html" }),
    }),
  ]);
}

export function ReportActions({
  vocId,
  text,
  html,
}: {
  vocId: string;
  text: string;
  html: string;
}) {
  const [copyState, setCopyState] = useState<CopyState>("idle");

  async function handleCopy() {
    try {
      await copyReport(text, html);
      setCopyState("copied");
    } catch (error) {
      console.error("보고서 복사 실패", error);
      setCopyState("failed");
    }
  }

  /** PDF 저장 창의 기본 파일 이름은 문서 제목을 따른다. */
  function handlePrint() {
    const title = document.title;
    document.title = `8D보고서_${vocId}`;
    window.print();
    document.title = title;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      <button type="button" onClick={handleCopy} className="btn btn-light btn-sm">
        {COPY_LABEL[copyState]}
      </button>
      <a
        href={`/vocs/${vocId}/report/word`}
        download
        className="btn btn-light btn-sm"
      >
        Word 내보내기
      </a>
      <button type="button" onClick={handlePrint} className="btn btn-sm">
        PDF 저장·인쇄
      </button>
    </div>
  );
}
