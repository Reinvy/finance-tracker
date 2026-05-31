"use client"

import { usePathname, useRouter } from "next/navigation"
import { Search, Bell, ChevronDown, LogOut, User, Settings, Sparkles, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"
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
import { Button } from "@/components/ui/button"

export interface NavbarUser {
  name?: string | null
  email?: string | null
  image?: string | null
}

interface NavbarProps {
  user: NavbarUser | null
  onOpenCommandPalette: () => void
  onOpenAI: () => void
}

const pageTitles: Record<string, string> = {
  "/dashboard": "Executive Command Center",
  "/transactions": "Operations Ledger",
  "/wallets": "Liquidity Centers",
  "/categories": "Taxonomy Categories",
  "/budgets": "Budget Thresholds",
  "/reports": "Intelligence Hub",
  "/settings": "Modular System settings",
  "/people": "Collaborators Workspace",
  "/attendance": "Transaction Presence Map",
}

function getPageTitle(pathname: string): string {
  if (pathname === "/dashboard") return "Executive Command Center"
  const base = "/" + (pathname.split("/")[1] || "")
  return pageTitles[base] || "Operations Center"
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

export function Navbar({ user, onOpenCommandPalette, onOpenAI }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const pageTitle = getPageTitle(pathname)
  const { setTheme, theme } = useTheme()

  return (
    <header className="sticky top-0 z-30 flex h-[72px] shrink-0 items-center justify-between px-6 mx-6 mt-4 rounded-2xl floating-nav">
      {/* Page title with glow indicator */}
      <div className="flex items-center gap-3">
        <div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse shadow-sm shadow-primary/40" />
        <h1 className="text-sm font-bold tracking-tight text-foreground min-w-0 truncate">
          {pageTitle}
        </h1>
      </div>

      {/* Action Centers */}
      <div className="flex items-center gap-3">
        {/* Cmd+K Search trigger styled like Raycast */}
        <button
          onClick={onOpenCommandPalette}
          className="relative flex items-center justify-between w-48 xl:w-64 h-9 rounded-xl border border-border/80 bg-secondary/50 hover:bg-secondary hover:border-border/100 px-3 transition-all duration-200"
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <Search className="h-3.5 w-3.5" />
            <span className="text-[11px] font-medium tracking-tight">Search command palette...</span>
          </div>
          <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-0.5 rounded border border-border bg-background px-1.5 font-mono text-[9px] font-bold text-muted-foreground shadow-sm">
            <span>⌘</span><span>K</span>
          </kbd>
        </button>

        {/* AI Assistant shortcut with neon sparkles animation */}
        <button
          onClick={onOpenAI}
          className="relative flex h-9 gap-1.5 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-650 text-white font-medium text-[11px] px-3 shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/25 transition-all duration-200 hover:-translate-y-0.5"
        >
          <Sparkles className="h-3.5 w-3.5 text-indigo-200 animate-pulse" />
          <span className="hidden md:inline">AI Command</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/80 bg-secondary/40 text-muted-foreground hover:text-foreground transition-colors"
          title="Toggle Theme"
        >
          <Sun className="h-4 w-4 dark:hidden" />
          <Moon className="h-4 w-4 hidden dark:block" />
        </button>

        {/* Notifications bell */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border/80 bg-secondary/40 text-muted-foreground hover:text-foreground transition-all duration-200">
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-background" />
        </button>

        <div className="h-5 w-[1px] bg-border/80" />

        {/* User avatar dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button className="flex shrink-0 items-center gap-2 rounded-xl bg-secondary/40 p-1 pr-2.5 border border-border/60 transition-all hover:bg-secondary/60 hover:border-border" />
            }
          >
            <Avatar className="h-7 w-7 ring-1 ring-border">
              <AvatarImage src={user?.image || ""} alt={user?.name || "User"} />
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-primary text-[10px] font-bold text-white">
                {getInitials(user?.name)}
              </AvatarFallback>
            </Avatar>
            <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground md:block" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="w-56 border border-border bg-popover shadow-premium-4"
          >
            <DropdownMenuLabel className="text-foreground font-bold p-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8 ring-1 ring-border">
                  <AvatarImage src={user?.image || ""} alt={user?.name || "User"} />
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-primary text-[10px] font-bold text-white">
                    {getInitials(user?.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">
                    {user?.name || "Guest"}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate leading-tight mt-0.5">
                    {user?.email || ""}
                  </p>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => router.push("/settings")}
              className="flex items-center gap-2 text-muted-foreground focus:text-foreground cursor-pointer text-xs"
            >
              <User className="h-4 w-4" />
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push("/settings")}
              className="flex items-center gap-2 text-muted-foreground focus:text-foreground cursor-pointer text-xs"
            >
              <Settings className="h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut()}
              className="flex items-center gap-2 text-red-500/80 focus:bg-red-500/10 focus:text-red-500 cursor-pointer text-xs"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
