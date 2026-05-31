"use client"

import { useEffect, useState } from "react"
import {
  User,
  Moon,
  Sun,
  Mail,
  Shield,
  LogOut,
  Loader2,
  AlertTriangle,
  Check,
  Globe,
  Sparkles,
} from "lucide-react"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import { GlowCard } from "@/components/ui/glow-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate } from "../../../lib/utils"
import { signOut } from "next-auth/react"

interface UserData {
  id: string
  name: string | null
  email: string
  image: string | null
  createdAt: string
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  // Profile form
  const [name, setName] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetchUser()
  }, [])

  async function fetchUser() {
    try {
      setLoading(true)
      const res = await fetch("/api/auth/me")
      if (!res.ok) throw new Error("Failed to fetch user data")
      const data = await res.json()
      setUser(data)
      setName(data.name || "")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveProfile() {
    setSaving(true)
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) throw new Error("Failed to update profile")
      toast.success("Profile updated successfully")
      fetchUser()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <SettingsSkeleton />
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertTriangle className="mb-4 h-12 w-12 text-red-500 animate-bounce" />
        <h2 className="text-xl font-bold text-foreground">Sync Error</h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm">{error}</p>
        <Button className="mt-6 px-5 py-2.5 rounded-xl font-semibold" onClick={fetchUser}>
          Retry Sync
        </Button>
      </div>
    )
  }

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() || "U"

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">System Configurations</h1>
        <p className="text-xs font-medium text-muted-foreground font-medium">Stripe/Notion styled strategic modular preference settings</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        
        {/* Profile Card Section */}
        <GlowCard className="p-6 h-fit" glowSize={350}>
          <div className="flex items-center gap-4 pb-4 border-b border-border/20 mb-6">
            <Avatar className="h-14 w-14 ring-2 ring-primary ring-offset-2 ring-offset-background shadow-md">
              <AvatarImage src={user?.image || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-primary text-sm font-bold text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-sm font-bold text-foreground">{user?.name || "Collaborator Seat"}</h3>
              <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1 mt-0.5">
                <Mail className="h-3 w-3" />
                {user?.email}
              </p>
            </div>
          </div>

          <div className="space-y-5 text-xs font-semibold">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="displayName" className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Display Name</Label>
              <Input
                id="displayName"
                className="bg-secondary/40 border-border/80 rounded-xl h-10 px-3 font-semibold text-xs"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your display name"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email" className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Linked Email Credentials</Label>
              <Input
                id="email"
                className="bg-secondary/20 border-border/40 rounded-xl h-10 px-3 opacity-60 text-xs font-medium cursor-not-allowed"
                value={user?.email || ""}
                disabled
              />
              <p className="text-[9px] text-muted-foreground/60 font-semibold mt-0.5">Credential emails cannot be mutated without database migration.</p>
            </div>
            <Button
              onClick={handleSaveProfile}
              disabled={saving}
              className="bg-primary text-primary-foreground font-semibold hover:-translate-y-0.5 rounded-xl h-10 px-5 transition-all shadow-md shadow-primary/20 flex items-center gap-1.5"
            >
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Commit Changes
            </Button>
          </div>
        </GlowCard>

        {/* Sidebar right preferences column */}
        <div className="space-y-6">
          
          {/* Appearance Glow Accent */}
          <GlowCard className="p-6">
            <div className="flex items-center gap-2 pb-3 border-b border-border/20 mb-4 text-muted-foreground">
              {mounted && theme === "dark" ? (
                <Moon className="h-4.5 w-4.5 text-indigo-400 animate-pulse" />
              ) : (
                <Sun className="h-4.5 w-4.5 text-amber-500 animate-pulse" />
              )}
              <h3 className="text-sm font-bold text-foreground">Theme Configurations</h3>
            </div>
            
            <div className="space-y-3 text-xs font-semibold">
              
              <button
                onClick={() => setTheme("light")}
                className={`flex items-center justify-between w-full rounded-xl border p-3 text-left transition-all ${
                  mounted && theme === "light"
                    ? "bg-primary/5 border-primary/20 text-primary"
                    : "bg-secondary/40 border-border/60 hover:bg-secondary text-muted-foreground"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Sun className="h-4 w-4 text-amber-500" />
                  <div>
                    <p className="font-semibold">Light Workspace</p>
                    <p className="text-[9px] text-muted-foreground/80 font-medium">Use high-end light slate & cool gray theme</p>
                  </div>
                </div>
                {mounted && theme === "light" && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </button>

              <button
                onClick={() => setTheme("dark")}
                className={`flex items-center justify-between w-full rounded-xl border p-3 text-left transition-all ${
                  mounted && theme === "dark"
                    ? "bg-primary/5 border-primary/20 text-primary"
                    : "bg-secondary/40 border-border/60 hover:bg-secondary text-muted-foreground"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Moon className="h-4 w-4 text-indigo-400" />
                  <div>
                    <p className="font-semibold">Dark Workspace</p>
                    <p className="text-[9px] text-muted-foreground/80 font-medium">Use obsidian, graphite, and electric indigo</p>
                  </div>
                </div>
                {mounted && theme === "dark" && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </button>

              <button
                onClick={() => setTheme("system")}
                className={`flex items-center justify-between w-full rounded-xl border p-3 text-left transition-all ${
                  mounted && theme === "system"
                    ? "bg-primary/5 border-primary/20 text-primary"
                    : "bg-secondary/40 border-border/60 hover:bg-secondary text-muted-foreground"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-semibold">System Synchronization</p>
                    <p className="text-[9px] text-muted-foreground/80 font-medium">Automatically track system theme</p>
                  </div>
                </div>
                {mounted && theme === "system" && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </button>

            </div>
          </GlowCard>

          {/* Account and Security Info */}
          <GlowCard className="p-6">
            <div className="flex items-center gap-2 pb-3 border-b border-border/20 mb-4 text-muted-foreground">
              <Shield className="h-4.5 w-4.5 text-emerald-500" />
              <h3 className="text-sm font-bold text-foreground">Compliance parameters</h3>
            </div>
            <div className="space-y-3.5 text-xs font-semibold">
              <div className="flex items-center justify-between rounded-xl bg-secondary/30 px-3.5 py-2.5 border">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Member since</span>
                <span className="font-bold text-foreground">
                  {user?.createdAt ? formatDate(user.createdAt) : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-secondary/30 px-3.5 py-2.5 border">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Seat Tier Level</span>
                <Badge className="bg-primary/10 text-primary border border-primary/20 text-[9px] font-bold rounded py-0 px-2 uppercase tracking-wider">
                  Enterprise
                </Badge>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-secondary/30 px-3.5 py-2.5 border">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Verification status</span>
                <Badge
                  className="border-emerald-500/20 bg-emerald-500/10 text-emerald-500 text-[9px] font-bold rounded py-0 px-2 uppercase tracking-wider"
                >
                  <Check className="mr-0.5 h-3 w-3" />
                  Verified
                </Badge>
              </div>

              <Separator className="my-2 bg-border/20" />

              <Button
                onClick={() => signOut()}
                className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold h-10 rounded-xl transition-all shadow-md shadow-rose-500/10"
              >
                <LogOut className="mr-1.5 h-4 w-4" />
                Terminate Session
              </Button>
            </div>
          </GlowCard>

        </div>
      </div>
    </div>
  )
}

function SettingsSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-8 w-36 rounded-xl" />
        <Skeleton className="mt-2 h-4 w-60 rounded-lg" />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <GlowCard className="min-h-[300px]">
          <Skeleton className="h-6 w-24 rounded-lg" />
          <Skeleton className="mt-6 h-8 w-full rounded-xl" />
          <Skeleton className="mt-4 h-8 w-full rounded-xl" />
        </GlowCard>
        <div className="space-y-6">
          <GlowCard>
            <Skeleton className="h-[200px] w-full rounded-2xl" />
          </GlowCard>
        </div>
      </div>
    </div>
  )
}
