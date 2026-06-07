"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Loader2, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  slug: string;
  clinicName: string;
  googleReviewUrl: string | null;
  /** Ratings at or above this are treated as positive (messaging only). */
  positiveThreshold: number;
}

/**
 * Patient screen. Tap a star, then EVERY patient is explicitly offered the same
 * choice to leave a public Google review (compliant: no rating-based gating).
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
  const [step, setStep] = useState<"rate" | "choose">("rate");
  const [busy, setBusy] = useState(false);

  const positive = selected >= positiveThreshold;

  async function logRating() {
    const supabase = createClient();
    await supabase.rpc("submit_feedback", { p_slug: slug, p_rating: selected });
  }

  function pick(rating: number) {
    if (busy) return;
    setSelected(rating);
    setStep("choose");
  }

  async function leaveGoogle() {
    if (busy) return;
    setBusy(true);
    await logRating();
    if (googleReviewUrl) window.location.assign(googleReviewUrl);
    else router.push(`/${slug}/ty`);
  }

  async function notNow() {
    if (busy) return;
    setBusy(true);
    await logRating();
    router.push(`/${slug}/ty`);
  }

  function sharePrivate() {
    if (busy) return;
    router.push(`/${slug}/sorry?r=${selected}`);
  }

  const cardCls =
    "flex flex-col items-center gap-6 rounded-3xl border border-border/60 bg-card p-8 text-center shadow-lg shadow-black/5 sm:p-10";

  // ----- Choice step (shown for every rating) -----
  if (step === "choose") {
    return (
      <div className={cardCls}>
        <SelectedStars value={selected} />

        {positive ? (
          <>
            <div className="space-y-2">
              <h1 className="text-balance text-2xl font-semibold tracking-tight">
                Thank you for your feedback
              </h1>
              <p className="text-pretty text-muted-foreground">
                Would you like to share your experience publicly on Google?
              </p>
            </div>
            <div className="flex w-full flex-col gap-3">
              {googleReviewUrl && (
                <Button
                  onClick={leaveGoogle}
                  disabled={busy}
                  className="h-12 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-base hover:from-emerald-500 hover:to-green-700"
                >
                  {busy ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <ExternalLink className="size-4" />
                  )}
                  Leave Google review
                </Button>
              )}
              <Button
                onClick={notNow}
                disabled={busy}
                variant="outline"
                className="h-12 w-full rounded-xl text-base"
              >
                Not now
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <h1 className="text-balance text-2xl font-semibold tracking-tight">
                We&apos;re sorry your experience wasn&apos;t ideal
              </h1>
              <p className="text-pretty text-muted-foreground">
                You can share private feedback with the clinic so they can follow
                up, or you can leave a public Google review. It&apos;s your choice.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3">
              <Button
                onClick={sharePrivate}
                disabled={busy}
                className="h-12 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-base hover:from-emerald-500 hover:to-green-700"
              >
                Share private feedback
              </Button>
              {googleReviewUrl && (
                <Button
                  onClick={leaveGoogle}
                  disabled={busy}
                  variant="outline"
                  className="h-12 w-full rounded-xl text-base"
                >
                  {busy ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <ExternalLink className="size-4" />
                  )}
                  Leave public Google review
                </Button>
              )}
            </div>
            <button
              type="button"
              onClick={notNow}
              disabled={busy}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Skip
            </button>
          </>
        )}
      </div>
    );
  }

  // ----- Rating step -----
  const display = hovered || selected;
  return (
    <div className={cardCls}>
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
              onMouseEnter={() => setHovered(value)}
              onFocus={() => setHovered(value)}
              onClick={() => pick(value)}
              className={cn(
                "touch-manipulation rounded-2xl p-1.5 transition-transform duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "active:scale-90 hover:scale-105",
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

      <p className="text-sm text-muted-foreground">
        Tap a star to rate your experience
      </p>
    </div>
  );
}

function SelectedStars({ value }: { value: number }) {
  return (
    <div className="flex items-center justify-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            "size-7",
            i <= value
              ? "fill-amber-400 text-amber-400"
              : "fill-muted text-muted-foreground/30",
          )}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}
