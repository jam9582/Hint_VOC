"use client";

import { useEffect, useState } from "react";

const SHOW_MS = 4000;
const listeners = new Set<(message: string) => void>();

/** 화면이 새로 그려져도 남아야 하는 안내를 띄운다. */
export function showToast(message: string) {
  listeners.forEach((listener) => listener(message));
}

export function Toaster() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const listener = (next: string) => {
      setMessage(next);
      clearTimeout(timer);
      timer = setTimeout(() => setMessage(null), SHOW_MS);
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div
      role="status"
      data-toast
      className="pointer-events-none fixed inset-x-4 bottom-5 z-30 flex justify-center"
    >
      {message && (
        <p className="rounded-lg bg-ink px-4 py-2.5 text-[13px] font-semibold text-white shadow-card">
          {message}
        </p>
      )}
    </div>
  );
}
