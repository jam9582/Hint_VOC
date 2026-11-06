"use client";

import { useTransition } from "react";
import { deleteVocAction } from "./actions";

export function DeleteVocButton({ vocId }: { vocId: string }) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    const message = `${vocId}를 지울까요? 8D 내용과 단계 이력도 함께 지워지고 되돌릴 수 없습니다.`;
    if (!window.confirm(message)) return;
    startTransition(() => deleteVocAction(vocId));
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={handleClick}
      className="mt-2 rounded border border-red-700 px-3 py-1 text-sm text-red-700 disabled:opacity-50"
    >
      VOC 삭제
    </button>
  );
}
