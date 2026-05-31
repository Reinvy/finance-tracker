"use client"

import * as React from "react"
import { Sidebar, SidebarUser } from "./sidebar"
import { Navbar, NavbarUser } from "./navbar"
import { CommandCenter } from "./command-center"
import { AIDrawer } from "./ai-drawer"
import { QuickActionFAB } from "./fab"

interface DashboardShellProps {
  user: (SidebarUser & NavbarUser) | null
  children: React.ReactNode
}

export function DashboardShell({ user, children }: DashboardShellProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const [isCommandCenterOpen, setIsCommandCenterOpen] = React.useState(false)
  const [isAIDrawerOpen, setIsAIDrawerOpen] = React.useState(false)

  // Listen for Cmd+I or Ctrl+I to toggle the AI Assistant directly
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "i" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsAIDrawerOpen((prev) => !prev)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground transition-colors duration-300">
      {/* Sidebar Navigation */}
      <Sidebar
        user={user}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      {/* Main Content Area */}
      <div
        className={`flex flex-1 flex-col transition-all duration-300 ease-in-out ${
          isCollapsed ? "pl-20" : "pl-64"
        }`}
      >
        {/* Top Navbar */}
        <Navbar
          user={user}
          onOpenCommandPalette={() => setIsCommandCenterOpen(true)}
          onOpenAI={() => setIsAIDrawerOpen(true)}
        />

        {/* Page Content Viewport */}
        <main className="relative flex-1 overflow-y-auto px-6 py-8">
          {/* Subtle glowing radial background overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />
          
          {/* Centered maximum width container */}
          <div className="relative z-10 mx-auto max-w-[1600px] w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
            {children}
          </div>
        </main>
      </div>

      {/* Global Interactive Elements */}
      <CommandCenter
        isOpen={isCommandCenterOpen}
        setIsOpen={setIsCommandCenterOpen}
        onOpenAI={() => {
          setIsCommandCenterOpen(false)
          setIsAIDrawerOpen(true)
        }}
      />

      <AIDrawer
        isOpen={isAIDrawerOpen}
        onClose={() => setIsAIDrawerOpen(false)}
      />

      {/* Quick Action FAB */}
      <QuickActionFAB />
    </div>
  )
}
