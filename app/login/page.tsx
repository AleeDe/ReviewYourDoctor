import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata = { title: "Clinic Login | Review Your Doctor" };

export default function LoginPage() {
  return (
    <AuthShell variant="login">
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
