import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Clock,
  Building2,
  CheckCircle2,
  TrendingUp,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/auth";
import { AppHeader } from "@/components/app-header";
import { CreateClinicForm } from "@/components/admin/create-clinic-form";
import { QrCode } from "@/components/admin/qr-code";
import { AdminGoogleConnect } from "@/components/admin/admin-google-connect";
import { StatCard } from "@/components/dashboard/stat-card";
import { toggleClinicActive } from "./actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Clinic } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin | Review Your Doctor" };

const PAGE_SIZE = 20;
type Status = "all" | "pending" | "active";

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

interface AdminPageProps {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/admin");
  if (!isAdminEmail(user.email)) redirect("/dashboard");

  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const status: Status =
    sp.status === "pending" || sp.status === "active" ? sp.status : "all";
  const page = Math.max(1, Number(sp.page) || 1);

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "http://localhost:3000";

  // Founder needs to see ALL clinics → service-role client (bypasses RLS).
  const admin = createAdminClient();
  const monthStartISO = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1,
  ).toISOString();

  // Counts only: never load 4,000 rows just for stats.
  const [totalRes, pendingRes, monthRes, pendingListRes] = await Promise.all([
    admin.from("clinics").select("*", { count: "exact", head: true }),
    admin
      .from("clinics")
      .select("*", { count: "exact", head: true })
      .eq("is_active", false),
    admin
      .from("clinics")
      .select("*", { count: "exact", head: true })
      .gte("created_at", monthStartISO),
    admin
      .from("clinics")
      .select("*", { count: "exact" })
      .eq("is_active", false)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const totalCount = totalRes.count ?? 0;
  const pendingCount = pendingRes.count ?? 0;
  const activeCount = totalCount - pendingCount;
  const newThisMonth = monthRes.count ?? 0;
  const pending = (pendingListRes.data ?? []) as Clinic[];
  const pendingTotal = pendingListRes.count ?? 0;

  // Filtered, paginated main list.
  const from = (page - 1) * PAGE_SIZE;
  let listQuery = admin.from("clinics").select("*", { count: "exact" });
  if (status === "active") listQuery = listQuery.eq("is_active", true);
  else if (status === "pending") listQuery = listQuery.eq("is_active", false);
  if (q) {
    const safe = q.replace(/[%,()]/g, " ");
    listQuery = listQuery.or(
      `clinic_name.ilike.%${safe}%,slug.ilike.%${safe}%,manager_email.ilike.%${safe}%`,
    );
  }
  const { data: listData, count: listCount } = await listQuery
    .order("created_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);
  const clinics = (listData ?? []) as Clinic[];
  const resultCount = listCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(resultCount / PAGE_SIZE));

  function hrefFor(p: number) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status !== "all") params.set("status", status);
    if (p > 1) params.set("page", String(p));
    const s = params.toString();
    return s ? `/admin?${s}` : "/admin";
  }

  return (
    <div className="min-h-dvh bg-muted/30">
      <AppHeader
        title="Admin"
        subtitle="Founder operations"
        icon={<ShieldCheck className="size-5" />}
      >
        <Link
          href="/dashboard"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          Dashboard
        </Link>
      </AppHeader>

      <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        {/* KPI tiles */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            feature
            label="Pending approval"
            value={pendingCount}
            hint={pendingCount ? "needs your action" : "all clear"}
            icon={<Clock className="size-5" />}
          />
          <StatCard
            label="Total clinics"
            value={totalCount}
            hint="all-time"
            icon={<Building2 className="size-5" />}
          />
          <StatCard
            label="Active"
            value={activeCount}
            hint="live & collecting"
            icon={<CheckCircle2 className="size-5" />}
          />
          <StatCard
            label="New this month"
            value={newThisMonth}
            hint="sign-ups"
            icon={<TrendingUp className="size-5" />}
          />
        </div>

        {/* Pending approval queue (capped) */}
        {pending.length > 0 && (
          <Card className="rounded-2xl border-amber-200 bg-amber-50/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="size-4 text-amber-600" />
                Pending approval
                <Badge>{pendingTotal}</Badge>
              </CardTitle>
              <CardDescription>
                New sign-ups waiting to go live. Approve to activate their form.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {pending.map((c) => (
                <div
                  key={c.id}
                  className="space-y-3 rounded-xl border bg-background p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <ClinicIdentity clinic={c} />
                    <form action={toggleClinicActive}>
                      <input type="hidden" name="id" value={c.id} />
                      <input type="hidden" name="next" value="true" />
                      <Button
                        type="submit"
                        className="h-10 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-500 hover:to-green-700 sm:w-auto"
                      >
                        <CheckCircle2 className="size-4" />
                        Approve &amp; activate
                      </Button>
                    </form>
                  </div>
                  <AdminGoogleConnect
                    clinicId={c.id}
                    connected={Boolean(c.google_review_url)}
                  />
                </div>
              ))}
              {pendingTotal > pending.length && (
                <Link
                  href="/admin?status=pending"
                  className="block pt-1 text-center text-sm font-medium text-emerald-600 hover:underline"
                >
                  View all {pendingTotal} pending →
                </Link>
              )}
            </CardContent>
          </Card>
        )}

        {/* All clinics: filtered + paginated */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Clinics</CardTitle>
            <CardDescription>
              {resultCount.toLocaleString()} result
              {resultCount === 1 ? "" : "s"}
              {status !== "all" || q ? " (filtered)" : ""}.
            </CardDescription>

            {/* Filter bar (GET, works without JS) */}
            <form
              method="get"
              className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center"
            >
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  name="q"
                  defaultValue={q}
                  placeholder="Search name, link or email"
                  className="h-10 rounded-xl pl-9"
                />
              </div>
              <select
                name="status"
                defaultValue={status}
                aria-label="Filter by status"
                className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
              >
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
              </select>
              <Button type="submit" className="h-10 rounded-xl">
                Filter
              </Button>
              {(q || status !== "all") && (
                <Link
                  href="/admin"
                  className={buttonVariants({
                    variant: "ghost",
                    className: "h-10 rounded-xl",
                  })}
                >
                  Clear
                </Link>
              )}
            </form>
          </CardHeader>

          <CardContent className="space-y-3">
            {clinics.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {q || status !== "all"
                  ? "No clinics match your filters."
                  : "No clinics yet. Onboard your first one below."}
              </p>
            ) : (
              clinics.map((c) => {
                const formUrl = `${siteUrl}/${c.slug}`;
                return (
                  <div
                    key={c.id}
                    className="flex flex-col gap-4 rounded-xl border bg-background p-4 lg:flex-row lg:items-center lg:justify-between"
                  >
                    <div className="min-w-0 space-y-1">
                      <ClinicIdentity clinic={c} />
                      <a
                        href={formUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="block truncate text-sm text-emerald-600 hover:underline"
                      >
                        {formUrl}
                      </a>
                    </div>
                    <div className="flex shrink-0 items-center gap-4">
                      <QrCode slug={c.slug} siteUrl={siteUrl} />
                      <form action={toggleClinicActive}>
                        <input type="hidden" name="id" value={c.id} />
                        <input
                          type="hidden"
                          name="next"
                          value={(!c.is_active).toString()}
                        />
                        <Button type="submit" variant="outline" size="sm">
                          {c.is_active ? "Deactivate" : "Activate"}
                        </Button>
                      </form>
                    </div>
                  </div>
                );
              })
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <PagerLink
                  href={hrefFor(page - 1)}
                  disabled={page <= 1}
                  dir="prev"
                />
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <PagerLink
                  href={hrefFor(page + 1)}
                  disabled={page >= totalPages}
                  dir="next"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Onboard new clinic */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Onboard a new clinic</CardTitle>
            <CardDescription>
              Creates the clinic record and its dashboard login in one step.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateClinicForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PagerLink({
  href,
  disabled,
  dir,
}: {
  href: string;
  disabled: boolean;
  dir: "prev" | "next";
}) {
  const label = dir === "prev" ? "Previous" : "Next";
  const content =
    dir === "prev" ? (
      <>
        <ChevronLeft className="size-4" /> {label}
      </>
    ) : (
      <>
        {label} <ChevronRight className="size-4" />
      </>
    );
  if (disabled) {
    return (
      <span className="inline-flex h-9 items-center gap-1 rounded-lg px-3 text-sm text-muted-foreground/50">
        {content}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className={buttonVariants({ variant: "outline", size: "sm" })}
    >
      {content}
    </Link>
  );
}

function ClinicIdentity({ clinic: c }: { clinic: Clinic }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl border bg-card">
        {c.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={c.logo_url}
            alt={c.clinic_name}
            className="size-full object-contain p-1"
          />
        ) : (
          <span className="bg-gradient-to-br from-emerald-500 to-green-600 bg-clip-text text-sm font-bold text-transparent">
            {initialsOf(c.clinic_name)}
          </span>
        )}
      </span>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="truncate font-semibold">{c.clinic_name}</span>
          <Badge variant={c.is_active ? "default" : "secondary"}>
            {c.is_active ? "Active" : "Pending"}
          </Badge>
        </div>
        <p className="truncate text-xs text-muted-foreground">
          /{c.slug} · {c.manager_email}
        </p>
      </div>
    </div>
  );
}
