"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Shown on the dashboard when a logged-in business has no clinic yet. */
export function CreateClinicOnboarding() {
  const router = useRouter();
  const [clinicName, setClinicName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [reviewUrl, setReviewUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const effectiveSlug = slugTouched ? slugify(slug) : slugify(clinicName);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!clinicName.trim() || !effectiveSlug) {
      setError("Please enter your clinic name.");
      return;
    }
    setBusy(true);
    const supabase = createClient();
    const { error: rpcErr } = await supabase.rpc("create_my_clinic", {
      p_clinic_name: clinicName,
      p_slug: effectiveSlug,
      p_google_review_url: reviewUrl || null,
    });
    if (rpcErr) {
      setError(rpcErr.message);
      setBusy(false);
      return;
    }
    router.refresh();
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Set up your clinic</CardTitle>
        <CardDescription>
          A couple of details and we&apos;ll get your account ready for review.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="clinicName">Clinic name</Label>
            <Input
              id="clinicName"
              required
              value={clinicName}
              onChange={(e) => setClinicName(e.target.value)}
              className="h-11 rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="slug">Your link (/{effectiveSlug || "your-clinic"})</Label>
            <Input
              id="slug"
              value={slugTouched ? slug : effectiveSlug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              className="h-11 rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reviewUrl">Google review link (optional)</Label>
            <Input
              id="reviewUrl"
              type="url"
              placeholder="https://g.page/r/..."
              value={reviewUrl}
              onChange={(e) => setReviewUrl(e.target.value)}
              className="h-11 rounded-xl"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button
            type="submit"
            disabled={busy}
            className="h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-base hover:from-emerald-500 hover:to-green-700"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : "Create my clinic"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
