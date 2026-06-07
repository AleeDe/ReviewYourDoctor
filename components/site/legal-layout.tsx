import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CookiePrefsLink } from "@/components/cookie/cookie-prefs-link";

export function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-dvh bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-mark.png" alt="Review Your Doctor" className="size-7 rounded-lg" />
            <span className="hidden sm:inline">Review Your Doctor</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> Home
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-5 py-10 sm:py-14">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: {updated}</p>
        <div className="legal-prose mt-8 space-y-6 text-[15px] leading-relaxed text-foreground/90">
          {children}
        </div>
      </article>

      <footer className="border-t">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-2 px-5 py-6 text-sm text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} Review Your Doctor</span>
          <span className="flex gap-4">
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
            <Link href="/dpa" className="hover:text-foreground">DPA</Link>
            <CookiePrefsLink />
          </span>
        </div>
      </footer>
    </main>
  );
}

/** Section heading for legal pages. */
export function LegalH2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="pt-2 text-lg font-semibold text-foreground">{children}</h2>
  );
}
