export default function ClinicNotFound() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-4 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">
        Clinic not found
      </h1>
      <p className="text-muted-foreground">
        This feedback link isn&apos;t active. Please check the QR code or contact
        your clinic.
      </p>
    </div>
  );
}
