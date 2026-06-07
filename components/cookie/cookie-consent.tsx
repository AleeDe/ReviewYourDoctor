"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Cookie, X } from "lucide-react";
import {
  readConsent,
  writeConsent,
  OPEN_PREFS_EVENT,
} from "@/lib/cookie-consent";

export function CookieConsent() {
  const [decided, setDecided] = useState(true); // assume decided until mounted (no flash)
  const [showPrefs, setShowPrefs] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    // Defer so we don't setState synchronously inside the effect body.
    const id = requestAnimationFrame(() => {
      const c = readConsent();
      if (c) {
        setAnalytics(c.analytics);
        setMarketing(c.marketing);
        setDecided(true);
      } else {
        setDecided(false); // first visit -> show banner
      }
    });
    const open = () => {
      const cur = readConsent();
      if (cur) {
        setAnalytics(cur.analytics);
        setMarketing(cur.marketing);
      }
      setShowPrefs(true);
    };
    window.addEventListener(OPEN_PREFS_EVENT, open);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener(OPEN_PREFS_EVENT, open);
    };
  }, []);

  function decide(a: boolean, m: boolean) {
    writeConsent({ analytics: a, marketing: m });
    setAnalytics(a);
    setMarketing(m);
    setDecided(true);
    setShowPrefs(false);
  }

  const showBanner = !decided && !showPrefs;
  if (!showBanner && !showPrefs) return null;

  return (
    <>
      {showBanner && (
        <div className="fixed inset-x-0 bottom-0 z-[60] p-3 sm:p-4">
          <div className="mx-auto flex max-w-3xl flex-col gap-3 rounded-2xl border bg-background/95 p-4 shadow-xl backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Cookie className="mt-0.5 size-5 shrink-0 text-emerald-600" />
              <p className="text-sm text-muted-foreground">
                We use essential cookies to run this service and optional analytics
                cookies to improve performance and user experience. You can accept,
                reject, or manage non-essential cookies at any time.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0 sm:items-center">
              <Button
                type="button"
                variant="ghost"
                className="order-3 col-span-2 h-9 w-full rounded-lg sm:order-1 sm:col-auto sm:w-auto"
                onClick={() => setShowPrefs(true)}
              >
                Manage preferences
              </Button>
              <Button
                type="button"
                variant="outline"
                className="order-1 h-9 w-full rounded-lg sm:order-2 sm:w-auto"
                onClick={() => decide(false, false)}
              >
                Reject non-essential
              </Button>
              <Button
                type="button"
                className="order-2 h-9 w-full rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-500 hover:to-green-700 sm:order-3 sm:w-auto"
                onClick={() => decide(true, true)}
              >
                Accept all
              </Button>
            </div>
          </div>
        </div>
      )}

      {showPrefs && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/40 p-3 sm:items-center sm:p-4">
          <div className="w-full max-w-md rounded-2xl border bg-background p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Cookie className="size-5 text-emerald-600" /> Cookie preferences
              </h2>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setShowPrefs(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Non-essential cookies stay off until you turn them on.
            </p>

            <div className="mt-4 space-y-3">
              <Category
                title="Essential cookies"
                desc="Required for login, security, session management, and platform operation."
                checked
                disabled
              />
              <Category
                title="Analytics cookies"
                desc="Help us understand usage and improve the product. Off unless accepted."
                checked={analytics}
                onChange={setAnalytics}
              />
              <Category
                title="Marketing cookies"
                desc="Used only if paid ads, retargeting, or pixels are added. Off unless accepted."
                checked={marketing}
                onChange={setMarketing}
              />
            </div>

            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-lg"
                onClick={() => decide(false, false)}
              >
                Reject non-essential
              </Button>
              <Button
                type="button"
                size="sm"
                className="rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-500 hover:to-green-700"
                onClick={() => decide(analytics, marketing)}
              >
                Save preferences
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Category({
  title,
  desc,
  checked,
  disabled,
  onChange,
}: {
  title: string;
  desc: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 rounded-xl border p-3">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        className="mt-0.5 size-4 shrink-0 accent-emerald-600 disabled:opacity-60"
      />
      <span>
        <span className="block text-sm font-medium">{title}</span>
        <span className="block text-xs text-muted-foreground">{desc}</span>
      </span>
    </label>
  );
}
