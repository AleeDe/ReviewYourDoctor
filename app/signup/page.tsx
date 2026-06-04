import { SignupForm } from "@/components/auth/signup-form";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata = { title: "Start free trial | Review Your Doctor" };

export default function SignupPage() {
  return (
    <AuthShell variant="signup">
      <SignupForm />
    </AuthShell>
  );
}
