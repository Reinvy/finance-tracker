"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface GlowCardProps extends React.ComponentProps<"div"> {
  glowColor?: string
  glowSize?: number
}

export function GlowCard({
  className,
  children,
  glowColor = "rgba(99, 102, 241, 0.12)",
  glowSize = 350,
  ...props
}: GlowCardProps) {
  const cardRef = React.useRef<HTMLDivElement>(null)
  const [coords, setCoords] = React.useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = React.useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "glow-card group/glow-card relative flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-premium-2 transition-all duration-300 hover:shadow-premium-3 hover:border-border",
        className
      )}
      {...props}
    >
      {/* Dynamic Radial Glow Background */}
      {isHovered && (
        <div
          className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
          style={{
            background: `radial-gradient(${glowSize}px circle at ${coords.x}px ${coords.y}px, ${glowColor}, transparent 80%)`,
          }}
        />
      )}

      {/* Decorative top lighting highlight in Dark Mode */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-primary/10 to-transparent pointer-events-none opacity-0 group-hover/glow-card:opacity-100 transition-opacity duration-500" />

      {/* Card Content Wrapper */}
      <div className="relative z-10 flex flex-col flex-1 gap-2">
        {children}
      </div>
    </div>
  )
}
