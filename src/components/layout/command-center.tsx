"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import {
  LayoutDashboard,
  ArrowUpDown,
  Wallet,
  Tags,
  PiggyBank,
  FileBarChart,
  Settings,
  Sparkles,
  Users,
  Calendar,
  PlusCircle,
  Sun,
  Moon,
  Laptop,
  Command,
} from "lucide-react"
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
} from "@/components/ui/command"

interface CommandCenterProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  onOpenAI: () => void
}

export function CommandCenter({ isOpen, setIsOpen, onOpenAI }: CommandCenterProps) {
  const router = useRouter()
  const { setTheme, theme } = useTheme()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsOpen(!isOpen)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [isOpen, setIsOpen])

  const navigate = (href: string) => {
    router.push(href)
    setIsOpen(false)
  }

  const handleAction = (action: () => void) => {
    action()
    setIsOpen(false)
  }

  return (
    <CommandDialog open={isOpen} onOpenChange={setIsOpen} title="Command Center">
      <div className="flex items-center border-b border-border/40 px-3 py-2 bg-muted/20">
        <Command className="h-4 w-4 mr-2 text-muted-foreground" />
        <span className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">Command Palette</span>
        <CommandShortcut className="bg-secondary px-1.5 py-0.5 rounded border text-[9px]">⌘K</CommandShortcut>
      </div>
      <CommandInput placeholder="Type a command or search everything..." />
      <CommandList className="max-h-[300px] p-2">
        <CommandEmpty>No results found.</CommandEmpty>
        
        {/* Navigation Group */}
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => navigate("/dashboard")} className="gap-3">
            <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
            <span>Go to Dashboard</span>
            <CommandShortcut>G + D</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => navigate("/transactions")} className="gap-3">
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            <span>Go to Transactions</span>
            <CommandShortcut>G + T</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => navigate("/wallets")} className="gap-3">
            <Wallet className="h-4 w-4 text-muted-foreground" />
            <span>Go to Wallets</span>
            <CommandShortcut>G + W</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => navigate("/budgets")} className="gap-3">
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
            <span>Go to Budgets</span>
            <CommandShortcut>G + B</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => navigate("/categories")} className="gap-3">
            <Tags className="h-4 w-4 text-muted-foreground" />
            <span>Go to Categories</span>
            <CommandShortcut>G + C</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => navigate("/reports")} className="gap-3">
            <FileBarChart className="h-4 w-4 text-muted-foreground" />
            <span>Go to Reports & Analytics</span>
            <CommandShortcut>G + R</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => navigate("/people")} className="gap-3">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>Go to Collaborators (People)</span>
            <CommandShortcut>G + P</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => navigate("/attendance")} className="gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Go to Activity Map (Attendance)</span>
            <CommandShortcut>G + A</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => navigate("/settings")} className="gap-3">
            <Settings className="h-4 w-4 text-muted-foreground" />
            <span>Go to Settings</span>
            <CommandShortcut>G + S</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator className="my-2" />

        {/* Quick Actions */}
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => handleAction(() => navigate("/transactions?action=add-transaction"))} className="gap-3">
            <PlusCircle className="h-4 w-4 text-emerald-400" />
            <span>Create New Transaction</span>
            <CommandShortcut>⌘N</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => handleAction(onOpenAI)} className="gap-3">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <span>Ask AI Financial Assistant</span>
            <CommandShortcut>⌘I</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator className="my-2" />

        {/* System Settings */}
        <CommandGroup heading="System Preferences">
          <CommandItem onSelect={() => handleAction(() => setTheme("light"))} className="gap-3">
            <Sun className="h-4 w-4 text-amber-500" />
            <span>Switch to Light Theme</span>
          </CommandItem>
          <CommandItem onSelect={() => handleAction(() => setTheme("dark"))} className="gap-3">
            <Moon className="h-4 w-4 text-indigo-400" />
            <span>Switch to Dark Theme</span>
          </CommandItem>
          <CommandItem onSelect={() => handleAction(() => setTheme("system"))} className="gap-3">
            <Laptop className="h-4 w-4 text-muted-foreground" />
            <span>Use System Theme</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
