"use client";

/**
 * Cookie consent state (PECR / UK GDPR). Non-essential scripts (analytics,
 * marketing) must stay OFF until the user opts in. Essential cookies always run.
 *
 * Any future analytics/marketing script should gate on `readConsent()` (or
 * listen for the `ryd-consent-change` event) before loading.
 */
export interface Consent {
  analytics: boolean;
  marketing: boolean;
}

export const CONSENT_KEY = "ryd-cookie-consent";
export const OPEN_PREFS_EVENT = "ryd-open-cookie-prefs";
export const CONSENT_CHANGE_EVENT = "ryd-consent-change";

export function readConsent(): (Consent & { set: boolean }) | null {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    if (!v) return null;
    const p = JSON.parse(v);
    return { analytics: !!p.analytics, marketing: !!p.marketing, set: true };
  } catch {
    return null;
  }
}

export function writeConsent(c: Consent): void {
  if (typeof window === "undefined") return;
  const payload = { ...c, set: true, ts: Date.now() };
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
  // Mirror to a cookie so scripts/SSR can read consent too.
  document.cookie = `ryd_consent=${encodeURIComponent(
    JSON.stringify(c),
  )}; path=/; max-age=31536000; samesite=lax`;
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGE_EVENT, { detail: c }));
}

/** Open the preferences dialog from anywhere (e.g. footer / privacy page). */
export function openCookiePreferences(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(OPEN_PREFS_EVENT));
  }
}
