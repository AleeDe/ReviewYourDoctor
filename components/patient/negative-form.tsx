"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Loader2 } from "lucide-react";

interface NegativeFormProps {
  slug: string;
  rating: number;
}

/**
 * Private capture screen for 1-3 star ratings. Name is required so the clinic
 * can follow up; email and phone are optional. On failure we surface a gentle
 * retry rather than silently pretending it saved.
 */
export function NegativeForm({ slug, rating }: NegativeFormProps) {
  const [reason, setReason] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    if (!name.trim()) {
      setError("Please enter your name so we can reach out.");
      return;
    }

    setError(null);
    setSubmitting(true);

    const supabase = createClient();
    const { error: rpcErr } = await supabase.rpc("submit_feedback", {
      p_slug: slug,
      p_rating: rating,
      p_name: name.trim(),
      p_email: email.trim() || null,
      p_phone: phone.trim() || null,
      p_reason: reason.trim() || null,
    });

    setSubmitting(false);
    if (rpcErr) {
      setError("Something went wrong. Please try again.");
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-border/60 bg-card p-8 text-center shadow-lg shadow-black/5 sm:p-10">
        <CheckCircle2 className="size-12 text-emerald-500" strokeWidth={1.75} />
        <h1 className="text-2xl font-semibold tracking-tight">Thank you</h1>
        <p className="text-pretty text-muted-foreground">
          Our practice manager will reach out within 24 hours. We appreciate you
          giving us the chance to make it right.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6 rounded-3xl border border-border/60 bg-card p-8 text-center shadow-lg shadow-black/5 sm:p-10"
    >
      <div className="space-y-2">
        <h1 className="text-balance text-2xl font-semibold tracking-tight">
          We&apos;re really sorry to hear that
        </h1>
        <p className="text-pretty text-muted-foreground">
          Can we make it right? Leave your details and our practice manager will
          reach out privately.
        </p>
      </div>

      <div className="flex flex-col gap-4 text-left">
        <div className="space-y-1.5">
          <Label htmlFor="reason">What went wrong? (optional)</Label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Tell us what we could have done better…"
            className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="name">Your name</Label>
          <Input
            id="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            placeholder="e.g. Jane Smith"
            aria-invalid={Boolean(error) && !name.trim()}
            className="h-12 rounded-xl"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email (optional)</Label>
          <Input
            id="email"
            type="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className="h-12 rounded-xl"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input
            id="phone"
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
            className="h-12 rounded-xl"
          />
        </div>
      </div>

      {error && (
        <p className="-mt-2 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={submitting}
        className="h-12 w-full rounded-xl text-base"
      >
        {submitting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Sending…
          </>
        ) : (
          "Submit"
        )}
      </Button>

      <p className="text-xs text-muted-foreground">
        By submitting, you consent to the clinic contacting you about your
        experience. Your details are used only for this purpose and kept for no
        longer than 12 months. See our{" "}
        <Link
          href="/privacy"
          target="_blank"
          className="underline hover:text-foreground"
        >
          Privacy Policy
        </Link>
        .
      </p>
    </form>
  );
}
