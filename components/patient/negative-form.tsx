"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface NegativeFormProps {
  slug: string;
  rating: number;
}

/**
 * Private capture screen for 1–3 star ratings. All fields are optional —
 * tapping Submit with empty fields still records the negative signal (and
 * fires the manager alert) rather than blocking with a validation error.
 */
export function NegativeForm({ slug, rating }: NegativeFormProps) {
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
    const { error } = await supabase.rpc("submit_feedback", {
      p_slug: slug,
      p_rating: rating,
      p_name: name,
      p_email: email,
      p_phone: phone,
    });

    setSubmitting(false);
    if (!error) {
      setDone(true);
    } else {
      // Even on error we thank the patient — never show them a wall.
      setDone(true);
    }
  }

  if (done) {
    return (
      <div className="flex w-full max-w-md flex-col items-center gap-4 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Thank you</h1>
        <p className="text-muted-foreground">
          Our practice manager will reach out within 24 hours. We appreciate you
          giving us the chance to make it right.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-md flex-col gap-6 text-center"
    >
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          We&apos;re really sorry to hear that
        </h1>
        <p className="text-muted-foreground">
          Can we make it right? Leave your details and our practice manager will
          reach out privately.
        </p>
      </div>

      <div className="flex flex-col gap-4 text-left">
        <div className="space-y-1.5">
          <Label htmlFor="name">Name (optional)</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email (optional)</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
          />
        </div>
      </div>

      <Button type="submit" size="lg" disabled={submitting} className="w-full">
        {submitting ? "Sending…" : "Submit"}
      </Button>

      <p className="text-xs text-muted-foreground">
        By submitting this form you consent to your feedback being shared with
        the clinic so they can follow up with you.
      </p>
    </form>
  );
}
