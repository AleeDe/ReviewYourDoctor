import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = { title: "Clinic Login — Review Your Doctor" };

export default function LoginPage() {
  return (
    <main className="patient-surface safe-px safe-pb safe-pt flex min-h-dvh items-center justify-center py-8">
      <div className="w-full max-w-sm">
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
