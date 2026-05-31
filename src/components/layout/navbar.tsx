"use client"

import { usePathname, useRouter } from "next/navigation"
import { Search, Bell, ChevronDown, LogOut, User, Settings, Sparkles, Sun, Moon, Menu } from "lucide-react"
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
  onToggleSidebar?: () => void
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

export function Navbar({ user, onOpenCommandPalette, onOpenAI, onToggleSidebar }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const pageTitle = getPageTitle(pathname)
  const { setTheme, theme } = useTheme()

  return (
    <header className="sticky top-0 z-30 flex h-14 md:h-[72px] shrink-0 items-center justify-between px-3 md:px-6 mx-3 md:mx-6 mt-3 md:mt-4 rounded-2xl floating-nav">
      {/* Page title with hamburger toggle on mobile */}
      <div className="flex items-center gap-2 md:gap-3 min-w-0">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/80 bg-secondary/40 text-muted-foreground hover:text-foreground md:hidden shadow-sm"
          >
            <Menu className="h-4 w-4" />
          </button>
        )}
        <div className="hidden sm:block h-2.5 w-2.5 shrink-0 rounded-full bg-primary animate-pulse shadow-sm shadow-primary/40" />
        <h1 className="text-xs md:text-sm font-bold tracking-tight text-foreground min-w-0 truncate">
          {pageTitle}
        </h1>
      </div>

      {/* Action Centers */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Cmd+K Search trigger styled like Raycast */}
        <button
          onClick={onOpenCommandPalette}
          className="relative flex items-center justify-center md:justify-between w-9 md:w-48 xl:w-64 h-9 rounded-xl border border-border/80 bg-secondary/50 hover:bg-secondary hover:border-border/100 px-0 md:px-3 transition-all duration-200"
          title="Search command palette"
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <Search className="h-3.5 w-3.5 stroke-[1.5]" />
            <span className="text-[11px] font-medium tracking-tight hidden md:inline">Search command palette...</span>
          </div>
          <kbd className="hidden xl:inline-flex h-5 select-none items-center gap-0.5 rounded border border-border bg-background px-1.5 font-mono text-[9px] font-bold text-muted-foreground shadow-sm">
            <span>⌘</span><span>K</span>
          </kbd>
        </button>

        {/* AI Assistant shortcut with neon sparkles animation */}
        <button
          onClick={onOpenAI}
          className="relative flex h-9 w-9 md:w-auto gap-1.5 items-center justify-center rounded-xl bg-gradient-to-r from-primary to-pink-500 text-white font-medium text-[11px] px-0 md:px-3 shadow-md shadow-primary/10 hover:shadow-primary/25 transition-all duration-200 hover:-translate-y-0.5"
          title="AI Assistant"
        >
          <Sparkles className="h-3.5 w-3.5 text-pink-200 stroke-[1.5] animate-pulse" />
          <span className="hidden md:inline">AI Command</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/80 bg-secondary/40 text-muted-foreground hover:text-foreground transition-colors icon-premium-hover"
          title="Toggle Theme"
        >
          <Sun className="h-4 w-4 dark:hidden stroke-[1.5]" />
          <Moon className="h-4 w-4 hidden dark:block stroke-[1.5]" />
        </button>

        {/* Notifications bell */}
        <button className="group relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/80 bg-secondary/40 text-muted-foreground hover:text-foreground transition-all duration-200 icon-premium-hover">
          <Bell className="h-4 w-4 stroke-[1.5] transition-transform duration-300 group-hover:rotate-12" />
          <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-rose-500 ring-1 ring-background animate-pulse" />
        </button>

        <div className="h-5 w-[1px] bg-border/80 hidden xs:block" />

        {/* User avatar dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button className="flex shrink-0 items-center gap-2 rounded-xl bg-secondary/40 p-1 md:pr-2.5 border border-border/60 transition-all hover:bg-secondary/60 hover:border-border" />
            }
          >
            <Avatar className="h-7 w-7 ring-1 ring-border">
              <AvatarImage src={user?.image || ""} alt={user?.name || "User"} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-pink-500 text-[10px] font-bold text-white">
                {getInitials(user?.name)}
              </AvatarFallback>
            </Avatar>
            <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground md:block stroke-[1.5]" />
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
                  <AvatarFallback className="bg-gradient-to-br from-primary to-pink-500 text-[10px] font-bold text-white">
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
              className="group flex items-center gap-2 text-muted-foreground focus:text-foreground cursor-pointer text-xs transition-colors"
            >
              <User className="h-4 w-4 stroke-[1.5] group-hover:text-primary transition-colors" />
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push("/settings")}
              className="group flex items-center gap-2 text-muted-foreground focus:text-foreground cursor-pointer text-xs transition-colors"
            >
              <Settings className="h-4 w-4 stroke-[1.5] group-hover:text-primary transition-colors" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut()}
              className="group flex items-center gap-2 text-red-500/80 focus:bg-red-500/10 focus:text-red-500 cursor-pointer text-xs transition-colors"
            >
              <LogOut className="h-4 w-4 stroke-[1.5] group-hover:text-red-500 transition-colors" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
