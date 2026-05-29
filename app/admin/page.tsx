import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/auth";
import { AppHeader } from "@/components/app-header";
import { CreateClinicForm } from "@/components/admin/create-clinic-form";
import { QrCode } from "@/components/admin/qr-code";
import { toggleClinicActive } from "./actions";
import { Button, buttonVariants } from "@/components/ui/button";
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
export const metadata = { title: "Admin — Review Your Doctor" };

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/admin");
  if (!isAdminEmail(user.email)) redirect("/dashboard");

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "http://localhost:3000";

  // Founder needs to see ALL clinics → service-role client (bypasses RLS).
  const admin = createAdminClient();
  const { data: clinicsData } = await admin
    .from("clinics")
    .select("*")
    .order("created_at", { ascending: false });
  const clinics = (clinicsData ?? []) as Clinic[];

  return (
    <div className="min-h-dvh bg-muted/30">
      <AppHeader title="Admin" subtitle="Founder operations">
        <Link
          href="/dashboard"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          Dashboard
        </Link>
      </AppHeader>

      <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <Card>
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

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Clinics ({clinics.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {clinics.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No clinics yet. Create your first one above.
              </p>
            ) : (
              clinics.map((c) => {
                const formUrl = `${siteUrl}/${c.slug}`;
                return (
                  <div
                    key={c.id}
                    className="flex flex-col gap-4 rounded-lg border bg-background p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{c.clinic_name}</span>
                        <Badge variant={c.is_active ? "default" : "secondary"}>
                          {c.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <a
                        href={formUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {formUrl}
                      </a>
                      <p className="text-xs text-muted-foreground">
                        Alerts → {c.manager_email}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <QrCode url={formUrl} slug={c.slug} />
                      <form action={toggleClinicActive}>
                        <input type="hidden" name="id" value={c.id} />
                        <input
                          type="hidden"
                          name="next"
                          value={(!c.is_active).toString()}
                        />
                        <Button
                          type="submit"
                          variant="outline"
                          size="sm"
                        >
                          {c.is_active ? "Deactivate" : "Activate"}
                        </Button>
                      </form>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
