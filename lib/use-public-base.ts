"use client";

import { useEffect, useState } from "react";

/**
 * Resolves the base URL to encode in QR codes / share links.
 *
 * - If `configured` (NEXT_PUBLIC_SITE_URL) is a real domain, use it — this is
 *   the canonical public URL for production posters.
 * - If it's missing or localhost, fall back to the browser's current origin so
 *   QR codes are scannable over the LAN (e.g. http://192.168.1.7:3000) during
 *   development, instead of a useless `localhost` link.
 */
export function usePublicBase(configured: string): string {
  const [base, setBase] = useState(configured);

  useEffect(() => {
    const isLocal = !configured || /localhost|127\.0\.0\.1/i.test(configured);
    if (!isLocal || typeof window === "undefined") return;
    const origin = window.location.origin;
    // Defer to avoid a synchronous setState in the effect body.
    const id = requestAnimationFrame(() => setBase(origin));
    return () => cancelAnimationFrame(id);
  }, [configured]);

  return base.replace(/\/$/, "");
}
