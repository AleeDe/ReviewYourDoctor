"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  slug: string;
  clinicName: string;
  googleReviewUrl: string | null;
}

/**
 * The single-decision patient screen: tap a star.
 * 4–5 stars  -> log positive + redirect to Google review page.
 * 1–3 stars  -> route to the private "sorry" contact screen.
 *
 * Designed for minimum effort (Fitts's + Hick's law): large touch targets,
 * one decision, no other fields.
 */
export function StarRating({ slug, clinicName, googleReviewUrl }: StarRatingProps) {
  const router = useRouter();
  const [hovered, setHovered] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  async function handleSelect(rating: number) {
    if (submitting) return;
    setSubmitting(true);

    if (rating >= 4) {
      // Positive: log then send to Google.
      const supabase = createClient();
      await supabase.rpc("submit_feedback", { p_slug: slug, p_rating: rating });

      if (googleReviewUrl) {
        window.location.assign(googleReviewUrl);
      } else {
        router.push(`/${slug}/ty`);
      }
      return;
    }

    // Negative: capture privately on the next screen.
    router.push(`/${slug}/sorry?r=${rating}`);
  }

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-8 text-center">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">{clinicName}</h1>
        <p className="text-lg text-muted-foreground">
          How was your visit today?
        </p>
      </div>

      <div
        className="flex items-center justify-center gap-2 sm:gap-3"
        aria-label="Star rating"
        onMouseLeave={() => setHovered(0)}
      >
        {[1, 2, 3, 4, 5].map((value) => {
          const active = value <= hovered;
          return (
            <button
              key={value}
              type="button"
              aria-label={`Rate ${value} star${value > 1 ? "s" : ""}`}
              disabled={submitting}
              onMouseEnter={() => setHovered(value)}
              onFocus={() => setHovered(value)}
              onClick={() => handleSelect(value)}
              className={cn(
                "rounded-full p-1 transition-transform active:scale-90 disabled:opacity-60",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              )}
            >
              <Star
                className={cn(
                  "size-12 transition-colors sm:size-14",
                  active
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground/40",
                )}
                strokeWidth={1.5}
              />
            </button>
          );
        })}
      </div>

      <p className="text-sm text-muted-foreground">
        {submitting ? "One moment…" : "Tap a star to rate your experience"}
      </p>
    </div>
  );
}
