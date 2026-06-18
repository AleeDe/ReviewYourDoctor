import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata = { title: "Reset password | Review Your Doctor" };

export default function ResetPasswordPage() {
  return (
    <main className="patient-surface safe-px safe-pb safe-pt flex min-h-dvh items-center justify-center py-10">
      <div className="w-full max-w-sm">
        <Link
          href="/login"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to login
        </Link>
        <ResetPasswordForm />
      </div>
    </main>
  );
}
