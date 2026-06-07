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
  FileText,
  Cookie,
  Lock,
  HeartPulse,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SiteNav } from "@/components/site/nav";
import { HeroPhone } from "@/components/site/hero-phone";
import { CookiePrefsLink } from "@/components/cookie/cookie-prefs-link";
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
                More patient feedback,{" "}
                <span className="bg-gradient-to-r from-emerald-500 to-green-600 bg-clip-text text-transparent">
                  and more honest reviews.
                </span>
              </h1>
            </StaggerItem>
            <StaggerItem>
              <p className="mx-auto mt-5 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg lg:mx-0">
                The patient feedback and reputation infrastructure for UK dental
                clinics. Invite every patient to share their experience, catch
                problems early, and grow your Google reviews, fairly.
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
            <StaggerItem>
              <div className="mt-4 flex justify-center lg:justify-start">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                  <ShieldCheck className="size-3.5" />
                  UK GDPR Compliant
                </span>
              </div>
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
          <Stat value={8} prefix="<" suffix="s" label="To rate a visit" />
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
            One scan, one tap, one choice. Every patient decides whether to share
            publicly on Google or privately with the clinic.
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
            title="Choose how to share"
            body="Every patient is then asked the same thing: leave a public Google review, or send private feedback to the clinic."
          />
          <BentoTile
            className="sm:col-span-2"
            icon={<Bell className="size-6 text-emerald-600" />}
            title="Manager follows up"
            body="Private feedback triggers an instant alert to your manager so you can reach out and make it right, quickly and professionally."
          />
          <BentoTile
            icon={<ShieldCheck className="size-6 text-emerald-600" />}
            title="Fair by design"
            body="We never block, filter, or suppress reviews. Every patient can post publicly on Google, whatever their rating."
          />
        </Stagger>
      </section>

      {/* ===== Feature highlights ===== */}
      <section className="border-t bg-muted/40">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:py-24">
          <div className="grid gap-8 lg:grid-cols-3">
            <Feature
              icon={<Smartphone className="size-6" />}
              title="Capture more feedback"
              body="Every visit becomes a chance to hear from patients, not just the unhappy few who post unprompted."
            />
            <Feature
              icon={<Bell className="size-6" />}
              title="Follow up faster"
              body="Concerns reach your manager instantly, so you can resolve issues before they escalate, and build stronger local trust."
            />
            <Feature
              icon={<TrendingUp className="size-6" />}
              title="Collect reviews fairly"
              body="Make leaving a Google review effortless for every patient, with no filtering, gating, or pressure."
            />
          </div>
        </div>
      </section>

      {/* ===== Compliance & trust ===== */}
      <section className="mx-auto max-w-5xl px-5 py-20 sm:py-24">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Built on trust and compliance
          </h2>
          <p className="mt-3 text-pretty text-lg font-medium text-emerald-700">
            We do not block, filter, or suppress reviews.
          </p>
          <p className="mt-2 text-pretty text-muted-foreground">
            Designed as a trust-first, healthcare-adjacent product, not a generic
            review funnel.
          </p>
        </Reveal>

        <Stagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <TrustCard
            icon={<ShieldCheck className="size-5" />}
            title="UK GDPR aware"
            body="Built for UK GDPR and the Data Protection Act 2018."
            href="/privacy"
          />
          <TrustCard
            icon={<FileText className="size-5" />}
            title="DPA available"
            body="A Data Processing Agreement is included with every account."
            href="/dpa"
          />
          <TrustCard
            icon={<Cookie className="size-5" />}
            title="Cookie consent"
            body="Non-essential cookies stay off until the user opts in."
          />
          <TrustCard
            icon={<Lock className="size-5" />}
            title="Minimal data"
            body="Contact details are collected only when a patient chooses to share them."
          />
          <TrustCard
            icon={<HeartPulse className="size-5" />}
            title="No medical data"
            body="We never request treatment or health information."
          />
          <TrustCard
            icon={<Star className="size-5" />}
            title="Reviews never gated"
            body="Every patient can post publicly on Google, whatever their rating."
          />
        </Stagger>
      </section>

      {/* ===== Pricing ===== */}
      <section id="pricing" className="mx-auto max-w-5xl px-5 py-20 sm:py-24">
        <Reveal className="mx-auto max-w-md">
          <div className="rounded-3xl border bg-card p-8 text-center shadow-sm">
            <h2 className="text-3xl font-bold tracking-tight">Simple pricing</h2>
            <p className="mt-2 text-muted-foreground">
              One flat price. Cancel anytime.
            </p>
            <div className="mt-6 flex items-end justify-center gap-1">
              <span className="text-5xl font-bold tracking-tight">£49</span>
              <span className="mb-1.5 text-muted-foreground">/month</span>
            </div>
            <ul className="mx-auto mt-6 max-w-xs space-y-2 text-left text-sm">
              {[
                "30-day free trial, no card required",
                "No setup fee, no annual contract",
                "Branded QR poster + dashboard included",
                "UK GDPR compliant, DPA with every account",
              ].map((line) => (
                <li key={line} className="flex items-start gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                  {line}
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className={cn(
                buttonVariants({ size: "lg" }),
                "mt-7 h-12 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-base hover:from-emerald-500 hover:to-green-700",
              )}
            >
              Start your free trial
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ===== FAQ ===== */}
      <section className="border-t bg-muted/40">
        <div className="mx-auto max-w-3xl px-5 py-20 sm:py-24">
          <Reveal className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Frequently asked questions
            </h2>
          </Reveal>
          <div className="mt-10 space-y-3">
            <Faq q="Is this GDPR compliant?">
              Yes. Review Your Doctor operates as a data processor under UK GDPR
              and the Data Protection Act 2018. A Data Processing Agreement (DPA)
              is included with every account. Patient data is encrypted, stored
              securely on UK/EU servers, and automatically deleted after 12
              months.
            </Faq>
            <Faq q="Does it filter reviews before they reach Google?">
              No. All patients are free to post publicly on Google regardless of
              their rating. The system invites every patient to share their
              experience. For patients who rate 1-3 stars, the practice manager
              receives a private alert so they can follow up, but no review is
              ever blocked or withheld.
            </Faq>
            <Faq q="Does my team need to learn new software?">
              No. A branded QR poster sits at reception. Nothing changes in your
              team&apos;s daily workflow. The only action required is printing one
              A4 poster.
            </Faq>
            <Faq q="How long does setup take?">
              Under 30 minutes from sign-up to live. We set up your account,
              generate your QR poster, and send you everything you need by email.
            </Faq>
            <Faq q="What data is collected from patients?">
              For patients who rate 4-5 stars: only an anonymous star rating. For
              patients who rate 1-3 stars and choose to leave contact details:
              name, email, and phone (all optional). No medical data is ever
              collected.
            </Faq>
            <Faq q="What is the cost after the free trial?">
              £49/month. No setup fee. No annual contract. Cancel anytime.
            </Faq>
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
      <footer className="border-t bg-muted/30">
        <div className="mx-auto max-w-6xl space-y-5 px-5 py-10 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            <ShieldCheck className="size-3.5" />
            UK GDPR Compliant
          </span>
          <p className="max-w-3xl">
            Review Your Doctor is built for UK GDPR compliance. A Data Processing
            Agreement (DPA) is included with every account. Patient data is
            encrypted, stored securely, and never used for any purpose other than
            the clinic&apos;s own feedback management.
          </p>
          <div className="flex flex-col items-start justify-between gap-4 border-t pt-5 sm:flex-row sm:items-center">
            <span className="font-medium text-foreground">
              Review Your Doctor
            </span>
            <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <Link href="/privacy" className="hover:text-foreground">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-foreground">
                Terms
              </Link>
              <Link href="/dpa" className="hover:text-foreground">
                DPA
              </Link>
              <CookiePrefsLink />
              <a
                href="mailto:contact@shiftdeploy.com"
                className="hover:text-foreground"
              >
                Contact
              </a>
              <a
                href="https://shiftdeploy.com"
                target="_blank"
                rel="noreferrer noopener"
                className="font-medium text-foreground transition-colors hover:text-emerald-600"
              >
                Powered by ShiftDeploy
              </a>
            </nav>
          </div>
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

function TrustCard({
  icon,
  title,
  body,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  href?: string;
}) {
  const inner = (
    <div className="h-full rounded-2xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
        {icon}
      </div>
      <h3 className="mt-3 font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
      {href && (
        <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-emerald-600">
          Learn more <ArrowRight className="size-3.5" />
        </span>
      )}
    </div>
  );
  return (
    <StaggerItem>
      {href ? (
        <Link href={href} className="block h-full">
          {inner}
        </Link>
      ) : (
        inner
      )}
    </StaggerItem>
  );
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="group rounded-2xl border bg-card p-5 [&[open]]:shadow-sm">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
        {q}
        <span className="text-emerald-600 transition-transform group-open:rotate-45">
          +
        </span>
      </summary>
      <p className="mt-3 text-sm text-muted-foreground">{children}</p>
    </details>
  );
}
