"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser, isAdminEmail } from "@/lib/auth";

export interface ActionState {
  ok: boolean;
  message: string;
}

async function assertAdmin() {
  const user = await getCurrentUser();
  if (!isAdminEmail(user?.email)) {
    throw new Error("Not authorised");
  }
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createClinic(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await assertAdmin();

    const clinicName = String(formData.get("clinic_name") ?? "").trim();
    const rawSlug = String(formData.get("slug") ?? "").trim();
    const slug = slugify(rawSlug || clinicName);
    const googleReviewUrl =
      String(formData.get("google_review_url") ?? "").trim() || null;
    const managerEmail = String(formData.get("manager_email") ?? "").trim();
    const googlePlaceId =
      String(formData.get("google_place_id") ?? "").trim() || null;
    const ownerEmail = String(formData.get("owner_email") ?? "").trim();
    const ownerPassword = String(formData.get("owner_password") ?? "");

    if (!clinicName || !slug || !managerEmail || !ownerEmail || !ownerPassword) {
      return { ok: false, message: "Please fill in all required fields." };
    }
    if (ownerPassword.length < 8) {
      return { ok: false, message: "Temporary password must be 8+ characters." };
    }

    const admin = createAdminClient();

    // 1. Create the clinic's login user.
    const { data: created, error: userErr } = await admin.auth.admin.createUser({
      email: ownerEmail,
      password: ownerPassword,
      email_confirm: true,
    });
    if (userErr || !created?.user) {
      return {
        ok: false,
        message: `Could not create login: ${userErr?.message ?? "unknown error"}`,
      };
    }

    // 2. Insert the clinic, linked to that user.
    const { error: clinicErr } = await admin.from("clinics").insert({
      slug,
      clinic_name: clinicName,
      google_review_url: googleReviewUrl,
      manager_email: managerEmail,
      google_place_id: googlePlaceId,
      owner_user_id: created.user.id,
      is_active: true,
      approved_at: new Date().toISOString(),
      trial_ends_at: new Date(Date.now() + 30 * 86400000).toISOString(),
      billing_status: "trial",
    });

    if (clinicErr) {
      // Roll back the orphaned auth user.
      await admin.auth.admin.deleteUser(created.user.id);
      return {
        ok: false,
        message: `Could not create clinic: ${clinicErr.message}`,
      };
    }

    revalidatePath("/admin");
    return { ok: true, message: `Clinic "${clinicName}" created (/${slug}).` };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Unexpected error",
    };
  }
}

export async function adminConnectGoogle(
  clinicId: string,
  placeId: string | null,
  reviewUrl: string,
): Promise<{ ok: boolean; message?: string }> {
  const user = await getCurrentUser();
  if (!isAdminEmail(user?.email)) return { ok: false, message: "Not authorised" };
  if (!clinicId || !reviewUrl) return { ok: false, message: "Missing data" };

  const admin = createAdminClient();
  const { error } = await admin
    .from("clinics")
    .update({ google_place_id: placeId, google_review_url: reviewUrl })
    .eq("id", clinicId);
  if (error) return { ok: false, message: error.message };

  revalidatePath("/admin");
  return { ok: true };
}

export async function toggleClinicActive(formData: FormData): Promise<void> {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  const next = String(formData.get("next") ?? "") === "true";
  if (!id) return;

  const admin = createAdminClient();
  const { data: clinic } = await admin
    .from("clinics")
    .select("approved_at")
    .eq("id", id)
    .maybeSingle();
  const startsFirstTrial = next && !clinic?.approved_at;
  await admin
    .from("clinics")
    .update({
      is_active: next,
      ...(startsFirstTrial
        ? {
            approved_at: new Date().toISOString(),
            trial_ends_at: new Date(Date.now() + 30 * 86400000).toISOString(),
            billing_status: "trial",
            trial_reminder_days: null,
          }
        : {}),
    })
    .eq("id", id);
  revalidatePath("/admin");
}

export async function updateClinicBilling(formData: FormData): Promise<void> {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("billing_status") ?? "");
  const paidUntil = String(formData.get("paid_until") ?? "");
  if (!id || !["trial", "paid", "past_due", "cancelled"].includes(status)) return;

  const admin = createAdminClient();
  await admin
    .from("clinics")
    .update({
      billing_status: status,
      paid_until: paidUntil ? new Date(`${paidUntil}T23:59:59Z`).toISOString() : null,
    })
    .eq("id", id);
  revalidatePath("/admin");
  revalidatePath("/dashboard");
}
