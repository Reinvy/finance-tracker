"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

function Progress({
  className,
  value = 0,
  max = 100,
  color = "var(--primary)",
  ...props
}: React.ComponentProps<"div"> & {
  value?: number
  max?: number
  color?: string
}) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div
      data-slot="progress"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-muted",
        className
      )}
      {...props}
    >
      <div
        className="h-full w-full flex-1 rounded-full transition-all duration-300 ease-in-out"
        style={{
          width: `${percentage}%`,
          backgroundColor: color,
        }}
      />
    </div>
  )
}

export { Progress }
