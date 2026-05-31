"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string
  showText?: boolean
  textSize?: string
}

export function Logo({ className, showText = false, textSize = "text-sm", ...props }: LogoProps) {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("h-8 w-8 shrink-0 transition-transform duration-300 hover:scale-105", className)}
        {...props}
      >
        <defs>
          {/* Royal Amethyst & Rose Gradient: Amethyst to Pinkish-Rose */}
          <linearGradient id="vectra-primary-grad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7c3aed" /> {/* Amethyst 600 */}
            <stop offset="50%" stopColor="#a78bfa" /> {/* Amethyst/Violet Light */}
            <stop offset="100%" stopColor="#ec4899" /> {/* Rose 500 */}
          </linearGradient>

          {/* Secondary Light Leak/Glow Gradient */}
          <linearGradient id="vectra-accent-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ec4899" stopOpacity="0.8" /> {/* Rose 500 */}
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.1" /> {/* Amethyst 600 */}
          </linearGradient>

          {/* High-end Neon Drop Shadow Glow Filter */}
          <filter id="vectra-neon-glow" x="-20%" y="-20%" width="140%" height="140%" filterUnits="userSpaceOnUse">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer Hexagonal/Circular Tech Ring */}
        <circle
          cx="50"
          cy="50"
          r="44"
          className="stroke-zinc-800/60 dark:stroke-zinc-800/40"
          strokeWidth="1.5"
          strokeDasharray="4 6"
        />

        {/* Decorative Background Pulsing Glow Path */}
        <path
          d="M 50,6 A 44,44 0 0,1 94,50"
          stroke="url(#vectra-accent-grad)"
          strokeWidth="2"
          strokeLinecap="round"
          className="opacity-30 animate-[spin_16s_linear_infinite]"
          style={{ transformOrigin: "50px 50px" }}
        />

        {/* The Geometric 'V' & Financial Upward Growth (Dynamic Ascent) */}
        {/* We use a multi-segmented vector path for modern high-end fintech look */}
        
        {/* Left Arm of 'V' */}
        <path
          d="M 28,26 L 46.5,65"
          stroke="url(#vectra-primary-grad)"
          strokeWidth="8"
          strokeLinecap="round"
        />

        {/* Right Arm of 'V' (Extends up to the chart trend line) */}
        <path
          d="M 46.5,65 L 68,26"
          stroke="url(#vectra-primary-grad)"
          strokeWidth="8"
          strokeLinecap="round"
        />

        {/* Dynamic Ascent Arrow Accent (Shooting up-right from the right arm) */}
        <path
          d="M 56,26 L 76,14 M 76,14 H 64 M 76,14 V 24"
          stroke="url(#vectra-primary-grad)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#vectra-neon-glow)"
        />

        {/* Glowing peak vertex node */}
        <circle
          cx="76"
          cy="14"
          r="4"
          className="fill-white animate-pulse"
          filter="url(#vectra-neon-glow)"
        />
      </svg>
      {showText && (
        <div className="flex flex-col">
          <span className={cn("font-bold tracking-tight bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-400 bg-clip-text text-transparent", textSize)}>
            Vectra
          </span>
          <span className="text-[9px] font-semibold tracking-widest text-muted-foreground/80 uppercase leading-none mt-0.5">
            Smart Wealth Suite
          </span>
        </div>
      )}
    </div>
  )
}

