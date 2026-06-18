import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export function SiteNav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto mt-3 flex max-w-5xl items-center justify-between gap-3 rounded-full border border-border/60 bg-background/70 px-4 py-2 shadow-sm backdrop-blur-md sm:px-5">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-mark.png"
            alt="Review Your Doctor"
            className="size-8 rounded-lg"
          />
          <span className="hidden sm:inline">Review Your Doctor</span>
        </Link>

        {/* Section links (desktop) */}
        <nav className="hidden items-center gap-1 md:flex">
          <a href="#how" className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
            How it works
          </a>
          <a href="#pricing" className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
            Pricing
          </a>
          <a href="#faq" className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
            FAQ
          </a>
        </nav>

        <nav className="flex items-center gap-1.5">
          <Link
            href="/login"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            Login
          </Link>
          <Link
            href="/signup"
            className={buttonVariants({
              size: "sm",
              className:
                "rounded-full bg-gradient-to-r from-emerald-500 to-green-600 shadow-sm hover:from-emerald-500 hover:to-green-700",
            })}
          >
            Start free trial
          </Link>
        </nav>
      </div>
    </header>
  );
}
