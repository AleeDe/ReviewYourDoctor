"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

/**
 * Subscribes to Supabase Realtime changes on a table and refreshes the current
 * server component when they occur, so the screen updates live without a manual
 * reload. Realtime respects RLS, so users only receive rows they can see.
 */
export function RealtimeRefresh({
  tables,
  channel = "rt",
}: {
  tables: string[];
  channel?: string;
}) {
  const router = useRouter();
  useEffect(() => {
    const supabase = createClient();
    let timer: ReturnType<typeof setTimeout> | null = null;
    const refresh = () => {
      // Debounce bursts of events into a single, calm refresh. Kept fairly long
      // so the heavy full re-render happens once, after any instant client-side
      // updates (e.g. live feedback append), instead of flickering per-event.
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => router.refresh(), 700);
    };
    let ch: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    (async () => {
      // RLS-scoped Realtime drops events the socket isn't authorised for, so the
      // socket must carry the user's JWT. Cookie-based SSR sessions don't set it
      // reliably at subscribe time, so set it explicitly before subscribing.
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled) return;
      supabase.realtime.setAuth(session?.access_token ?? null);

      ch = supabase.channel(`${channel}-${tables.join("-")}`);
      for (const table of tables) {
        ch.on("postgres_changes", { event: "*", schema: "public", table }, refresh);
      }
      ch.subscribe();
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      supabase.realtime.setAuth(session?.access_token ?? null);
    });

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      sub.subscription.unsubscribe();
      if (ch) supabase.removeChannel(ch);
    };
  }, [tables, channel, router]);
  return null;
}
