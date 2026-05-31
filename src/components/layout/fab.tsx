"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Wallet, PiggyBank, ArrowUpDown, X } from "lucide-react"
import { cn } from "@/lib/utils"

export function QuickActionFAB() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const actions = [
    {
      label: "Add Transaction",
      icon: ArrowUpDown,
      route: "/transactions?action=add-transaction",
      color: "bg-card border-border/80 text-foreground hover:bg-secondary",
    },
    {
      label: "Connect Wallet",
      icon: Wallet,
      route: "/wallets?action=add-wallet",
      color: "bg-card border-border/80 text-foreground hover:bg-secondary",
    },
    {
      label: "Establish Budget",
      icon: PiggyBank,
      route: "/budgets?action=add-budget",
      color: "bg-card border-border/80 text-foreground hover:bg-secondary",
    },
  ]

  const handleActionClick = (route: string) => {
    setIsOpen(false)
    router.push(route)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 select-none">
      {/* Expanded Menu Actions */}
      <div
        className={cn(
          "flex flex-col items-end gap-2.5 transition-all duration-300 transform origin-bottom",
          isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-75 opacity-0 translate-y-10 pointer-events-none"
        )}
      >
        {actions.map((act, index) => {
          const Icon = act.icon
          return (
            <div
              key={index}
              className="flex items-center gap-2.5 group cursor-pointer"
              onClick={() => handleActionClick(act.route)}
            >
              {/* Action Label */}
              <span className="rounded-xl border border-border/80 bg-popover/90 backdrop-blur-md px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground shadow-sm transition-all group-hover:text-foreground group-hover:border-border">
                {act.label}
              </span>
              {/* Action Button */}
              <button
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl border shadow-md transition-all active:scale-95 duration-200",
                  act.color
                )}
              >
                <Icon className="h-4.5 w-4.5" />
              </button>
            </div>
          )
        })}
      </div>

      {/* Main Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-indigo-650 to-primary shadow-premium-4 text-white transition-all duration-300 hover:scale-105 active:scale-95 ring-4 ring-primary/20",
          isOpen ? "rotate-45" : ""
        )}
      >
        {isOpen ? (
          <X className="h-5 w-5 text-white transition-all duration-300" />
        ) : (
          <>
            {/* Pulsing ring animation */}
            <span className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping pointer-events-none" />
            <Plus className="h-5 w-5 text-white transition-all duration-300" />
          </>
        )}
      </button>
    </div>
  )
}
