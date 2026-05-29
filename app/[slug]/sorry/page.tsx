import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NegativeForm } from "@/components/patient/negative-form";
import type { ClinicPublic } from "@/lib/types";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ r?: string }>;
}

export default async function SorryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { r } = await searchParams;

  const supabase = await createClient();
  const { data: clinic } = await supabase
    .rpc("get_clinic_public", { p_slug: slug })
    .maybeSingle<ClinicPublic>();

  if (!clinic) {
    notFound();
  }

  // Clamp the rating to the negative range; default to 1 if missing/invalid.
  const parsed = Number(r);
  const rating = parsed >= 1 && parsed <= 3 ? parsed : 1;

  return <NegativeForm slug={clinic.slug} rating={rating} />;
}
