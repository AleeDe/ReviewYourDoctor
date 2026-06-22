/**
 * Application-level types mirroring the Supabase schema.
 * (Hand-written for V1; can be replaced by `supabase gen types` output later.)
 */

export interface Clinic {
  id: string;
  slug: string;
  clinic_name: string;
  google_review_url: string | null;
  manager_email: string;
  google_place_id: string | null;
  owner_user_id: string | null;
  logo_url: string | null;
  positive_threshold: number;
  created_at: string;
  trial_ends_at: string | null;
  approved_at: string | null;
  is_active: boolean;
  billing_status: "trial" | "paid" | "past_due" | "cancelled";
  paid_until: string | null;
  trial_reminder_days: number | null;
  trial_reminder_sent_at: string | null;
}

/** Public-facing subset returned by the get_clinic_public RPC. */
export interface ClinicPublic {
  slug: string;
  clinic_name: string;
  google_review_url: string | null;
  logo_url: string | null;
  positive_threshold: number;
}

export interface Submission {
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
