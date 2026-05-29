import Link from "next/link";
import { Star } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="patient-surface safe-px safe-pb safe-pt flex min-h-dvh flex-col items-center justify-center py-12 text-center">
      <div className="w-full max-w-2xl space-y-6">
        <div className="flex items-center justify-center gap-1.5 text-amber-400">
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} className="size-6 fill-amber-400" strokeWidth={1.5} />
          ))}
        </div>
        <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Review Your Doctor
        </p>
        <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
          More 5-star Google reviews for your dental clinic — automatically.
        </h1>
        <p className="text-pretty text-base text-muted-foreground sm:text-lg">
          A frictionless QR feedback form that sends happy patients to Google and
          quietly intercepts unhappy ones before they post — so your reputation
          keeps growing.
        </p>
        <div className="flex items-center justify-center pt-2">
          <Link
            href="/login"
            className={buttonVariants({
              size: "lg",
              className: "h-12 rounded-xl px-8 text-base",
            })}
          >
            Clinic login
          </Link>
        </div>
      </div>
    </main>
  );
}
