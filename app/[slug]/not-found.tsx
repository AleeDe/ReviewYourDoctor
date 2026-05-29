import { SearchX } from "lucide-react";

export default function ClinicNotFound() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl border border-border/60 bg-card p-8 text-center shadow-lg shadow-black/5 sm:p-10">
      <SearchX className="size-12 text-muted-foreground" strokeWidth={1.75} />
      <h1 className="text-2xl font-semibold tracking-tight">Clinic not found</h1>
      <p className="text-pretty text-muted-foreground">
        This feedback link isn&apos;t active. Please check the QR code or contact
        your clinic.
      </p>
    </div>
  );
}
