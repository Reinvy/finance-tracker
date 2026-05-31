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
  Bell,
  Globe,
} from "lucide-react"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate } from "../../../lib/utils"

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
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="mt-2 h-4 w-48" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64 w-full" />
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="mb-4 h-12 w-12 text-red-400" />
        <h2 className="text-xl font-semibold text-foreground">Failed to load settings</h2>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        <Button className="mt-6" onClick={fetchUser}>
          Try again
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Section */}
        <Card className="bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar size="lg">
                <AvatarImage src={user?.image || undefined} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{user?.name || "User"}</CardTitle>
                <CardDescription className="flex items-center gap-1.5">
                  <Mail className="h-3 w-3" />
                  {user?.email}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user?.email || ""}
                disabled
                className="opacity-60"
              />
              <p className="mt-1 text-xs text-muted-foreground">Email cannot be changed</p>
            </div>
            <Button onClick={handleSaveProfile} disabled={saving}>
              {saving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Theme Section */}
          <Card className="bg-card/60 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                {mounted && theme === "dark" ? (
                  <Moon className="h-5 w-5 text-indigo-400" />
                ) : (
                  <Sun className="h-5 w-5 text-amber-400" />
                )}
                <CardTitle className="text-lg">Appearance</CardTitle>
              </div>
              <CardDescription>Customize your theme preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-border/50 p-3 transition-colors hover:bg-muted/30">
                  <div className="flex items-center gap-3">
                    <Sun className="h-4 w-4 text-amber-400" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Light Mode</p>
                      <p className="text-xs text-muted-foreground">Use light theme</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="theme"
                    className="h-4 w-4 accent-indigo-500"
                    checked={mounted && theme === "light"}
                    onChange={() => setTheme("light")}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border/50 p-3 transition-colors hover:bg-muted/30">
                  <div className="flex items-center gap-3">
                    <Moon className="h-4 w-4 text-indigo-400" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Dark Mode</p>
                      <p className="text-xs text-muted-foreground">Use dark theme</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="theme"
                    className="h-4 w-4 accent-indigo-500"
                    checked={mounted && theme === "dark"}
                    onChange={() => setTheme("dark")}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border/50 p-3 transition-colors hover:bg-muted/30">
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">System</p>
                      <p className="text-xs text-muted-foreground">Follow system preference</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="theme"
                    className="h-4 w-4 accent-indigo-500"
                    checked={mounted && theme === "system"}
                    onChange={() => setTheme("system")}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card className="bg-card/60 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-emerald-400" />
                <CardTitle className="text-lg">Account</CardTitle>
              </div>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
                <span className="text-sm text-muted-foreground">Member since</span>
                <span className="text-sm font-medium text-foreground">
                  {user?.createdAt ? formatDate(user.createdAt) : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
                <span className="text-sm text-muted-foreground">Account type</span>
                <Badge variant="secondary" className="text-xs">
                  Free
                </Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
                <span className="text-sm text-muted-foreground">Email verified</span>
                <Badge
                  variant="outline"
                  className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs"
                >
                  <Check className="mr-0.5 h-3 w-3" />
                  Verified
                </Badge>
              </div>

              <Separator className="my-2" />

              <Button
                variant="destructive"
                className="w-full"
                onClick={() => {
                  toast.info("Sign out feature coming soon")
                }}
              >
                <LogOut className="mr-1.5 h-4 w-4" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
