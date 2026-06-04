import Link from "next/link";
import {
  Star,
  QrCode,
  Bell,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Smartphone,
  TrendingUp,
  Check,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SiteNav } from "@/components/site/nav";
import { HeroPhone } from "@/components/site/hero-phone";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { CountUp } from "@/components/motion/count-up";

export default function Home() {
  return (
    <main className="relative overflow-hidden">
      <SiteNav />

      {/* ===== Hero ===== */}
      <section className="patient-surface relative">
        {/* gradient blobs */}
        <div className="pointer-events-none absolute -left-24 top-10 size-72 rounded-full bg-emerald-300/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 top-40 size-80 rounded-full bg-green-400/20 blur-3xl" />

        <div className="safe-px mx-auto grid max-w-6xl items-center gap-10 px-5 pb-20 pt-28 sm:pt-32 lg:grid-cols-2 lg:gap-6 lg:pb-28 lg:pt-40">
          <Stagger className="text-center lg:text-left">
            <StaggerItem>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white/70 px-3 py-1 text-xs font-medium text-emerald-700 backdrop-blur">
                <Sparkles className="size-3.5" />
                For UK private dental clinics
              </span>
            </StaggerItem>
            <StaggerItem>
              <h1 className="mt-5 text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                More 5-star Google reviews,{" "}
                <span className="bg-gradient-to-r from-emerald-500 to-green-600 bg-clip-text text-transparent">
                  automatically.
                </span>
              </h1>
            </StaggerItem>
            <StaggerItem>
              <p className="mx-auto mt-5 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg lg:mx-0">
                A frictionless QR feedback form that sends happy patients to
                Google and quietly intercepts unhappy ones before they post, so
                your reputation keeps climbing.
              </p>
            </StaggerItem>
            <StaggerItem>
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
                <Link
                  href="/signup"
                  className={buttonVariants({
                    size: "lg",
                    className:
                      "group h-12 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-7 text-base shadow-lg shadow-emerald-600/20 hover:from-emerald-500 hover:to-green-700 sm:w-auto",
                  })}
                >
                  Start your free trial
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/login"
                  className={buttonVariants({
                    variant: "outline",
                    size: "lg",
                    className: "h-12 w-full rounded-xl px-7 text-base sm:w-auto",
                  })}
                >
                  Clinic login
                </Link>
              </div>
            </StaggerItem>
            <StaggerItem>
              <p className="mt-4 text-sm text-muted-foreground">
                30-day free trial · No card required · Live in minutes
              </p>
            </StaggerItem>
          </Stagger>

          <div className="relative">
            <HeroPhone />
          </div>
        </div>
      </section>

      {/* ===== Stats strip ===== */}
      <section className="border-y bg-background">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 px-5 py-10 sm:grid-cols-4">
          <Stat value={49} prefix="£" suffix="/mo" label="Flat pricing" />
          <Stat value={30} suffix=" days" label="Free trial" />
          <Stat value={8} prefix="<" suffix="s" label="To leave a review" />
          <Stat value={0} label="Setup for staff" />
        </div>
      </section>

      {/* ===== How it works (bento) ===== */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:py-24">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            How it works
          </h2>
          <p className="mt-3 text-pretty text-muted-foreground">
            One scan. One tap. Happy patients go public, unhappy ones come to
            you first.
          </p>
        </Reveal>

        <Stagger className="mt-12 grid auto-rows-[minmax(160px,auto)] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <BentoTile
            className="bg-gradient-to-br from-emerald-500 to-green-600 text-white sm:col-span-2 lg:row-span-2"
            icon={<QrCode className="size-7" />}
            title="Scan the QR poster"
            body="A branded A4 poster sits at reception. Patients scan with their phone. No app, no login. Your unique link never changes."
            big
          />
          <BentoTile
            icon={<Star className="size-6 text-amber-500" />}
            title="Tap a rating"
            body="One screen, five big stars. The only decision a patient makes."
          />
          <BentoTile
            icon={<TrendingUp className="size-6 text-emerald-600" />}
            title="4-5★ → Google"
            body="Happy patients are sent straight to your Google review page."
          />
          <BentoTile
            className="sm:col-span-2"
            icon={<Bell className="size-6 text-emerald-600" />}
            title="1-3★ → private alert"
            body="Unhappy patients reach you privately. You get an instant email to make it right, before a bad review ever goes public."
          />
          <BentoTile
            icon={<ShieldCheck className="size-6 text-emerald-600" />}
            title="Reputation protected"
            body="Your public rating only goes up. Issues are resolved off-platform."
          />
        </Stagger>
      </section>

      {/* ===== Feature highlights ===== */}
      <section className="border-t bg-muted/40">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:py-24">
          <div className="grid gap-8 lg:grid-cols-3">
            <Feature
              icon={<Smartphone className="size-6" />}
              title="Effortless for patients"
              body="Designed around an 8-second interaction: large stars, zero typing, instant redirect."
            />
            <Feature
              icon={<TrendingUp className="size-6" />}
              title="A dashboard you'll actually read"
              body="Scans, rating mix, live Google rating and trends, readable in under a minute."
            />
            <Feature
              icon={<ShieldCheck className="size-6" />}
              title="Private by design"
              body="Negative feedback is captured privately and routed to your manager, never published."
            />
          </div>
        </div>
      </section>

      {/* ===== Final CTA ===== */}
      <section className="mx-auto max-w-5xl px-5 py-20 sm:py-28">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 to-green-700 px-6 py-14 text-center text-white shadow-xl shadow-emerald-600/20 sm:px-12">
            <div className="pointer-events-none absolute -right-10 -top-10 size-48 rounded-full bg-white/10 blur-2xl" />
            <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              Start collecting better reviews this week
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-emerald-50">
              Sign up in two minutes. We&apos;ll review your clinic and have you
              live with a branded QR poster shortly after.
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                href="/signup"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "group h-12 rounded-xl bg-white px-8 text-base text-emerald-700 shadow-lg hover:bg-emerald-50",
                )}
              >
                Start your free trial
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
            <p className="mt-4 text-sm text-emerald-100">
              No credit card · Cancel anytime
            </p>
          </div>
        </Reveal>
      </section>

      {/* ===== Footer ===== */}
      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-sm text-muted-foreground sm:flex-row">
          <span className="font-medium text-foreground">Review Your Doctor</span>
          <span>Powered by ShiftDeploy</span>
        </div>
      </footer>
    </main>
  );
}

