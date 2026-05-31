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
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b border-zinc-900 bg-black/80 backdrop-blur-xl px-6">
      {/* Page title */}
      <h1 className="text-lg font-bold tracking-tight text-zinc-100 min-w-0 truncate">
        {pageTitle}
      </h1>

      {/* Search */}
      <div className="relative ml-auto max-w-xs flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
        <Input
          placeholder="Search transactions..."
          className="h-9 w-full rounded-xl border-zinc-800 bg-zinc-900/30 pl-9 pr-3 text-sm text-zinc-100 placeholder:text-zinc-600 transition-all focus:border-zinc-500 focus:bg-zinc-900/50 focus:ring-2 focus:ring-zinc-500/10"
        />
      </div>

      {/* Notifications bell */}
      <button className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-zinc-500 transition-all hover:bg-zinc-900 hover:text-zinc-200">
        <Bell className="h-4 w-4" />
        <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-zinc-400 ring-2 ring-black" />
      </button>

      {/* User avatar dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button className="flex shrink-0 items-center gap-2 rounded-xl bg-zinc-900/30 p-1.5 pr-2.5 border border-zinc-900 transition-all hover:bg-zinc-900/50 hover:border-zinc-800" />
          }
        >
          <Avatar className="h-8 w-8 ring-2 ring-zinc-800">
            <AvatarImage src={user?.image || ""} alt={user?.name || "User"} />
            <AvatarFallback className="bg-gradient-to-br from-zinc-100 to-zinc-300 text-[11px] font-bold text-zinc-950">
              {getInitials(user?.name)}
            </AvatarFallback>
          </Avatar>
          <div className="hidden text-left md:block">
            <p className="text-sm font-semibold text-zinc-200 leading-tight">
              {user?.name || "Guest"}
            </p>
            <p className="text-[11px] text-zinc-500 leading-tight">
              {user?.email || "Not signed in"}
            </p>
          </div>
          <ChevronDown className="hidden h-3.5 w-3.5 text-zinc-600 md:block" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="w-56 border border-zinc-850 bg-zinc-950/95 backdrop-blur-2xl shadow-2xl shadow-black ring-1 ring-zinc-800/40"
        >
          <DropdownMenuLabel className="text-zinc-200 font-bold p-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8 ring-2 ring-zinc-800">
                <AvatarImage src={user?.image || ""} alt={user?.name || "User"} />
                <AvatarFallback className="bg-gradient-to-br from-zinc-100 to-zinc-300 text-[11px] font-bold text-zinc-950">
                  {getInitials(user?.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-zinc-200 truncate">
                  {user?.name || "Guest"}
                </p>
                <p className="text-xs text-zinc-500 truncate">
                  {user?.email || ""}
                </p>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-zinc-900" />
          <DropdownMenuItem
            onClick={() => router.push("/settings")}
            className="flex items-center gap-2 text-zinc-400 focus:text-white cursor-pointer"
          >
            <User className="h-4 w-4" />
            Profile Settings
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push("/settings")}
            className="flex items-center gap-2 text-zinc-400 focus:text-white cursor-pointer"
          >
            <Settings className="h-4 w-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-zinc-900" />
          <DropdownMenuItem
            onClick={() => signOut()}
            className="flex items-center gap-2 text-red-500/80 focus:bg-red-950/30 focus:text-red-400 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
