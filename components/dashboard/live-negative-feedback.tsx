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
    const channel = supabase
      .channel(`neg-${clinicId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "submissions",
          filter: `clinic_id=eq.${clinicId}`,
        },
        (payload) => {
          const s = payload.new as Submission;
          if (s.is_positive) return;
          setRows((prev) =>
            prev.some((p) => p.id === s.id) ? prev : [s, ...prev],
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clinicId]);

  return <NegativeFeedback negatives={rows} />;
}
