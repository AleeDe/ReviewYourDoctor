"use client";

import { useState } from "react";
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
 * Private capture screen for 1-3 star ratings. All fields are optional:
 * tapping Submit with empty fields still records the negative signal (and
 * fires the manager alert) rather than blocking with a validation error.
 */
export function NegativeForm({ slug, rating }: NegativeFormProps) {
  const [reason, setReason] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    const supabase = createClient();
    // Even on error we thank the patient; never show them a wall.
    await supabase.rpc("submit_feedback", {
      p_slug: slug,
      p_rating: rating,
      p_name: name,
      p_email: email,
      p_phone: phone,
      p_reason: reason,
    });

    setSubmitting(false);
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
          <Label htmlFor="name">Name (optional)</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
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
        By submitting this form you consent to your feedback being shared with
        the clinic so they can follow up with you.
      </p>
    </form>
  );
}
