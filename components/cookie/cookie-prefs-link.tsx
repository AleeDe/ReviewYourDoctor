"use client";

import { openCookiePreferences } from "@/lib/cookie-consent";

/** A link/button that reopens the cookie preferences dialog. */
export function CookiePrefsLink({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={openCookiePreferences}
      className={className ?? "hover:text-foreground"}
    >
      Cookie preferences
    </button>
  );
}
