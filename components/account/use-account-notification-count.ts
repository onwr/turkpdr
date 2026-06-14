"use client";

import { useCallback, useEffect, useState } from "react";

const POLL_INTERVAL_MS = 30_000;

export function useAccountNotificationCount(enabled = true, initialCount = 0) {
  const [count, setCount] = useState(initialCount);

  const fetchCount = useCallback(async () => {
    try {
      const res = await fetch("/api/account/notifications?limit=1");
      const data = (await res.json()) as { unreadCount?: number };
      if (res.ok && typeof data.unreadCount === "number") {
        setCount(data.unreadCount);
      }
    } catch {
      // ignore polling errors
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const timeoutId = window.setTimeout(() => {
      void fetchCount();
    }, 0);

    const intervalId = window.setInterval(() => {
      void fetchCount();
    }, POLL_INTERVAL_MS);

    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, [enabled, fetchCount]);

  return { count, refresh: fetchCount, setCount };
}
