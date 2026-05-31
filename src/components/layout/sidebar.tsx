"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  ArrowUpDown,
  Wallet,
  Tags,
  PiggyBank,
  FileBarChart,
  Settings,
  LogOut,
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { signOut } from "next-auth/react"

export interface SidebarUser {
  name?: string | null
  email?: string | null
  image?: string | null
}

interface SidebarProps {
  user: SidebarUser | null
}

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ArrowUpDown },
  { href: "/wallets", label: "Wallets", icon: Wallet },
  { href: "/categories", label: "Categories", icon: Tags },
  { href: "/budgets", label: "Budgets", icon: PiggyBank },
  { href: "/reports", label: "Reports", icon: FileBarChart },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()

  const getInitials = (name?: string | null) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-full w-64 flex-col border-r border-zinc-900 bg-black backdrop-blur-2xl">
      {/* Logo / Branding */}
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-zinc-900 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-300 shadow-lg shadow-white/5 ring-1 ring-white/10">
          <span className="text-sm font-extrabold tracking-tight text-zinc-950">F</span>
        </div>
        <div className="flex flex-col">
          <span className="text-base font-bold leading-tight tracking-tight bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-350 bg-clip-text text-transparent">
            FinanceTracker
          </span>
          <span className="text-[10px] font-semibold tracking-wider text-zinc-600 uppercase">
            Personal Finance
          </span>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-5">
        <nav className="flex flex-col gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon
            const isActive =
              pathname === link.href ||
              (link.href !== "/dashboard" && pathname.startsWith(link.href)) ||
              (link.href === "/dashboard" && pathname === "/dashboard")

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-zinc-900/60 text-zinc-100 shadow-md shadow-black border border-zinc-800/80"
                    : "text-zinc-500 hover:bg-zinc-900/30 hover:text-zinc-250 border border-transparent"
                )}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-zinc-200 shadow-sm shadow-zinc-200/30" />
                )}

                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-all duration-200",
                    isActive
                      ? "text-zinc-200"
                      : "text-zinc-600 group-hover:text-zinc-400"
                  )}
                />
                <span className="flex-1">{link.label}</span>

                {isActive && (
                  <div className="h-1.5 w-1.5 rounded-full bg-zinc-300 shadow-sm shadow-zinc-300/40" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Divider with label */}
        <div className="mt-6 mb-3 flex items-center gap-2 px-3">
          <Separator className="flex-1 bg-zinc-900" />
        </div>
      </ScrollArea>

      {/* User info footer */}
      <div className="shrink-0 border-t border-zinc-900 p-4">
        <div className="group flex items-center gap-3 rounded-xl bg-zinc-950/60 border border-zinc-900 p-2.5 transition-all hover:bg-zinc-900/40 hover:border-zinc-800">
          <Avatar className="h-9 w-9 shrink-0 ring-2 ring-zinc-800 ring-offset-1 ring-offset-black">
            <AvatarImage src={user?.image || ""} alt={user?.name || "User"} />
            <AvatarFallback className="bg-gradient-to-br from-zinc-100 to-zinc-300 text-xs font-bold text-zinc-950">
              {getInitials(user?.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-semibold text-zinc-200 leading-tight">
              {user?.name || "Guest User"}
            </p>
            <p className="truncate text-[11px] text-zinc-500 leading-tight">
              {user?.email || "Not signed in"}
            </p>
          </div>
          <button
            onClick={() => signOut()}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-zinc-650 transition-all hover:bg-red-950/50 hover:text-red-400"
            title="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  )
}
