import { createClient } from "jsr:@supabase/supabase-js@2";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

interface Clinic {
  id: string;
  clinic_name: string;
  manager_email: string;
  trial_ends_at: string;
  trial_reminder_days: number | null;
}

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.headers.get("x-cron-secret") !== Deno.env.get("CRON_SECRET")) {
    return json({ error: "Unauthorized" }, 401);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const now = new Date();
  const inEightDays = new Date(now.getTime() + 8 * 86400000).toISOString();
  const { data, error } = await supabase
    .from("clinics")
    .select("id, clinic_name, manager_email, trial_ends_at, trial_reminder_days")
    .eq("is_active", true)
    .eq("billing_status", "trial")
    .not("trial_ends_at", "is", null)
    .lte("trial_ends_at", inEightDays);
  if (error) return json({ error: error.message }, 500);

  const host = Deno.env.get("SMTP_HOST")!;
  const port = Number(Deno.env.get("SMTP_PORT") ?? "465");
  const user = Deno.env.get("SMTP_USER")!;
  const pass = Deno.env.get("SMTP_PASS")!;
  const from = Deno.env.get("ALERT_FROM_EMAIL") ?? user;
  const billingUrl = Deno.env.get("BILLING_URL") ?? "";
  const milestones = [7, 3, 1, 0];
  let sent = 0;

  if (!host || !user || !pass || !from) {
    return json({ error: "SMTP is not configured" }, 500);
  }

  for (const clinic of (data ?? []) as Clinic[]) {
    const rawDays = Math.ceil((new Date(clinic.trial_ends_at).getTime() - now.getTime()) / 86400000);
    const days = Math.max(rawDays, 0);
    const reminderMarker = rawDays < 0
      ? -1
      : milestones.slice().reverse().find((milestone) => rawDays <= milestone);
    if (reminderMarker === undefined || clinic.trial_reminder_days === reminderMarker) continue;

    const subject = rawDays < 0
      ? `Your Review Your Doctor trial has ended`
      : `Your trial ${days === 0 ? "ends today" : `ends in ${days} day${days === 1 ? "" : "s"}`}`;
    const client = new SMTPClient({
      connection: { hostname: host, port, tls: port === 465, auth: { username: user, password: pass } },
    });
    try {
      await client.send({
        from: `Review Your Doctor <${from}>`,
        to: clinic.manager_email,
        subject,
        content: [
          `Hello ${clinic.clinic_name},`,
          "",
          rawDays < 0
            ? "Your 30-day trial has ended. Please arrange payment to keep your clinic active."
            : `Your 30-day trial ${days === 0 ? "ends today" : `ends in ${days} day${days === 1 ? "" : "s"}`}.`,
          "The subscription is £49 per month and can be cancelled anytime.",
          billingUrl ? `Pay securely: ${billingUrl}` : "Please contact ShiftDeploy to arrange payment.",
        ].join("\n"),
      });
    } finally {
      try {
        await client.close();
      } catch {
        // denomailer can throw on close after a failed connection - ignore.
      }
    }

    await supabase.from("clinics").update({
      trial_reminder_days: reminderMarker,
      trial_reminder_sent_at: new Date().toISOString(),
      ...(rawDays < 0 ? { billing_status: "past_due" } : {}),
    }).eq("id", clinic.id);
    sent++;
  }
  return json({ sent });
});
