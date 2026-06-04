// Supabase Edge Function: send-negative-alert
//
// Triggered by a Database Webhook on INSERT into public.submissions.
// When the new submission is negative (is_positive = false), it looks up the
// clinic's manager_email and sends an alert over SMTP (no third-party API).
//
// Required secrets (supabase secrets set ...):
//   SMTP_HOST         - e.g. smtp.gmail.com
//   SMTP_PORT         - 465 (implicit TLS) or 587 (STARTTLS)
//   SMTP_USER         - SMTP username (e.g. shiftdeploy@gmail.com)
//   SMTP_PASS         - SMTP password / app password
//   ALERT_FROM_EMAIL  - sender address (often same as SMTP_USER)
// Auto-provided by the platform: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { createClient } from "jsr:@supabase/supabase-js@2";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

interface SubmissionRecord {
  id: string;
  clinic_id: string;
  star_rating: number;
  is_positive: boolean;
  name: string | null;
  email: string | null;
  phone: string | null;
  reason: string | null;
  created_at: string;
}

interface WebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  record: SubmissionRecord | null;
}

function ok(body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  try {
    const payload = (await req.json()) as WebhookPayload;
    const record = payload.record;

    // Only act on new, negative submissions.
    if (payload.type !== "INSERT" || !record || record.is_positive) {
      return ok({ skipped: true });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: clinic, error } = await supabase
      .from("clinics")
      .select("clinic_name, manager_email")
      .eq("id", record.clinic_id)
      .single();

    if (error || !clinic?.manager_email) {
      console.error("clinic lookup failed", error);
      return ok({ error: "clinic not found" });
    }

    const host = Deno.env.get("SMTP_HOST");
    const port = Number(Deno.env.get("SMTP_PORT") ?? "465");
    const user = Deno.env.get("SMTP_USER");
    const pass = Deno.env.get("SMTP_PASS");
    const fromEmail = Deno.env.get("ALERT_FROM_EMAIL") ?? user;

    if (!host || !user || !pass || !fromEmail) {
      console.error("SMTP not configured");
      return ok({ error: "email not configured" });
    }

    const contactLines = [
      record.name ? `Name: ${record.name}` : null,
      record.email ? `Email: ${record.email}` : null,
      record.phone ? `Phone: ${record.phone}` : null,
    ].filter(Boolean) as string[];

    const contactHtml =
      contactLines.length > 0
        ? `<p><strong>Patient contact details:</strong></p><ul>${contactLines
            .map((l) => `<li>${l}</li>`)
            .join("")}</ul>`
        : `<p>The patient did not leave contact details.</p>`;

    const reasonHtml = record.reason
      ? `<p><strong>What went wrong:</strong></p><blockquote style="border-left:3px solid #16a34a;margin:0;padding:4px 12px;color:#333">${record.reason}</blockquote>`
      : "";

    const html = `
      <div style="font-family:system-ui,sans-serif;line-height:1.5">
        <h2>New negative feedback at ${clinic.clinic_name}</h2>
        <p>A patient rated their visit <strong>${record.star_rating} star${
          record.star_rating > 1 ? "s" : ""
        }</strong>.</p>
        ${reasonHtml}
        ${contactHtml}
        <p>Please reach out privately within 24 hours to resolve the issue.</p>
        <p style="color:#666;font-size:12px">Received: ${record.created_at}</p>
      </div>`;

    const text =
      `New negative feedback at ${clinic.clinic_name}\n` +
      `Rating: ${record.star_rating} star(s)\n` +
      (record.reason ? `Reason: ${record.reason}\n` : "") +
      (contactLines.length ? contactLines.join("\n") : "No contact details") +
      `\nPlease reach out within 24 hours.`;

    const client = new SMTPClient({
      connection: {
        hostname: host,
        port,
        // Port 465 = implicit TLS; 587/others = STARTTLS upgrade.
        tls: port === 465,
        auth: { username: user, password: pass },
      },
    });

    try {
      await client.send({
        from: `Review Your Doctor <${fromEmail}>`,
        to: clinic.manager_email,
        subject: `Negative feedback (${record.star_rating}*) - ${clinic.clinic_name}`,
        content: text,
        html,
      });
    } finally {
      await client.close();
    }

    return ok({ sent: true });
  } catch (err) {
    console.error("handler error", err);
    return ok({ error: "unexpected error" });
  }
});
