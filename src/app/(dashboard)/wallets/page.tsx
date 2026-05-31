"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Plus,
  Wallet,
  Pencil,
  Trash2,
  Loader2,
  AlertTriangle,
  CreditCard,
  Landmark,
  PiggyBank,
} from "lucide-react"
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
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
  { value: "bank", label: "🏦 Bank" },
  { value: "credit-card", label: "💳 Credit Card" },
  { value: "piggy-bank", label: "🐷 Piggy Bank" },
  { value: "building", label: "🏢 Building" },
  { value: "coins", label: "🪙 Coins" },
  { value: "safe", label: "🔒 Safe" },
  { value: "cash", label: "💵 Cash" },
]

const COLOR_OPTIONS = [
  "#6366f1", "#8b5cf6", "#a855f7", "#d946ef",
  "#ec4899", "#f43f5e", "#ef4444", "#f97316",
  "#eab308", "#22c55e", "#10b981", "#14b8a6",
  "#06b6d4", "#3b82f6", "#2563eb", "#1d4ed8",
]

export default function WalletsPage() {
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
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-32" />
            <Skeleton className="mt-2 h-4 w-48" />
          </div>
          <Skeleton className="h-9 w-36" />
        </div>
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="mb-4 h-12 w-12 text-red-400" />
        <h2 className="text-xl font-semibold text-foreground">Failed to load wallets</h2>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        <Button className="mt-6" onClick={fetchWallets}>
          Try again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Wallets</h1>
          <p className="text-sm text-muted-foreground">Manage your financial accounts</p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add Wallet
        </Button>
      </div>

      {/* Total Balance Summary */}
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-indigo-600/20 via-indigo-500/10 to-transparent ring-1 ring-indigo-500/30">
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-indigo-500/20 blur-3xl" />
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-indigo-200">Total Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-indigo-50">{formatCurrency(totalBalance)}</div>
          <p className="mt-1 text-xs text-indigo-300/70">{wallets.length} wallet{wallets.length !== 1 ? "s" : ""}</p>
        </CardContent>
      </Card>

      {/* Wallet Cards */}
      {wallets.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <Wallet className="mb-3 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-medium text-foreground">No wallets yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Create your first wallet to start tracking finances.</p>
          <Button className="mt-4" onClick={openAddDialog}>
            <Plus className="mr-1.5 h-4 w-4" />
            Create Wallet
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {wallets.map((wallet) => (
            <Card
              key={wallet.id}
              className="relative overflow-hidden border-0 bg-card/60 backdrop-blur-sm ring-1"
              style={{ "--tw-ring-color": `${wallet.color}40` } as React.CSSProperties}
            >
              {/* Color accent bar */}
              <div
                className="absolute left-0 top-0 h-full w-1"
                style={{ backgroundColor: wallet.color }}
              />
              {/* Glow */}
              <div
                className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full blur-2xl"
                style={{ backgroundColor: `${wallet.color}15` }}
              />

              <CardHeader className="flex flex-row items-start justify-between pb-2 pl-5">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-lg"
                    style={{ backgroundColor: `${wallet.color}20` }}
                  >
                    <span>{getIconEmoji(wallet.icon)}</span>
                  </div>
                  <div>
                    <CardTitle className="text-base text-foreground">{wallet.name}</CardTitle>
                    <CardDescription className="text-xs capitalize">{wallet.type}</CardDescription>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => openEditDialog(wallet)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => handleDelete(wallet.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pl-5">
                <div className="text-2xl font-bold" style={{ color: wallet.color }}>
                  {formatCurrency(wallet.balance)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Wallet Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Wallet" : "Add Wallet"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Update your wallet details." : "Create a new wallet to track your money."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {/* Name */}
            <div>
              <Label htmlFor="walletName">Wallet Name</Label>
              <Input
                id="walletName"
                placeholder="e.g. Main Account"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            {/* Type */}
            <div>
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v ?? "cash" })}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank">Bank Account</SelectItem>
                  <SelectItem value="credit">Credit Card</SelectItem>
                  <SelectItem value="savings">Savings</SelectItem>
                  <SelectItem value="e-wallet">E-Wallet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Balance */}
            <div>
              <Label htmlFor="walletBalance">Initial Balance (IDR)</Label>
              <Input
                id="walletBalance"
                type="number"
                placeholder="0"
                value={form.balance}
                onChange={(e) => setForm({ ...form, balance: e.target.value })}
              />
            </div>

            {/* Icon */}
            <div>
              <Label>Icon</Label>
              <Select value={form.icon} onValueChange={(v) => setForm({ ...form, icon: v ?? "" })}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ICON_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Color */}
            <div>
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setForm({ ...form, color })}
                    className={`h-8 w-8 rounded-lg ring-2 ring-offset-2 ring-offset-background transition-all hover:scale-110 ${
                      form.color === color ? "ring-foreground scale-110" : "ring-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              {editingId ? "Update" : "Create"}
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
