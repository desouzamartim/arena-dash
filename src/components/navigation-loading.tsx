"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { RoutePending } from "@/components/route-pending";

const MIN_PENDING_MS = 220;
const MAX_PENDING_MS = 6000;

function shouldShowNavigationLoading(event: MouseEvent) {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return false;
  }

  const link = (event.target as Element | null)?.closest("a[href]");

  if (!(link instanceof HTMLAnchorElement)) {
    return false;
  }

  if (link.target || link.hasAttribute("download")) {
    return false;
  }

  const destination = new URL(link.href);

  if (destination.origin !== window.location.origin) {
    return false;
  }

  return destination.href !== window.location.href;
}

export function NavigationLoading() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, setIsPending] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const startedAtRef = useRef<number | null>(null);

  useEffect(() => {
    const clearPending = () => {
      const startedAt = startedAtRef.current;
      const elapsed = startedAt ? Date.now() - startedAt : MIN_PENDING_MS;
      const remaining = Math.max(0, MIN_PENDING_MS - elapsed);

      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      window.setTimeout(() => {
        setIsPending(false);
        startedAtRef.current = null;
      }, remaining);
    };

    clearPending();
  }, [pathname, searchParams]);

  useEffect(() => {
    const startPending = () => {
      startedAtRef.current = Date.now();
      setIsPending(true);

      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = window.setTimeout(() => {
        setIsPending(false);
        startedAtRef.current = null;
        timeoutRef.current = null;
      }, MAX_PENDING_MS);
    };

    const handleClick = (event: MouseEvent) => {
      if (shouldShowNavigationLoading(event)) {
        startPending();
      }
    };

    const handlePopState = () => {
      startPending();
    };

    document.addEventListener("click", handleClick, true);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("popstate", handlePopState);

      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!isPending) {
    return null;
  }

  return <RoutePending />;
}
