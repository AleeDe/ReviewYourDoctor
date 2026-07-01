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
    const ch = supabase.channel(`${channel}-${tables.join("-")}`);
    for (const table of tables) {
      ch.on("postgres_changes", { event: "*", schema: "public", table }, refresh);
    }
    ch.subscribe();
    return () => {
      if (timer) clearTimeout(timer);
      supabase.removeChannel(ch);
    };
  }, [tables, channel, router]);
  return null;
}
