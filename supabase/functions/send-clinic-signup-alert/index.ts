import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

interface ClinicRecord {
  clinic_name: string;
  manager_email: string;
  slug: string;
  created_at: string;
  is_active: boolean;
}

function ok(body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  try {
    const payload = (await req.json()) as {
      type?: string;
      record?: ClinicRecord;
    };
    const clinic = payload.record;
    if (payload.type !== "INSERT" || !clinic || clinic.is_active) {
      return ok({ skipped: true });
    }

    const host = Deno.env.get("SMTP_HOST");
    const port = Number(Deno.env.get("SMTP_PORT") ?? "465");
    const user = Deno.env.get("SMTP_USER");
    const pass = Deno.env.get("SMTP_PASS");
    const from = Deno.env.get("ALERT_FROM_EMAIL") ?? user;
    const recipients = Deno.env.get("ADMIN_ALERT_EMAILS");
    const siteUrl = (Deno.env.get("SITE_URL") ?? "").replace(/\/$/, "");
    if (!host || !user || !pass || !from || !recipients) {
      console.error("signup alert email is not configured");
      return ok({ error: "email not configured" });
    }

    const client = new SMTPClient({
      connection: {
        hostname: host,
        port,
        tls: port === 465,
        auth: { username: user, password: pass },
      },
    });
    try {
      await client.send({
        from: `Review Your Doctor <${from}>`,
        to: recipients.split(",").map((r) => r.trim()).filter(Boolean),
        subject: `Clinic approval needed - ${clinic.clinic_name}`,
        content: [
          `New clinic signup: ${clinic.clinic_name}`,
          `Email: ${clinic.manager_email}`,
          `Link: /${clinic.slug}`,
          `Registered: ${clinic.created_at}`,
          siteUrl ? `Approve: ${siteUrl}/admin?status=pending` : "",
        ].filter(Boolean).join("\n"),
      });
    } finally {
      try {
        await client.close();
      } catch (_) {
        // denomailer throws on close after a failed connection - ignore.
      }
    }
    return ok({ sent: true });
  } catch (error) {
    console.error("signup alert failed", error);
    return ok({ error: "unexpected error" });
  }
});

