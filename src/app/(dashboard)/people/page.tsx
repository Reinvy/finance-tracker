"use client"

import * as React from "react"
import { Users, UserPlus, Shield, Sparkles, Send, CheckCircle, TrendingUp, Key, DollarSign } from "lucide-react"
import { GlowCard } from "@/components/ui/glow-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface Teammate {
  id: string
  name: string
  email: string
  role: "OWNER" | "ADMIN" | "EDITOR" | "VIEWER"
  avatar: string
  allowanceUsed: number
  allowanceLimit: number
  status: "ACTIVE" | "PENDING"
}

const mockTeam: Teammate[] = [
  { id: "1", name: "Vectra (You)", email: "vectra@enterprise.com", role: "OWNER", avatar: "V", allowanceUsed: 3420000, allowanceLimit: 10000000, status: "ACTIVE" },
  { id: "2", name: "Sophia Martinez", email: "sophia.m@enterprise.com", role: "ADMIN", avatar: "SM", allowanceUsed: 1850000, allowanceLimit: 5000000, status: "ACTIVE" },
  { id: "3", name: "David Chen", email: "d.chen@enterprise.com", role: "EDITOR", avatar: "DC", allowanceUsed: 920000, allowanceLimit: 2500000, status: "ACTIVE" },
  { id: "4", name: "Clara Watson", email: "clara.w@enterprise.com", role: "VIEWER", avatar: "CW", allowanceUsed: 0, allowanceLimit: 500000, status: "PENDING" },
]

