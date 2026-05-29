import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLiveRating } from "@/lib/google/places";
import { AppHeader } from "@/components/app-header";
import { RatingBarChart } from "@/components/dashboard/rating-bar-chart";
import {
  TrendLineChart,
  type TrendPoint,
} from "@/components/dashboard/trend-line-chart";
import { isAdminEmail } from "@/lib/auth";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Clinic, Submission } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard — Review Your Doctor" };

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
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

  // RLS restricts this to the clinic owned by the current user.
  const { data: clinic } = await supabase
    .from("clinics")
    .select("*")
    .maybeSingle<Clinic>();

  if (!clinic) {
    return (
      <div className="min-h-dvh bg-muted/30">
        <AppHeader title="Review Your Doctor" />
        <div className="mx-auto max-w-2xl px-6 py-16 text-center">
          <h1 className="text-xl font-semibold">No clinic linked yet</h1>
          <p className="mt-2 text-muted-foreground">
            Your account isn&apos;t linked to a clinic. Please contact the Review
            Your Doctor team to finish setup.
          </p>
        </div>
      </div>
    );
  }

  const { data: submissionsData } = await supabase
    .from("submissions")
    .select("*")
    .order("created_at", { ascending: false });

  const submissions = (submissionsData ?? []) as Submission[];

  // ---- aggregate ----
  const monthStart = startOfMonth(new Date());
  const totalAllTime = submissions.length;
  const totalThisMonth = submissions.filter(
    (s) => new Date(s.created_at) >= monthStart,
  ).length;

  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const s of submissions) distribution[s.star_rating]++;

  const negatives = submissions.filter((s) => !s.is_positive);
  const trend = buildTrend(submissions);

  const liveRating = await getLiveRating(clinic.google_place_id);
  const showAdminLink = isAdminEmail(user.email);

  return (
    <div className="min-h-dvh bg-muted/30">
      <AppHeader title={clinic.clinic_name} subtitle="Reputation dashboard">
        {showAdminLink && (
          <Link
            href="/admin"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            Admin
          </Link>
        )}
      </AppHeader>

      <div className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        {/* Top metrics */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Live Google rating</CardDescription>
              <CardTitle className="text-4xl">
                {liveRating.rating != null ? liveRating.rating.toFixed(1) : "—"}
                <span className="text-2xl text-yellow-400"> ★</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {liveRating.reviewCount != null
                ? `${liveRating.reviewCount} Google reviews`
                : "Connect a Google Place ID"}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Scans this month</CardDescription>
              <CardTitle className="text-4xl">{totalThisMonth}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {totalAllTime} all-time
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Negatives intercepted</CardDescription>
              <CardTitle className="text-4xl">{negatives.length}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              kept off Google
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Positive rate</CardDescription>
              <CardTitle className="text-4xl">
                {totalAllTime > 0
                  ? Math.round(
                      ((totalAllTime - negatives.length) / totalAllTime) * 100,
                    )
                  : 0}
                %
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              4–5★ sent to Google
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Rating distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <RatingBarChart distribution={distribution} />
            </CardContent>
          </Card>
          <Card>
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

        {/* Negative submissions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Negative feedback to follow up
            </CardTitle>
            <CardDescription>
              Patients who rated 1–3★. Reach out privately and resolve.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {negatives.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No negative feedback yet. 🎉
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {negatives.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="whitespace-nowrap">
                        {new Date(s.created_at).toLocaleDateString("en-GB")}
                      </TableCell>
                      <TableCell>{s.star_rating}★</TableCell>
                      <TableCell>{s.name || "—"}</TableCell>
                      <TableCell>{s.email || "—"}</TableCell>
                      <TableCell>{s.phone || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
