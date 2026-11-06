"use client";

import { useEffect, useState } from "react";

const LOOKUP_DELAY_MS = 300;

type Loaded<T> =
  { key: string; status: "ready"; data: T } | { key: string; status: "failed" };

/**
 * 입력이 멈추면 조회한다. key가 바뀌면 이전 응답은 버린다.
 * lookup은 useCallback으로 감싸서 넘긴다.
 */
export function useDelayedLookup<T>(
  key: string,
  enabled: boolean,
  lookup: () => Promise<T>,
) {
  const [loaded, setLoaded] = useState<Loaded<T>>();

  useEffect(() => {
    if (!enabled) return;
    let stale = false;
    const timer = setTimeout(() => {
      lookup()
        .then((data) => {
          if (!stale) setLoaded({ key, status: "ready", data });
        })
        .catch(() => {
          if (!stale) setLoaded({ key, status: "failed" });
        });
    }, LOOKUP_DELAY_MS);
    return () => {
      stale = true;
      clearTimeout(timer);
    };
  }, [enabled, key, lookup]);

  return (loaded?.key === key ? loaded : { status: "loading" }) as
    { status: "loading" } | { status: "failed" } | { status: "ready"; data: T };
}
