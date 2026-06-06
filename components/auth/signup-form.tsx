"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { MailCheck, Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function SignupForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [reviewUrl, setReviewUrl] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  const effectiveSlug = slugTouched ? slugify(slug) : slugify(clinicName);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!clinicName.trim() || !effectiveSlug) {
      setError("Please enter your clinic name.");
      return;
    }
    if (!agreed) {
      setError("Please accept the Terms and Privacy Policy to continue.");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();

    const { data, error: signErr } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (signErr) {
      setError(signErr.message);
      setSubmitting(false);
      return;
    }

    // Email confirmation ON → no session yet. Clinic is created on the
    // dashboard after they confirm + log in.
    if (!data.session) {
      setCheckEmail(true);
      setSubmitting(false);
      return;
    }

    const { error: rpcErr } = await supabase.rpc("create_my_clinic", {
      p_clinic_name: clinicName,
      p_slug: effectiveSlug,
      p_google_review_url: reviewUrl || null,
      p_manager_email: email,
    });

    if (rpcErr) {
      setError(rpcErr.message);
      setSubmitting(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  if (checkEmail) {
    return (
      <Card className="w-full rounded-2xl shadow-lg shadow-black/5">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 grid size-12 place-items-center rounded-full bg-emerald-50 text-emerald-600">
            <MailCheck className="size-6" />
          </div>
          <CardTitle className="text-2xl">Check your email</CardTitle>
          <CardDescription>
            We sent a confirmation link to <strong>{email}</strong>. Confirm it,
            then log in to finish setting up your clinic.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/login" className="block">
            <Button className="h-12 w-full rounded-xl text-base">
              Go to login
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full rounded-2xl shadow-lg shadow-black/5">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Start your free trial</CardTitle>
        <CardDescription>
          30 days free. We&apos;ll review and activate your clinic.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Your name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
                className="h-11 rounded-xl"
              />
            </div>
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
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="slug">Your link</Label>
            <div className="flex items-center rounded-xl border border-input pl-3 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
              <span className="text-sm text-muted-foreground">/</span>
              <Input
                id="slug"
                value={slugTouched ? slug : effectiveSlug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value);
                }}
                className="h-11 border-0 px-1 focus-visible:ring-0"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Patients scan a QR that opens this page. Choose something short.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Work email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                inputMode="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="you@clinic.co.uk"
                className="h-11 rounded-xl pl-10"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type={showPw ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                className="h-11 rounded-xl px-10"
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                aria-label={showPw ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              >
                {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reviewUrl">Google review link (optional)</Label>
            <Input
              id="reviewUrl"
              type="url"
              inputMode="url"
              placeholder="https://g.page/r/..."
              value={reviewUrl}
              onChange={(e) => setReviewUrl(e.target.value)}
              className="h-11 rounded-xl"
            />
          </div>

          <label className="flex items-start gap-2.5 text-left text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 size-4 shrink-0 accent-emerald-600"
            />
            <span>
              I agree to the{" "}
              <Link
                href="/terms"
                target="_blank"
                className="font-medium text-emerald-600 hover:underline"
              >
                Terms &amp; Conditions
              </Link>{" "}
              and have read the{" "}
              <Link
                href="/privacy"
                target="_blank"
                className="font-medium text-emerald-600 hover:underline"
              >
                Privacy Policy
              </Link>
              .
            </span>
          </label>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            type="submit"
            disabled={submitting || !agreed}
            className="h-12 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-base hover:from-emerald-500 hover:to-green-700"
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Creating your account…
              </>
            ) : (
              "Create account"
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-emerald-600 hover:underline">
              Log in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
