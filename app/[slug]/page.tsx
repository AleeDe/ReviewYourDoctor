import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StarRating } from "@/components/patient/star-rating";
import type { ClinicPublic } from "@/lib/types";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getClinic(slug: string): Promise<ClinicPublic | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .rpc("get_clinic_public", { p_slug: slug })
    .maybeSingle<ClinicPublic>();
  return data ?? null;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const clinic = await getClinic(slug);
  return {
    title: clinic ? `${clinic.clinic_name} | Leave Feedback` : "Feedback",
  };
}

export default async function ClinicFormPage({ params }: PageProps) {
  const { slug } = await params;
  const clinic = await getClinic(slug);

  if (!clinic) {
    notFound();
  }

  return (
    <StarRating
      slug={clinic.slug}
      clinicName={clinic.clinic_name}
      googleReviewUrl={clinic.google_review_url}
      positiveThreshold={clinic.positive_threshold}
    />
  );
}
