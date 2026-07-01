"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import { NegativeFeedback } from "./negative-feedback";
import type { Submission } from "@/lib/types";

/**
 * Wraps the presentational NegativeFeedback list and keeps it live. New
 * submissions for this clinic are appended to local state instantly via
 * Supabase Realtime, so private feedback appears smoothly without a full
 * server round-trip / page flicker. Realtime respects RLS, so a clinic only
 * ever receives its own rows; the clinic_id filter is a second guard.
 */
export function LiveNegativeFeedback({
  clinicId,
  initial,
}: {
  clinicId: string;
  initial: Submission[];
}) {
  const [rows, setRows] = useState<Submission[]>(initial);

  // Re-seed when the server sends a fresh list (e.g. after navigation).
  // Deferred out of the effect's sync phase to avoid cascading renders.
  useEffect(() => {
    const id = requestAnimationFrame(() => setRows(initial));
    return () => cancelAnimationFrame(id);
  }, [initial]);

  useEffect(() => {
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    const onInsert = (payload: { new: Submission }) => {
      const s = payload.new;
      if (s.is_positive) return;
      setRows((prev) =>
        prev.some((p) => p.id === s.id) ? prev : [s, ...prev],
      );
    };

    (async () => {
      // RLS-scoped Realtime only delivers rows the socket is authorised for, so
      // the socket MUST carry the owner's JWT. With cookie-based SSR sessions
      // that isn't guaranteed at subscribe time, so set it explicitly first.
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled) return;
      supabase.realtime.setAuth(session?.access_token ?? null);

      channel = supabase
        .channel(`neg-${clinicId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "submissions",
            filter: `clinic_id=eq.${clinicId}`,
          },
          onInsert,
        )
        .subscribe();
    })();

    // Keep the socket authorised across token refreshes.
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      supabase.realtime.setAuth(session?.access_token ?? null);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
      if (channel) supabase.removeChannel(channel);
    };
  }, [clinicId]);

  return <NegativeFeedback negatives={rows} />;
}