function Stat({
  value,
  label,
  prefix,
  suffix,
}: {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <div className="text-center">
      <div className="text-3xl font-bold tracking-tight text-emerald-600 sm:text-4xl">
        <CountUp value={value} prefix={prefix} suffix={suffix} />
      </div>
      <div className="mt-1 text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function BentoTile({
  icon,
  title,
  body,
  className = "",
  big = false,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  className?: string;
  big?: boolean;
}) {
  const dark = className.includes("text-white");
  return (
    <StaggerItem className={`group rounded-3xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md ${className}`}>
      <div
        className={`flex size-12 items-center justify-center rounded-2xl ${
          dark ? "bg-white/15" : "bg-emerald-50"
        }`}
      >
        {icon}
      </div>
      <h3
        className={`mt-4 font-semibold ${big ? "text-xl" : "text-lg"} ${
          dark ? "text-white" : ""
        }`}
      >
        {title}
      </h3>
      <p className={`mt-2 text-sm ${dark ? "text-emerald-50" : "text-muted-foreground"}`}>
        {body}
      </p>
    </StaggerItem>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <Reveal>
      <div className="flex flex-col gap-3">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-sm">
          {icon}
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{body}</p>
        <span className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-emerald-600">
          <Check className="size-4" /> Built into V1
        </span>
      </div>
    </Reveal>
  );
}
