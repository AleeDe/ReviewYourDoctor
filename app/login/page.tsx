import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = { title: "Clinic Login — Review Your Doctor" };

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-muted/30 px-6 py-10">
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
