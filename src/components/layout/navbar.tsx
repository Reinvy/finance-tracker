"use client"

import { usePathname, useRouter } from "next/navigation"
import { Search, Bell, ChevronDown, LogOut, User, Settings } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOut } from "next-auth/react"

export interface NavbarUser {
  name?: string | null
  email?: string | null
  image?: string | null
}

interface NavbarProps {
  user: NavbarUser | null
}

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/transactions": "Transactions",
  "/wallets": "Wallets",
  "/categories": "Categories",
  "/budgets": "Budgets",
  "/reports": "Reports",
  "/settings": "Settings",
}

function getPageTitle(pathname: string): string {
  if (pathname === "/dashboard") return "Dashboard"
  const base = "/" + (pathname.split("/")[1] || "")
  return pageTitles[base] || "Dashboard"
}

function getInitials(name?: string | null): string {
  if (!name) return "U"
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const pageTitle = getPageTitle(pathname)

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b border-white/[0.06] bg-[#070512]/70 backdrop-blur-xl px-6">
      {/* Page title */}
      <h1 className="text-lg font-semibold tracking-tight text-indigo-50 min-w-0 truncate">
        {pageTitle}
      </h1>

      {/* Search */}
      <div className="relative ml-auto max-w-xs flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-300/30" />
        <Input
          placeholder="Search transactions..."
          className="h-9 w-full rounded-xl border-white/[0.06] bg-white/[0.04] pl-9 pr-3 text-sm text-indigo-100 placeholder:text-indigo-300/25 transition-all focus:border-indigo-500/25 focus:bg-white/[0.07] focus:ring-2 focus:ring-indigo-500/10"
        />
      </div>

      {/* Notifications bell */}
      <button className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-indigo-300/40 transition-all hover:bg-white/[0.06] hover:text-indigo-200">
        <Bell className="h-4 w-4" />
        <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-indigo-400 ring-2 ring-[#070512]" />
      </button>

      {/* User avatar dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button className="flex shrink-0 items-center gap-2 rounded-xl bg-white/[0.04] p-1.5 pr-2.5 transition-all hover:bg-white/[0.07] hover:ring-1 hover:ring-white/[0.06]" />
          }
        >
          <Avatar className="h-8 w-8 ring-2 ring-indigo-500/15">
            <AvatarImage src={user?.image || ""} alt={user?.name || "User"} />
            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-[11px] font-semibold text-white">
              {getInitials(user?.name)}
            </AvatarFallback>
          </Avatar>
          <div className="hidden text-left md:block">
            <p className="text-sm font-medium text-indigo-100 leading-tight">
              {user?.name || "Guest"}
            </p>
            <p className="text-[11px] text-indigo-300/40 leading-tight">
              {user?.email || "Not signed in"}
            </p>
          </div>
          <ChevronDown className="hidden h-3.5 w-3.5 text-indigo-300/40 md:block" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="w-56 border border-white/[0.06] bg-[#0c0922]/95 backdrop-blur-2xl shadow-2xl shadow-black/40"
        >
          <DropdownMenuLabel className="text-indigo-100 font-medium">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8 ring-2 ring-indigo-500/15">
                <AvatarImage src={user?.image || ""} alt={user?.name || "User"} />
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-[11px] font-semibold text-white">
                  {getInitials(user?.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-indigo-100">
                  {user?.name || "Guest"}
                </p>
                <p className="text-xs text-indigo-300/50">
                  {user?.email || ""}
                </p>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-white/[0.06]" />
          <DropdownMenuItem
            onClick={() => router.push("/settings/profile")}
            className="flex items-center gap-2 text-indigo-200/70 focus:text-indigo-200"
          >
            <User className="h-4 w-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push("/settings")}
            className="flex items-center gap-2 text-indigo-200/70 focus:text-indigo-200"
          >
            <Settings className="h-4 w-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-white/[0.06]" />
          <DropdownMenuItem
            onClick={() => signOut()}
            className="flex items-center gap-2 text-red-400/70 focus:bg-red-500/10 focus:text-red-400"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
