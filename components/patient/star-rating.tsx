"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  slug: string;
  clinicName: string;
  googleReviewUrl: string | null;
  /** Ratings at or above this go to Google; below are captured privately. */
  positiveThreshold: number;
}

/**
 * The single-decision patient screen: tap a star.
 * 4-5 stars  -> log positive + redirect to Google review page.
 * 1-3 stars  -> route to the private "sorry" contact screen.
 *
 * Designed for minimum effort (Fitts's + Hick's law): large touch targets,
 * one decision, instant visual confirmation before acting.
 */
export function StarRating({
  slug,
  clinicName,
  googleReviewUrl,
  positiveThreshold,
}: StarRatingProps) {
  const router = useRouter();
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  async function handleSelect(rating: number) {
    if (submitting) return;
    setSelected(rating);
    setSubmitting(true);

    // At or above the clinic's threshold → send to Google to leave a review.
    if (rating >= positiveThreshold) {
      const supabase = createClient();
      await supabase.rpc("submit_feedback", { p_slug: slug, p_rating: rating });
      if (googleReviewUrl) {
        setRedirecting(true);
        await new Promise((r) => setTimeout(r, 900));
        window.location.assign(googleReviewUrl);
      } else {
        router.push(`/${slug}/ty`);
      }
      return;
    }

    await new Promise((r) => setTimeout(r, 220));
    router.push(`/${slug}/sorry?r=${rating}`);
  }

  const display = hovered || selected;

  return (
    <div className="flex flex-col items-center gap-8 rounded-3xl border border-border/60 bg-card p-8 text-center shadow-lg shadow-black/5 sm:p-10">
      <div className="space-y-2">
        <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
          {clinicName}
        </h1>
        <p className="text-pretty text-lg text-muted-foreground">
          How was your visit today?
        </p>
      </div>

      <div
        className="flex items-center justify-center gap-1.5 sm:gap-2.5"
        aria-label="Star rating"
        onMouseLeave={() => setHovered(0)}
      >
        {[1, 2, 3, 4, 5].map((value) => {
          const active = value <= display;
          return (
            <button
              key={value}
              type="button"
              aria-label={`Rate ${value} star${value > 1 ? "s" : ""}`}
              disabled={submitting}
              onMouseEnter={() => !submitting && setHovered(value)}
              onFocus={() => !submitting && setHovered(value)}
              onClick={() => handleSelect(value)}
              className={cn(
                "touch-manipulation rounded-2xl p-1.5 transition-transform duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                !submitting && "active:scale-90 hover:scale-105",
                selected === value && "scale-110",
              )}
            >
              <Star
                className={cn(
                  "size-12 transition-colors duration-150 sm:size-14",
                  active
                    ? "fill-amber-400 text-amber-400 drop-shadow-sm"
                    : "fill-muted text-muted-foreground/30",
                )}
                strokeWidth={1.5}
              />
            </button>
          );
        })}
      </div>

      <p className="flex min-h-5 items-center justify-center gap-2 px-2 text-center text-sm text-muted-foreground">
        {redirecting ? (
          <>
            <Loader2 className="size-4 animate-spin text-emerald-600" />
            Taking you to Google. Please leave us a review there!
          </>
        ) : submitting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            One moment…
          </>
        ) : (
          "Tap a star to rate your experience"
        )}
      </p>
    </div>
  );
}
