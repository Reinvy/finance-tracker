"use client"

import * as React from "react"
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
  Sparkles,
  Users,
  Calendar,
  ChevronRight,
  ChevronDown,
  Menu,
  ChevronLeft,
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { signOut } from "next-auth/react"

export interface SidebarUser {
  name?: string | null
  email?: string | null
  image?: string | null
}

interface SidebarProps {
  user: SidebarUser | null
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
}

interface NavigationSection {
  title: string
  items: {
    href: string
    label: string
    icon: React.ComponentType<any>
    description: string
  }[]
}

const sections: NavigationSection[] = [
  {
    title: "Workspace",
    items: [
      { href: "/dashboard", label: "Overview", icon: LayoutDashboard, description: "Executive command center" },
    ],
  },
  {
    title: "Operations",
    items: [
      { href: "/transactions", label: "Transactions", icon: ArrowUpDown, description: "Manage cash flows" },
      { href: "/categories", label: "Categories", icon: Tags, description: "Taxonomy & colors" },
    ],
  },
  {
    title: "Analytics",
    items: [
      { href: "/reports", label: "Intelligence Reports", icon: FileBarChart, description: "Trend summaries & CSV" },
    ],
  },
  {
    title: "People",
    items: [
      { href: "/people", label: "Collaborators", icon: Users, description: "Family & workspace roles" },
    ],
  },
  {
    title: "Finance",
    items: [
      { href: "/wallets", label: "Wallets", icon: Wallet, description: "Liquidity centers" },
      { href: "/budgets", label: "Budgets Tracker", icon: PiggyBank, description: "Target envelopes" },
    ],
  },
  {
    title: "Automation",
    items: [
      { href: "/attendance", label: "Presence Map", icon: Calendar, description: "Geolocation activity timeline" },
    ],
  },
  {
    title: "Settings",
    items: [
      { href: "/settings", label: "Global Settings", icon: Settings, description: "Stripe-style adjustments" },
    ],
  },
]

export function Sidebar({ user, isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname()
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>({
    Workspace: true,
    Operations: true,
    Analytics: true,
    People: false,
    Finance: true,
    Automation: false,
    Settings: false,
  })

  const toggleSection = (title: string) => {
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }))
  }

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
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-full flex-col border-r border-border bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out shadow-premium-3",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Sidebar Header Brand */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-border/80 px-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-650 to-primary shadow-md shadow-indigo-500/10">
            <Sparkles className="h-4.5 w-4.5 text-white" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold leading-tight tracking-tight bg-gradient-to-r from-indigo-550 to-primary bg-clip-text text-transparent">
                Reinvy Portal
              </span>
              <span className="text-[9px] font-semibold tracking-wider text-muted-foreground uppercase">
                Enterprise SaaS v2030
              </span>
            </div>
          )}
        </div>

        {/* Collapse Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/80 bg-background text-muted-foreground hover:text-foreground transition-colors hidden md:flex shadow-sm"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <ScrollArea className="flex-1 py-4">
        <nav className="flex flex-col gap-4 px-3">
          {sections.map((section) => {
            const isOpen = openSections[section.title]
            
            if (isCollapsed) {
              return (
                <div key={section.title} className="flex flex-col items-center gap-1.5 py-1">
                  {section.items.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
                    
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        title={item.label}
                        className={cn(
                          "relative flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                            : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        {isActive && (
                          <span className="absolute right-0 top-1/2 h-4 w-1 -translate-y-1/2 rounded-l-full bg-primary" />
                        )}
                      </Link>
                    )
                  })}
                </div>
              )
            }

            return (
              <div key={section.title} className="flex flex-col gap-1 border-b border-border/10 pb-3 last:border-0 last:pb-0">
                {/* Section Header Toggle */}
                <button
                  onClick={() => toggleSection(section.title)}
                  className="flex items-center justify-between w-full px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors text-left"
                >
                  <span>{section.title}</span>
                  {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                </button>

                {/* Section Sub-items */}
                {isOpen && (
                  <div className="flex flex-col gap-0.5 mt-1 transition-all duration-300">
                    {section.items.map((item) => {
                      const Icon = item.icon
                      const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition-all duration-200 border border-transparent",
                            isActive
                              ? "bg-primary/10 text-primary border-primary/20 font-semibold shadow-premium-1"
                              : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                          )}
                        >
                          <Icon className={cn("h-4 w-4 shrink-0 transition-transform group-hover:scale-105", isActive ? "text-primary" : "text-muted-foreground")} />
                          <div className="flex-1 min-w-0">
                            <p className="truncate leading-none">{item.label}</p>
                            <span className="text-[9px] text-muted-foreground/60 group-hover:text-muted-foreground transition-colors hidden xl:inline truncate mt-0.5 max-w-[150px] overflow-hidden leading-tight">
                              {item.description}
                            </span>
                          </div>
                          {isActive && (
                            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          )}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </ScrollArea>

      {/* User profile section footer */}
      <div className="shrink-0 border-t border-border/80 p-4 bg-sidebar/50">
        <div className={cn(
          "group flex items-center gap-3 rounded-2xl bg-secondary/40 border border-border/50 p-2 transition-all hover:bg-secondary hover:border-border/80",
          isCollapsed ? "justify-center p-1.5" : ""
        )}>
          <Avatar className="h-9 w-9 shrink-0 ring-1 ring-border shadow-sm">
            <AvatarImage src={user?.image || ""} alt={user?.name || "User"} />
            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-primary text-xs font-bold text-white">
              {getInitials(user?.name)}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="truncate text-xs font-semibold text-foreground leading-tight">
                {user?.name || "Guest User"}
              </p>
              <p className="truncate text-[9px] text-muted-foreground leading-tight mt-0.5">
                {user?.email || "Not signed in"}
              </p>
            </div>
          )}
          {!isCollapsed && (
            <button
              onClick={() => signOut()}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors"
              title="Sign out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}
