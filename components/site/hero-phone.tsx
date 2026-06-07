"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Star } from "lucide-react";

/** A floating phone mock showing the patient star screen. Pure decoration. */
export function HeroPhone() {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: reduce ? 0 : 40, rotate: reduce ? 0 : -3 }}
      animate={{ opacity: 1, y: 0, rotate: -3 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      className="relative mx-auto w-[260px]"
    >
      <motion.div
        animate={reduce ? undefined : { y: [0, -12, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="rounded-[2.5rem] border-[6px] border-neutral-900 bg-white shadow-2xl shadow-emerald-900/20"
      >
        <div className="overflow-hidden rounded-[2rem]">
          {/* notch */}
          <div className="flex justify-center bg-white pt-3">
            <div className="h-1.5 w-16 rounded-full bg-neutral-200" />
          </div>
          <div className="patient-surface flex flex-col items-center gap-5 px-6 py-10 text-center">
            <div className="size-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-md" />
            <p className="text-sm font-semibold text-neutral-800">
              Smile Dental London
            </p>
            <p className="text-xs text-neutral-500">How was your visit today?</p>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.span
                  key={i}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.6 + i * 0.12, type: "spring", stiffness: 300 }}
                >
                  <Star className="size-7 fill-amber-400 text-amber-400" strokeWidth={0} />
                </motion.span>
              ))}
            </div>
            <div className="mt-2 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 py-2.5 text-xs font-semibold text-white shadow">
              Share your experience?
            </div>
          </div>
        </div>
      </motion.div>

      {/* floating badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2, type: "spring", stiffness: 260 }}
        className="absolute -right-6 top-10 rounded-2xl border border-emerald-100 bg-white px-3 py-2 text-left shadow-lg"
      >
        <p className="text-[10px] font-medium text-neutral-400">New review</p>
        <p className="text-sm font-bold text-emerald-600">+1 ★★★★★</p>
      </motion.div>
    </motion.div>
  );
}
