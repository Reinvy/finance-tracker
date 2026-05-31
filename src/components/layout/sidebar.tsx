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
    <aside className="fixed left-0 top-0 z-40 flex h-full w-64 flex-col border-r border-white/[0.06] bg-gradient-to-b from-[#0c0922]/95 via-[#110b28]/90 to-[#0c0922]/95 backdrop-blur-2xl">
      {/* Logo / Branding */}
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-white/[0.05] px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20 ring-1 ring-white/10">
          <span className="text-sm font-extrabold tracking-tight text-white">F</span>
        </div>
        <div className="flex flex-col">
          <span className="text-base font-bold leading-tight tracking-tight bg-gradient-to-r from-indigo-200 via-purple-200 to-indigo-100 bg-clip-text text-transparent">
            FinanceTracker
          </span>
          <span className="text-[10px] font-medium tracking-wider text-indigo-400/50 uppercase">
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
                    ? "bg-gradient-to-r from-indigo-500/15 to-purple-500/10 text-indigo-100 shadow-sm shadow-indigo-500/5 border border-indigo-500/20"
                    : "text-indigo-200/50 hover:bg-white/[0.05] hover:text-indigo-200/80 border border-transparent"
                )}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-gradient-to-b from-indigo-400 to-purple-500 shadow-sm shadow-indigo-400/30" />
                )}

                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-all duration-200",
                    isActive
                      ? "text-indigo-400"
                      : "text-indigo-300/40 group-hover:text-indigo-300/70"
                  )}
                />
                <span className="flex-1">{link.label}</span>

                {isActive && (
                  <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 shadow-sm shadow-indigo-400/40" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Divider with label */}
        <div className="mt-6 mb-3 flex items-center gap-2 px-3">
          <Separator className="flex-1 bg-white/[0.04]" />
        </div>
      </ScrollArea>

      {/* User info footer */}
      <div className="shrink-0 border-t border-white/[0.05] p-4">
        <div className="group flex items-center gap-3 rounded-xl bg-white/[0.03] p-2.5 transition-all hover:bg-white/[0.06]">
          <Avatar className="h-9 w-9 shrink-0 ring-2 ring-indigo-500/15 ring-offset-1 ring-offset-[#0c0922]">
            <AvatarImage src={user?.image || ""} alt={user?.name || "User"} />
            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-semibold text-white">
              {getInitials(user?.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-indigo-100 leading-tight">
              {user?.name || "Guest User"}
            </p>
            <p className="truncate text-[11px] text-indigo-300/40 leading-tight">
              {user?.email || "Not signed in"}
            </p>
          </div>
          <button
            onClick={() => signOut()}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-indigo-300/30 transition-all hover:bg-red-500/15 hover:text-red-400"
            title="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  )
}
