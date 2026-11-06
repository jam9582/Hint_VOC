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
      className="btn btn-danger btn-sm"
    >
      VOC 삭제
    </button>
  );
}
