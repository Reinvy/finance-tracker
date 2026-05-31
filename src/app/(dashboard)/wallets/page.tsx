"use client"

import { useEffect, useState, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import {
  Plus,
  Wallet,
  Pencil,
  Trash2,
  Loader2,
  AlertTriangle,
  Sparkles,
  CreditCard,
  Layers,
} from "lucide-react"
import { toast } from "sonner"
import { GlowCard } from "@/components/ui/glow-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "../../../lib/utils"

interface WalletData {
  id: string
  name: string
  type: string
  icon: string
  color: string
  balance: number
  isActive: boolean
}

interface WalletForm {
  name: string
  type: string
  icon: string
  color: string
  balance: string
}

const emptyForm: WalletForm = {
  name: "",
  type: "cash",
  icon: "wallet",
  color: "#6366f1",
  balance: "0",
}

const ICON_OPTIONS = [
  { value: "wallet", label: "👛 Wallet" },
  { value: "bank", label: "🏦 Bank Vault" },
  { value: "credit-card", label: "💳 Credit Card" },
  { value: "piggy-bank", label: "🐷 Piggy Savings" },
  { value: "building", label: "🏢 Corporate" },
  { value: "coins", label: "🪙 Token Assets" },
  { value: "safe", label: "🔒 Cold Storage" },
  { value: "cash", label: "💵 Physical Cash" },
]

const COLOR_OPTIONS = [
  "#6366f1", "#8b5cf6", "#a855f7", "#d946ef",
  "#ec4899", "#f43f5e", "#ef4444", "#f97316",
  "#eab308", "#22c55e", "#10b981", "#14b8a6",
  "#06b6d4", "#3b82f6", "#2563eb", "#1d4ed8",
]

export default function WalletsPage() {
  const searchParams = useSearchParams()
  const [wallets, setWallets] = useState<WalletData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState<WalletForm>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const fetchWallets = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/wallets")
      if (!res.ok) throw new Error("Failed to fetch wallets")
      setWallets(await res.json())
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWallets()
  }, [fetchWallets])

  useEffect(() => {
    if (searchParams.get("action") === "add-wallet") {
      openAddDialog()
      const newUrl = window.location.pathname
      window.history.replaceState({}, "", newUrl)
    }
  }, [searchParams])

  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0)

  function openAddDialog() {
    setEditingId(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  function openEditDialog(wallet: WalletData) {
    setEditingId(wallet.id)
    setForm({
      name: wallet.name,
      type: wallet.type,
      icon: wallet.icon,
      color: wallet.color,
      balance: String(wallet.balance),
    })
    setDialogOpen(true)
  }

  async function handleSubmit() {
    if (!form.name) {
      toast.error("Please enter a wallet name")
      return
    }

    setSubmitting(true)
    try {
      const body = {
        name: form.name,
        type: form.type,
        icon: form.icon,
        color: form.color,
        balance: parseFloat(form.balance) || 0,
      }

      const url = editingId ? `/api/wallets/${editingId}` : "/api/wallets"
      const method = editingId ? "PATCH" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to save wallet")
      }

      toast.success(editingId ? "Wallet updated" : "Wallet created")
      setDialogOpen(false)
      fetchWallets()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this wallet?")) return

    try {
      const res = await fetch(`/api/wallets/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      toast.success("Wallet deleted")
      fetchWallets()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An error occurred")
    }
  }

  if (loading) {
    return <WalletsSkeleton />
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertTriangle className="mb-4 h-12 w-12 text-red-500 animate-bounce" />
        <h2 className="text-xl font-bold text-foreground">Sync Error</h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm">{error}</p>
        <Button className="mt-6 px-5 py-2.5 rounded-xl font-semibold" onClick={fetchWallets}>
          Retry Sync
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Liquidity Centers</h1>
          <p className="text-xs font-medium text-muted-foreground font-medium">Manage and audit linked corporate or family vaults</p>
        </div>
        <Button
          onClick={openAddDialog}
          className="rounded-xl px-4 py-2.5 bg-primary text-primary-foreground font-semibold hover:-translate-y-0.5 shadow-md shadow-primary/20 hover:shadow-primary/35 flex items-center gap-1.5 transition-all duration-200"
        >
          <Plus className="h-4 w-4" />
          Add Wallet
        </Button>
      </div>

      {/* Net Worth Glass Banner */}
      <GlowCard className="p-6 border-indigo-500/20 bg-indigo-500/5 shadow-premium-3" glowColor="rgba(99, 102, 241, 0.15)">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-indigo-500/20 bg-indigo-550/10 p-2 text-indigo-550 shadow-sm">
              <Layers className="h-5 w-5 text-indigo-500 animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Total Combined Liquidity</p>
              <h2 className="text-3xl font-extrabold text-foreground tracking-tight mt-0.5">{formatCurrency(totalBalance)}</h2>
            </div>
          </div>
          <Badge className="bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 font-bold text-[10px] py-1 px-3.5 rounded-full uppercase tracking-wider">
            {wallets.length} active seat{wallets.length !== 1 ? "s" : ""}
          </Badge>
        </div>
      </GlowCard>

      {/* Wallets grid designed as luxury credit cards */}
      {wallets.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <Wallet className="mb-4 h-12 w-12 text-muted-foreground animate-pulse" />
          <h3 className="text-sm font-bold text-foreground">No vaults connected</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">Establish a premium wallet connector to audit transactions.</p>
          <Button className="mt-6 rounded-xl font-semibold" onClick={openAddDialog}>
            <Plus className="mr-1.5 h-4 w-4" />
            Connect Vault
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {wallets.map((wallet) => (
            <GlowCard
              key={wallet.id}
              glowColor={`${wallet.color}20`}
              glowSize={300}
              className="p-6 relative rounded-2xl overflow-hidden min-h-[180px] flex flex-col justify-between"
              style={{ borderColor: `${wallet.color}35` }}
            >
              {/* Corner Glowing Highlight Accent */}
              <div
                className="absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl opacity-35"
                style={{ backgroundColor: wallet.color }}
              />

              {/* Card Header Info */}
              <div className="flex items-start justify-between z-10">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-lg shadow-sm border border-border/30"
                    style={{ backgroundColor: `${wallet.color}15`, color: wallet.color }}
                  >
                    {getIconEmoji(wallet.icon)}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-foreground leading-tight">{wallet.name}</h3>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5 block">{wallet.type}</span>
                  </div>
                </div>

                <div className="flex gap-1.5">
                  <button
                    onClick={() => openEditDialog(wallet)}
                    className="h-7 w-7 rounded-lg hover:bg-secondary border border-transparent hover:border-border/50 text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(wallet.id)}
                    className="h-7 w-7 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 flex items-center justify-center transition-colors border border-transparent hover:border-rose-500/20"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Decorative credit card SIM chip overlay */}
              <div className="mt-6 flex justify-between items-center z-10 opacity-60">
                <div className="w-8 h-6 rounded bg-gradient-to-br from-amber-400 to-amber-600 border border-amber-500/35 relative overflow-hidden shadow-inner">
                  <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-amber-700/30" />
                  <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-amber-700/30" />
                </div>
                <CreditCard className="h-5 w-5 text-muted-foreground" />
              </div>

              {/* Large Balance Indicator */}
              <div className="mt-6 z-10">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Operational Balance</span>
                <div className="text-2xl font-extrabold tracking-tight mt-0.5" style={{ color: wallet.color }}>
                  {formatCurrency(wallet.balance)}
                </div>
              </div>

            </GlowCard>
          ))}
        </div>
      )}

      {/* Add/Edit Wallet Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md border border-border bg-popover text-foreground rounded-2xl shadow-premium-4 p-6 overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold tracking-tight uppercase tracking-widest flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              {editingId ? "Modify Vault parameters" : "Establish Vault Connector"}
            </DialogTitle>
            <DialogDescription className="text-[10px] font-medium text-muted-foreground mt-1">
              {editingId ? "Update selected vault parameters." : "Connect a new vault source to audit transactions."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4 text-xs font-semibold">
            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="walletName" className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Vault Name</Label>
              <Input
                id="walletName"
                placeholder="e.g. Inbound Operations Vault"
                className="bg-secondary/40 border-border/80 rounded-xl h-10 px-3"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            {/* Type */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Vault Category</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v ?? "cash" })}>
                <SelectTrigger className="w-full h-10 rounded-xl bg-secondary/40 border-border/80 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border bg-popover">
                  <SelectItem value="cash">Physical Cash Ledger</SelectItem>
                  <SelectItem value="bank">Commercial Bank Account</SelectItem>
                  <SelectItem value="credit">Commercial Credit Card</SelectItem>
                  <SelectItem value="savings">Long-Term Savings</SelectItem>
                  <SelectItem value="e-wallet">Electronic E-Wallet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Balance */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="walletBalance" className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Initial Balance (IDR)</Label>
              <Input
                id="walletBalance"
                type="number"
                placeholder="0"
                className="bg-secondary/40 border-border/80 rounded-xl h-10 px-3 font-bold"
                value={form.balance}
                onChange={(e) => setForm({ ...form, balance: e.target.value })}
              />
            </div>

            {/* Icon */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Vault Icon Identifier</Label>
              <Select value={form.icon} onValueChange={(v) => setForm({ ...form, icon: v ?? "" })}>
                <SelectTrigger className="w-full h-10 rounded-xl bg-secondary/40 border-border/80 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border bg-popover">
                  {ICON_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Color accent selection */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Vault Aesthetic Glow Accent</Label>
              <div className="flex flex-wrap gap-2 pt-1.5">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setForm({ ...form, color })}
                    className={`h-7 w-7 rounded-lg ring-2 ring-offset-2 ring-offset-background transition-all hover:scale-110 ${
                      form.color === color ? "ring-foreground scale-110 shadow" : "ring-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2.5">
            <DialogClose render={<Button variant="outline" className="rounded-xl font-bold h-10" />}>
              Cancel
            </DialogClose>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-primary text-primary-foreground font-semibold hover:-translate-y-0.5 rounded-xl h-10 px-5 transition-all shadow-md shadow-primary/20"
            >
              {submitting && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              {editingId ? "Update Parameters" : "Commit Link"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function getIconEmoji(icon: string): string {
  const map: Record<string, string> = {
    wallet: "👛",
    bank: "🏦",
    "credit-card": "💳",
    "piggy-bank": "🐷",
    building: "🏢",
    coins: "🪙",
    safe: "🔒",
    cash: "💵",
  }
  return map[icon] || "👛"
}

function WalletsSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-36 rounded-xl" />
          <Skeleton className="mt-2 h-4 w-60 rounded-lg" />
        </div>
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>
      <Skeleton className="h-24 w-full rounded-2xl" />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <GlowCard key={i} className="min-h-[180px]">
            <Skeleton className="h-6 w-24 rounded-lg" />
            <Skeleton className="mt-6 h-5 w-8 rounded-sm" />
            <Skeleton className="mt-6 h-8 w-40 rounded-xl" />
          </GlowCard>
        ))}
      </div>
    </div>
  )
}
