import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-background px-6 py-16 text-center">
      <div className="max-w-2xl space-y-4">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Review Your Doctor
        </p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          More 5-star Google reviews for your dental clinic — automatically.
        </h1>
        <p className="text-lg text-muted-foreground">
          A frictionless QR feedback form that sends happy patients to Google and
          quietly intercepts unhappy ones before they post — so your reputation
          keeps growing.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/login" className={buttonVariants({ size: "lg" })}>
          Clinic login
        </Link>
      </div>
    </main>
  );
}
