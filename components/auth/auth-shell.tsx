"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Star } from "lucide-react";
import { CountUp } from "@/components/motion/count-up";

type Variant = "login" | "signup";

const COPY: Record<Variant, { eyebrow: string; title: string }> = {
  login: {
    eyebrow: "Welcome back",
    title: "Your reputation, on autopilot.",
  },
  signup: {
    eyebrow: "Start your 30-day free trial",
    title: "More 5-star reviews, automatically.",
  },
};

const EASE = [0.22, 1, 0.36, 1] as const;

export function AuthShell({
  variant,
  children,
}: {
  variant: Variant;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();
  const copy = COPY[variant];
  const illustration = variant === "signup" ? "/signup-svg.svg" : "/login-svg.svg";

  return (
    <main className="min-h-dvh lg:grid lg:grid-cols-[1.05fr_1fr]">
      {/* ===== Brand panel (desktop) ===== */}
      <aside className="relative hidden overflow-hidden bg-emerald-600 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        {/* layered gradient + glow for depth */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-400 via-emerald-600 to-green-800" />
        <div className="pointer-events-none absolute -left-24 -top-20 size-96 rounded-full bg-lime-300/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-0 size-96 rounded-full bg-teal-400/20 blur-3xl" />
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-[0.18]" />

        <Link
          href="/"
          className="relative z-10 flex items-center gap-2 font-semibold"
        >
          <span className="grid size-9 place-items-center rounded-full bg-white/15 ring-1 ring-white/25 backdrop-blur">
            <Star className="size-5 fill-white" strokeWidth={0} />
          </span>
          Review Your Doctor
        </Link>

        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.12 } } }}
          className="relative z-10 flex flex-col items-center text-center"
        >
          <Item>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium ring-1 ring-white/20 backdrop-blur">
              {copy.eyebrow}
            </span>
          </Item>
          <Item>
            <h1 className="mt-5 max-w-md text-balance text-4xl font-bold leading-[1.1] tracking-tight">
              {copy.title}
            </h1>
          </Item>

          {/* Hero illustration */}
          <Item>
            <motion.div
              animate={reduce ? undefined : { y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="mt-5 w-[min(78vw,440px)] xl:w-[min(40vw,520px)]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={illustration}
                alt=""
                aria-hidden="true"
                className="h-auto w-full"
              />
            </motion.div>
          </Item>

          {/* Compact proof stats */}
          <Item>
            <div className="mt-5 grid w-full max-w-sm grid-cols-3 gap-4 border-t border-white/15 pt-5">
              <Stat value={38} prefix="+" suffix="%" label="more reviews" />
              <Stat value={4.8} decimals={1} suffix="★" label="avg rating" />
              <Stat value={8} prefix="<" suffix="s" label="to review" />
            </div>
          </Item>
        </motion.div>

        <a
          href="https://shiftdeploy.com"
          target="_blank"
          rel="noreferrer noopener"
          className="relative z-10 text-sm text-emerald-100/80 transition-colors hover:text-white"
        >
          Powered by ShiftDeploy
        </a>
      </aside>

      {/* ===== Form side ===== */}
      <section className="patient-surface safe-px safe-pb safe-pt relative flex min-h-dvh flex-col items-center justify-center py-10">
        {/* faint top glow so the white side isn't empty */}
        <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-emerald-200/40 blur-3xl" />

        <div className="relative z-10 w-full max-w-md">
          <Link
            href="/"
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Back to home
          </Link>

          {/* mobile brand + illustration (desktop shows it in the panel) */}
          <div className="mb-6 flex flex-col items-center text-center lg:hidden">
            <span className="flex items-center gap-2 font-semibold">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-mark.png"
                alt="Review Your Doctor"
                className="size-8 rounded-lg"
              />
              Review Your Doctor
            </span>
            <motion.div
              animate={reduce ? undefined : { y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="mt-4 w-[min(72vw,300px)]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={illustration}
                alt=""
                aria-hidden="true"
                className="h-auto w-full"
              />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: reduce ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            {children}
          </motion.div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            By continuing you agree to our terms & privacy policy.
          </p>
        </div>
      </section>
    </main>
  );
}

function Item({ children }: { children: ReactNode }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 18 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
      }}
    >
      {children}
    </motion.div>
  );
}

function Stat({
  value,
  label,
  prefix,
  suffix,
  decimals = 0,
}: {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) {
  return (
    <div>
      <p className="text-2xl font-bold tracking-tight">
        <CountUp value={value} prefix={prefix} suffix={suffix} decimals={decimals} />
      </p>
      <p className="mt-0.5 text-xs text-emerald-100/80">{label}</p>
    </div>
  );
}
