"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * A friendly star mascot that bobs, blinks, waves, and twinkles.
 * Pure SVG + SMIL (wave/blink/sparkle) with a Framer bob that respects
 * prefers-reduced-motion. On-brand: the review star, given a face.
 */
export function Mascot({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      animate={reduce ? undefined : { y: [0, -8, 0] }}
      transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg
        viewBox="0 0 140 150"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="size-full drop-shadow-xl"
        role="img"
        aria-label="Waving star mascot"
      >
        <defs>
          <linearGradient id="starBody" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="55%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>

        {/* sparkles */}
        <g fill="#ffffff">
          <path d="M22 30 l2 6 l6 2 l-6 2 l-2 6 l-2-6 l-6-2 l6-2 z" opacity="0.9">
            <animate attributeName="opacity" values="0.2;1;0.2" dur="2.2s" repeatCount="indefinite" />
          </path>
          <path d="M120 26 l1.6 4.8 l4.8 1.6 l-4.8 1.6 l-1.6 4.8 l-1.6-4.8 l-4.8-1.6 l4.8-1.6 z" opacity="0.7">
            <animate attributeName="opacity" values="1;0.2;1" dur="2.6s" repeatCount="indefinite" />
          </path>
          <circle cx="126" cy="92" r="2.5" opacity="0.8">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="1.8s" repeatCount="indefinite" />
          </circle>
          <circle cx="16" cy="84" r="2" opacity="0.7">
            <animate attributeName="opacity" values="1;0.3;1" dur="2.1s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* left arm (static) */}
        <path
          d="M44 84 Q32 92 27 100"
          stroke="#f59e0b"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <circle cx="26" cy="101" r="5.5" fill="#fcd34d" />

        {/* star body */}
        <path
          d="M70 24 L81.2 54.6 L113.7 55.8 L88.1 75.9 L97 107.2 L70 89 L43 107.2 L51.9 75.9 L26.3 55.8 L58.8 54.6 Z"
          fill="url(#starBody)"
          stroke="#f59e0b"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* cheeks */}
        <circle cx="50" cy="74" r="3.5" fill="#fb7185" opacity="0.5" />
        <circle cx="90" cy="74" r="3.5" fill="#fb7185" opacity="0.5" />

        {/* eyes (blink) */}
        <g fill="#1f2937">
          <ellipse cx="60" cy="64" rx="5" ry="6">
            <animate attributeName="ry" values="6;6;0.6;6" keyTimes="0;0.9;0.95;1" dur="3.8s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="80" cy="64" rx="5" ry="6">
            <animate attributeName="ry" values="6;6;0.6;6" keyTimes="0;0.9;0.95;1" dur="3.8s" repeatCount="indefinite" />
          </ellipse>
        </g>
        {/* eye shines */}
        <circle cx="62" cy="62" r="1.4" fill="#fff" />
        <circle cx="82" cy="62" r="1.4" fill="#fff" />

        {/* smile */}
        <path
          d="M58 76 Q70 87 82 76"
          stroke="#1f2937"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />

        {/* right arm (waves) */}
        <g>
          {!reduce && (
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="0 100 82; 24 100 82; -8 100 82; 24 100 82; 0 100 82"
              dur="2.2s"
              repeatCount="indefinite"
            />
          )}
          <path
            d="M100 82 Q113 72 117 60"
            stroke="#f59e0b"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <circle cx="118" cy="59" r="6" fill="#fcd34d" />
        </g>
      </svg>
    </motion.div>
  );
}
