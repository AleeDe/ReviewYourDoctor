export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="patient-surface safe-px safe-pb safe-pt flex min-h-dvh flex-col items-center justify-center py-8">
      <div className="w-full max-w-md">{children}</div>
    </main>
  );
}
