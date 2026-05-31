"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Plus, Wallet, PiggyBank, ArrowUpDown, X } from "lucide-react"
import { cn } from "@/lib/utils"

export function QuickActionFAB() {
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const actions = [
    {
      label: "Add Transaction",
      icon: ArrowUpDown,
      route: "/transactions?action=add-transaction",
      color: "bg-zinc-900 text-zinc-100 hover:text-white border-zinc-800",
    },
    {
      label: "Add Wallet",
      icon: Wallet,
      route: "/wallets?action=add-wallet",
      color: "bg-zinc-900 text-zinc-100 hover:text-white border-zinc-800",
    },
    {
      label: "Add Budget",
      icon: PiggyBank,
      route: "/budgets?action=add-budget",
      color: "bg-zinc-900 text-zinc-100 hover:text-white border-zinc-800",
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
              className="flex items-center gap-2 group cursor-pointer"
              onClick={() => handleActionClick(act.route)}
            >
              {/* Action Label */}
              <span className="rounded-lg bg-zinc-950/90 border border-zinc-800 px-2.5 py-1 text-xs font-semibold text-zinc-300 shadow-md transition-all group-hover:text-white group-hover:border-zinc-700">
                {act.label}
              </span>
              {/* Action Button */}
              <button
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl border shadow-lg transition-all active:scale-95 duration-200",
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
          "relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-zinc-100 via-zinc-200 to-zinc-350 shadow-2xl text-zinc-950 transition-all duration-300 hover:scale-105 active:scale-95 ring-4 ring-zinc-900/30",
          isOpen ? "rotate-45" : ""
        )}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-zinc-950 transition-all duration-300" />
        ) : (
          <>
            {/* Pulsing ring animation */}
            <span className="absolute inset-0 rounded-full bg-white/20 animate-ping pointer-events-none" />
            <Plus className="h-6 w-6 text-zinc-950 transition-all duration-300" />
          </>
        )}
      </button>
    </div>
  )
}
