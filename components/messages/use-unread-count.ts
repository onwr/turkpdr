"use client";

import { useCallback, useEffect, useState } from "react";

const POLL_INTERVAL_MS = 15_000;

export function useMessageUnreadCount(enabled = true, initialCount = 0) {
  const [count, setCount] = useState(initialCount);

  const fetchCount = useCallback(async () => {
    try {
      const res = await fetch("/api/messages/unread-count");
      const data = (await res.json()) as { count?: number };
      if (res.ok && typeof data.count === "number") {
        setCount(data.count);
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

  return { count, refresh: fetchCount };
}
