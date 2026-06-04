"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { CountUp } from "@/components/motion/count-up";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  hint?: string;
  icon?: ReactNode;
  /** Use the bold green gradient (hero tile). */
  feature?: boolean;
  className?: string;
}

export function StatCard({
  label,
  value,
  decimals = 0,
  prefix,
  suffix,
  hint,
  icon,
  feature = false,
  className,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3 }}
      className={cn(
        "relative overflow-hidden rounded-3xl border p-5 shadow-sm",
        feature
          ? "border-transparent bg-gradient-to-br from-emerald-500 to-green-700 text-white shadow-emerald-600/20"
          : "bg-card",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "text-sm",
            feature ? "text-emerald-50" : "text-muted-foreground",
          )}
        >
          {label}
        </span>
        {icon && (
          <span
            className={cn(
              "grid size-9 place-items-center rounded-xl",
              feature ? "bg-white/15 text-white" : "bg-emerald-50 text-emerald-600",
            )}
          >
            {icon}
          </span>
        )}
      </div>
      <div className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
        <CountUp
          value={value}
          decimals={decimals}
          prefix={prefix}
          suffix={suffix}
        />
      </div>
      {hint && (
        <p
          className={cn(
            "mt-1 text-sm",
            feature ? "text-emerald-100" : "text-muted-foreground",
          )}
        >
          {hint}
        </p>
      )}
      {feature && (
        <div className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-white/10 blur-2xl" />
      )}
    </motion.div>
  );
}