export default function PeoplePage() {
  const [team, setTeam] = React.useState<Teammate[]>(mockTeam)
  const [inviteEmail, setInviteEmail] = React.useState("")
  const [inviteRole, setInviteRole] = React.useState<"ADMIN" | "EDITOR" | "VIEWER">("EDITOR")

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) {
      toast.error("Please enter a valid email address")
      return
    }

    const newTeammate: Teammate = {
      id: Math.random().toString(),
      name: inviteEmail.split("@")[0].split(".").map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(" "),
      email: inviteEmail,
      role: inviteRole,
      avatar: inviteEmail.split("@")[0].substring(0, 2).toUpperCase(),
      allowanceUsed: 0,
      allowanceLimit: inviteRole === "ADMIN" ? 5000000 : inviteRole === "EDITOR" ? 2500000 : 500000,
      status: "PENDING",
    }

    setTeam(prev => [...prev, newTeammate])
    setInviteEmail("")
    toast.success(`Invite sent successfully to ${inviteEmail}!`)
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Collaborators Workspace</h1>
          <p className="text-xs font-medium text-muted-foreground">Manage family or team roles and spending allowances</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        
        {/* Workspace summary metrics */}
        <GlowCard glowColor="rgba(99, 102, 241, 0.12)">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-border/80 bg-secondary/50 p-2.5 text-muted-foreground shadow-sm">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Active Workspace Seats</p>
              <h3 className="text-2xl font-extrabold text-foreground tracking-tight mt-0.5">
                {team.filter(t => t.status === "ACTIVE").length} / 10
              </h3>
            </div>
          </div>
        </GlowCard>

        <GlowCard glowColor="rgba(16, 185, 129, 0.12)">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-2.5 text-emerald-500 shadow-sm">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Role Security Policies</p>
              <h3 className="text-2xl font-extrabold text-emerald-500 tracking-tight mt-0.5">Strict Audit</h3>
            </div>
          </div>
        </GlowCard>

        <GlowCard glowColor="rgba(244, 63, 94, 0.12)">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-rose-500/10 bg-rose-500/5 p-2.5 text-rose-500 shadow-sm">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Allocated Cap Capacity</p>
              <h3 className="text-2xl font-extrabold text-rose-500 tracking-tight mt-0.5">18.0M IDR</h3>
            </div>
          </div>
        </GlowCard>

      </div>

      <div className="grid gap-6 md:grid-cols-3">
        
        {/* Workspace invites control panel */}
        <GlowCard className="md:col-span-1 p-5 h-fit">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-border/20">
            <UserPlus className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold tracking-tight">Add Workspace Seat</h3>
          </div>
          <form onSubmit={handleInvite} className="space-y-4 text-xs font-semibold">
            <div className="flex flex-col gap-1.5">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground">Collaborator Email</Label>
              <Input
                type="email"
                placeholder="partner@family.com"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                className="bg-secondary/40 border-border/80 rounded-xl h-10 px-3"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground">Role Permissions</Label>
              <select
                value={inviteRole}
                onChange={e => setInviteRole(e.target.value as any)}
                className="w-full h-10 rounded-xl bg-secondary/40 hover:bg-secondary border border-border/80 focus:border-primary/40 focus:outline-none px-3 font-semibold text-xs"
              >
                <option value="ADMIN">Administrator (Full Access)</option>
                <option value="EDITOR">Editor (CRUD Ledger entries)</option>
                <option value="VIEWER">Viewer (Read-Only access)</option>
              </select>
            </div>
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground font-semibold hover:-translate-y-0.5 rounded-xl h-10 transition-all shadow-md shadow-primary/20"
            >
              Dispatch Workspace Invitation
            </Button>
          </form>
        </GlowCard>

        {/* Teammates List */}
        <GlowCard className="md:col-span-2 p-6">
          <div className="flex items-center justify-between pb-4 border-b border-border/20 mb-4">
            <h3 className="text-sm font-semibold tracking-tight">Seat Directory</h3>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Strategic Permission Allocation</span>
          </div>

          <div className="divide-y divide-border/20 space-y-4">
            {team.map((t) => {
              const isOwner = t.role === "OWNER"
              const progressPct = t.allowanceLimit > 0 ? (t.allowanceUsed / t.allowanceLimit) * 100 : 0
              
              return (
                <div key={t.id} className="flex flex-col gap-3 pt-4 first:pt-0">
                  <div className="flex items-center justify-between gap-4">
                    
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-650 font-bold text-white shadow-sm">
                        {t.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-semibold text-foreground">{t.name}</p>
                          <Badge className={cn(
                            "text-[8px] font-extrabold uppercase py-0 px-1.5 rounded tracking-wider border",
                            isOwner ? "bg-primary/10 text-primary border-primary/20" :
                            t.role === "ADMIN" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                            t.role === "EDITOR" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                            "bg-secondary text-muted-foreground border-border"
                          )}>
                            {t.role}
                          </Badge>
                        </div>
                        <p className="text-[9px] text-muted-foreground font-medium mt-0.5">{t.email}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      {t.status === "PENDING" ? (
                        <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[9px] font-bold rounded py-0.5 px-2 uppercase tracking-wider">
                          Pending Invite
                        </Badge>
                      ) : (
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] font-bold text-foreground">
                            {progressPct.toFixed(0)}% limit spent
                          </span>
                          <span className="text-[8px] font-bold text-muted-foreground mt-0.5">
                            {(t.allowanceUsed / 1000).toFixed(0)}k / {(t.allowanceLimit / 1000).toFixed(0)}k IDR limit
                          </span>
                        </div>
                      )}
                    </div>

                  </div>

                  {t.status === "ACTIVE" && (
                    <div className="w-full">
                      <Progress
                        value={progressPct}
                        color={progressPct > 90 ? "bg-rose-500" : progressPct > 70 ? "bg-amber-500" : "bg-indigo-500"}
                        className="h-1.5 rounded-full"
                      />
                    </div>
                  )}

                </div>
              )
            })}
          </div>
        </GlowCard>

      </div>

      {/* Activity audit logs timeline */}
      <GlowCard className="p-6">
        <div className="flex items-center justify-between pb-4 border-b border-border/20 mb-4">
          <h3 className="text-sm font-semibold tracking-tight">Collaborators Audit Trail</h3>
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1">
            <CheckCircle className="h-3.5 w-3.5" />
            Compliance Verified
          </span>
        </div>
        <div className="space-y-4 text-xs font-semibold">
          <div className="flex gap-3">
            <span className="text-muted-foreground text-[10px] shrink-0 w-24">Today, 18:24</span>
            <div className="flex h-2 w-2 rounded-full bg-primary mt-1.5 shadow" />
            <div>
              <p className="text-foreground font-bold">Sophia Martinez committed an outbound entry</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Expense allocation of $1,850 for server hosting committed to Bank Vault.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-muted-foreground text-[10px] shrink-0 w-24">Yesterday, 14:10</span>
            <div className="flex h-2 w-2 rounded-full bg-emerald-500 mt-1.5 shadow" />
            <div>
              <p className="text-foreground font-bold">Vectra modified budget envelop allocation</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Allocated Food & Dining cap parameter upgraded from 3M to 5M IDR.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-muted-foreground text-[10px] shrink-0 w-24">May 28, 09:30</span>
            <div className="flex h-2 w-2 rounded-full bg-indigo-500 mt-1.5 shadow" />
            <div>
              <p className="text-foreground font-bold">David Chen linked cash vault</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Linked cash wallet created with 1.2M IDR opening balance.</p>
            </div>
          </div>
        </div>
      </GlowCard>

    </div>
  )
}
