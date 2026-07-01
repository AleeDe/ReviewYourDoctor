import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Star,
  ScanLine,
  TrendingUp,
  Clock,
  CheckCircle2,
  Circle,
  Lock,
  CreditCard,
  AlertTriangle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getLiveRating } from "@/lib/google/places";
import { isAdminEmail } from "@/lib/auth";
import { AppHeader } from "@/components/app-header";
import { RatingBarChart } from "@/components/dashboard/rating-bar-chart";
import {
  TrendLineChart,
  type TrendPoint,
} from "@/components/dashboard/trend-line-chart";
import { StatCard } from "@/components/dashboard/stat-card";
import { LogoUpload } from "@/components/dashboard/logo-upload";
import { GoogleConnect } from "@/components/dashboard/google-connect";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { LiveNegativeFeedback } from "@/components/dashboard/live-negative-feedback";
import { CreateClinicOnboarding } from "@/components/dashboard/create-clinic-onboarding";
import { BrandedQrCard } from "@/components/qr/branded-qr-card";
import { RealtimeRefresh } from "@/components/realtime/realtime-refresh";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Clinic, Submission } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard | Review Your Doctor" };

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function siteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "http://localhost:3000"
  );
}

function initialsOf(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "C"
  );
}

function buildTrend(submissions: Submission[]): TrendPoint[] {
  const now = new Date();
  const points: TrendPoint[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const next = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const count = submissions.filter((s) => {
      const t = new Date(s.created_at);
      return t >= d && t < next;
    }).length;
    points.push({
      month: d.toLocaleDateString("en-GB", { month: "short" }),
      count,
    });
  }
  return points;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const showAdminLink = isAdminEmail(user.email);
  const adminButton = showAdminLink ? (
    <Link
      href="/admin"
      className={buttonVariants({ variant: "outline", size: "sm" })}
    >
      <ShieldCheck className="size-4" />
      <span className="hidden sm:inline">Admin dashboard</span>
      <span className="sm:hidden">Admin</span>
    </Link>
  ) : null;

  // RLS restricts this to the clinic owned by the current user.
  const { data: clinic } = await supabase
    .from("clinics")
    .select("*")
    .maybeSingle<Clinic>();

  // No clinic: founders go to admin; businesses finish onboarding here.
  if (!clinic) {
    if (showAdminLink) redirect("/admin");
    return (
      <div className="min-h-dvh bg-muted/30">
        <AppHeader title="Review Your Doctor" />
        <div className="mx-auto max-w-lg px-4 py-10 sm:py-16">
          <CreateClinicOnboarding />
        </div>
      </div>
    );
  }

  // Clinic exists but not approved yet → pending + onboarding checklist.
  if (!clinic.is_active) {
    const hasGoogle = Boolean(clinic.google_review_url);
    const hasLogo = Boolean(clinic.logo_url);
    return (
      <div className="min-h-dvh bg-muted/30">
        <AppHeader
          title={clinic.clinic_name}
          subtitle="Account setup"
          logoUrl={clinic.logo_url}
          initials={initialsOf(clinic.clinic_name)}
        >
          {adminButton}
        </AppHeader>
        <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
          {/* Live: flip to the active dashboard the moment we're approved. */}
          <RealtimeRefresh tables={["clinics"]} channel="dashboard-pending" />
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 to-green-700 px-6 py-8 text-white shadow-lg shadow-emerald-600/20">
            <div className="pointer-events-none absolute -right-8 -top-8 size-40 rounded-full bg-white/10 blur-2xl" />
            <div className="flex items-center gap-2 text-emerald-50">
              <Clock className="size-5" />
              <span className="text-sm font-medium">Under review</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
              You&apos;re almost live!
            </h1>
            <p className="mt-2 max-w-xl text-emerald-50">
              Our team is reviewing your clinic. Finish the steps below so your
              branded QR poster is ready the moment you&apos;re approved.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-base">Setup checklist</CardTitle>
                <CardDescription>Get ready to go live.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <ChecklistRow done label="Account created" />
                <div>
                  <ChecklistRow done={hasLogo} label="Upload your clinic logo" />
                  <div className="mt-3 pl-7">
                    <LogoUpload
                      clinicId={clinic.id}
                      currentLogoUrl={clinic.logo_url}
                    />
                  </div>
                </div>
                <ChecklistRow
                  done={hasGoogle}
                  label="Google listing connected"
                  hint={
                    hasGoogle ? undefined : "Connect it in the poster panel →"
                  }
                />
                <ChecklistRow done={false} label="Approved by our team" pending />
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-base">Your review poster</CardTitle>
                <CardDescription>
                  Connect Google to generate the poster patients scan.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <GoogleConnect
                  connected={hasGoogle}
                  currentReviewUrl={clinic.google_review_url}
                />
                {hasGoogle ? (
                  <div className="flex justify-center">
                    <BrandedQrCard
                      slug={clinic.slug}
                      clinicName={clinic.clinic_name}
                      logoUrl={clinic.logo_url}
                      siteUrl={siteUrl()}
                      preview
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-8 text-center">
                    <Lock className="size-6 text-muted-foreground" />
                    <p className="text-sm font-medium">QR poster locked</p>
                    <p className="px-6 text-sm text-muted-foreground">
                      Connect your Google listing above to generate it.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // ---- Active clinic: full dashboard ----
  // Fetch submissions and the live Google rating in parallel.
  const [submissionsRes, liveRating] = await Promise.all([
    supabase.from("submissions").select("*").order("created_at", { ascending: false }),
    getLiveRating(clinic.google_place_id),
  ]);

  const submissions = (submissionsRes.data ?? []) as Submission[];

  const monthStart = startOfMonth(new Date());
  const totalAllTime = submissions.length;
  const totalThisMonth = submissions.filter(
    (s) => new Date(s.created_at) >= monthStart,
  ).length;

  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const s of submissions) distribution[s.star_rating]++;

  const negatives = submissions.filter((s) => !s.is_positive);
  const positiveRate =
    totalAllTime > 0
      ? Math.round(((totalAllTime - negatives.length) / totalAllTime) * 100)
      : 0;
  const trend = buildTrend(submissions);
  const billingUrl = process.env.NEXT_PUBLIC_BILLING_URL;
  const billingNow = new Date().getTime();
  const trialDays = clinic.trial_ends_at
    ? Math.ceil((new Date(clinic.trial_ends_at).getTime() - billingNow) / 86400000)
    : null;

  // Prefer the live Google rating; otherwise fall back to the average of
  // ratings collected through Review Your Doctor.
  const dbAverage =
    totalAllTime > 0
      ? submissions.reduce((s, x) => s + x.star_rating, 0) / totalAllTime
      : 0;
  const usingLive = liveRating.rating != null;
  const ratingValue = liveRating.rating ?? dbAverage;
  const ratingLabel = usingLive ? "Live Google rating" : "Average rating";
  const ratingHint = usingLive
    ? liveRating.reviewCount != null
      ? `${liveRating.reviewCount} Google reviews`
      : "from Google"
    : `based on ${totalAllTime} rating${totalAllTime === 1 ? "" : "s"}`;

  return (
    <div className="min-h-dvh bg-muted/30">
      <AppHeader
        title={clinic.clinic_name}
        subtitle="Reputation dashboard"
        logoUrl={clinic.logo_url}
        initials={initialsOf(clinic.clinic_name)}
      >
        {adminButton}
      </AppHeader>

      <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        {/* Live updates: refresh when new feedback arrives, no manual reload */}
        <RealtimeRefresh tables={["submissions", "clinics"]} channel="dashboard" />

        {/* Quick actions: one tap to share/open the form (KLM + Fitts) */}
        <QuickActions slug={clinic.slug} siteUrl={siteUrl()} />

        {(clinic.billing_status !== "paid" || clinic.paid_until) && (
          <Card className={clinic.billing_status === "past_due" ? "rounded-2xl border-amber-300 bg-amber-50/50" : "rounded-2xl"}>
            <CardContent className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                {clinic.billing_status === "past_due" ? (
                  <AlertTriangle className="mt-0.5 size-5 text-amber-600" />
                ) : (
                  <CreditCard className="mt-0.5 size-5 text-emerald-600" />
                )}
                <div>
                  <p className="font-semibold">
                    {clinic.billing_status === "paid"
                      ? "Subscription active"
                      : clinic.billing_status === "past_due"
                        ? "Payment is due"
                        : clinic.billing_status === "cancelled"
                          ? "Subscription cancelled"
                          : "30-day free trial"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {clinic.billing_status === "paid" && clinic.paid_until
                      ? `Paid through ${new Date(clinic.paid_until).toLocaleDateString("en-GB")}.`
                      : clinic.billing_status === "trial" && trialDays !== null
                        ? trialDays < 0
                          ? "Your trial has ended. Subscribe to continue for £49/month."
                          : `${trialDays} day${trialDays === 1 ? "" : "s"} remaining, then £49/month.`
                        : "Contact ShiftDeploy if you need help with your subscription."}
                  </p>
                </div>
              </div>
              {billingUrl && clinic.billing_status !== "paid" && clinic.billing_status !== "cancelled" && (
                <a
                  href={billingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonVariants({ className: "h-10 rounded-xl" })}
                >
                  <CreditCard className="size-4" /> Pay securely
                </a>
              )}
            </CardContent>
          </Card>
        )}

        {/* Bento stat tiles */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            feature
            label={ratingLabel}
            value={ratingValue}
            decimals={1}
            suffix=" ★"
            hint={ratingHint}
            icon={<Star className="size-5" />}
          />
          <StatCard
            label="Scans this month"
            value={totalThisMonth}
            hint={`${totalAllTime} all-time`}
            icon={<ScanLine className="size-5" />}
          />
          <StatCard
            label="Negatives intercepted"
            value={negatives.length}
            hint="kept off Google"
            icon={<ShieldCheck className="size-5" />}
          />
          <StatCard
            label="Positive rate"
            value={positiveRate}
            suffix="%"
            hint="4-5★ sent to Google"
            icon={<TrendingUp className="size-5" />}
          />
        </div>

        {/* Charts */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base">Rating distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <RatingBarChart distribution={distribution} />
            </CardContent>
          </Card>
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base">
                Submissions (last 6 months)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TrendLineChart data={trend} />
            </CardContent>
          </Card>
        </div>

        {/* Action centre (left) + branding & poster grouped (right) */}
        <div className="grid items-start gap-4 lg:grid-cols-3">
          {/* Negative feedback = the action centre (Fitts/Hick: primary task, F-pattern left) */}
          <div className="lg:col-span-2">
            <LiveNegativeFeedback clinicId={clinic.id} initial={negatives} />
          </div>

          {/* Branding + poster grouped together (Gestalt proximity, no empty card) */}
          <Card id="poster" className="scroll-mt-24 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base">Review poster & branding</CardTitle>
              <CardDescription>
                Connect Google + add your logo to unlock your QR poster.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <GoogleConnect
                connected={Boolean(clinic.google_review_url)}
                currentReviewUrl={clinic.google_review_url}
              />
              <Separator />
              <LogoUpload clinicId={clinic.id} currentLogoUrl={clinic.logo_url} />
              <Separator />
              {clinic.google_review_url ? (
                <div className="flex justify-center">
                  <BrandedQrCard
                    slug={clinic.slug}
                    clinicName={clinic.clinic_name}
                    logoUrl={clinic.logo_url}
                    siteUrl={siteUrl()}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-8 text-center">
                  <Lock className="size-6 text-muted-foreground" />
                  <p className="text-sm font-medium">QR poster locked</p>
                  <p className="px-6 text-sm text-muted-foreground">
                    Connect your Google listing above to generate your QR poster.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ChecklistRow({
  label,
  done,
  pending = false,
  hint,
}: {
  label: string;
  done: boolean;
  pending?: boolean;
  hint?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      {done ? (
        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-500" />
      ) : pending ? (
        <Clock className="mt-0.5 size-5 shrink-0 text-amber-500" />
      ) : (
        <Circle className="mt-0.5 size-5 shrink-0 text-muted-foreground/40" />
      )}
      <div>
        <p className={done ? "font-medium" : "font-medium text-foreground"}>
          {label}
        </p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
    </div>
  );
}
