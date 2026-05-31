"use client"

import { useEffect, useState, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertTriangle,
  AlertCircle,
  Target,
  Sparkles,
} from "lucide-react"
import { toast } from "sonner"
import { GlowCard } from "@/components/ui/glow-card"
import { Button } from "@/components/ui/button"
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
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "../../../lib/utils"

interface BudgetData {
  id: string
  amount: number
  period: string
  startDate: string
  endDate: string | null
  categoryId: string
  category: {
    id: string
    name: string
    icon: string
    color: string
  }
  spentAmount: number
  percentage: number
}

interface Category {
  id: string
  name: string
  type: "INCOME" | "EXPENSE"
  icon: string
  color: string
}

interface BudgetForm {
  amount: string
  period: string
  categoryId: string
}

const emptyForm: BudgetForm = {
  amount: "",
  period: "monthly",
  categoryId: "",
}

export default function BudgetsPage() {
  const searchParams = useSearchParams()
  const [budgets, setBudgets] = useState<BudgetData[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState<BudgetForm>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const fetchBudgets = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/budgets")
      if (!res.ok) throw new Error("Failed to fetch budgets")
      setBudgets(await res.json())
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories")
      if (res.ok) {
        const allCats: Category[] = await res.json()
        setCategories(allCats.filter((c) => c.type === "EXPENSE"))
      }
    } catch {
      // non-fatal
    }
  }, [])

  useEffect(() => {
    Promise.all([fetchBudgets(), fetchCategories()])
  }, [fetchBudgets, fetchCategories])

  useEffect(() => {
    if (searchParams.get("action") === "add-budget") {
      openAddDialog()
      const newUrl = window.location.pathname
      window.history.replaceState({}, "", newUrl)
    }
  }, [searchParams])

  const overBudget = budgets.filter((b) => b.percentage > 100)
  const warningBudget = budgets.filter((b) => b.percentage >= 80 && b.percentage <= 100)

  function openAddDialog() {
    setEditingId(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  function openEditDialog(budget: BudgetData) {
    setEditingId(budget.id)
    setForm({
      amount: String(budget.amount),
      period: budget.period,
      categoryId: budget.categoryId,
    })
    setDialogOpen(true)
  }

  async function handleSubmit() {
    if (!form.amount || !form.categoryId) {
      toast.error("Please fill in all required fields")
      return
    }

    setSubmitting(true)
    try {
      const body = {
        amount: parseFloat(form.amount),
        period: form.period,
        categoryId: form.categoryId,
      }

      const url = editingId ? `/api/budgets/${editingId}` : "/api/budgets"
      const method = editingId ? "PATCH" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to save budget")
      }

      toast.success(editingId ? "Budget updated" : "Budget created")
      setDialogOpen(false)
      fetchBudgets()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this budget?")) return

    try {
      const res = await fetch(`/api/budgets/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      toast.success("Budget deleted")
      fetchBudgets()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An error occurred")
    }
  }

  if (loading) {
    return <BudgetsSkeleton />
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertTriangle className="mb-4 h-12 w-12 text-red-500 animate-bounce" />
        <h2 className="text-xl font-bold text-foreground">Sync Error</h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm">{error}</p>
        <Button className="mt-6 px-5 py-2.5 rounded-xl font-semibold" onClick={fetchBudgets}>
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
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Budget Thresholds</h1>
          <p className="text-xs font-medium text-muted-foreground font-medium">Define strategic spending limits and target parameters</p>
        </div>
        <Button
          onClick={openAddDialog}
          className="rounded-xl px-4 py-2.5 bg-primary text-primary-foreground font-semibold hover:-translate-y-0.5 shadow-md shadow-primary/20 hover:shadow-primary/35 flex items-center gap-1.5 transition-all duration-200"
        >
          <Plus className="h-4 w-4" />
          Add Budget
        </Button>
      </div>

      {/* Compliance / Budget warnings */}
      {overBudget.length > 0 && (
        <div className="space-y-3">
          {overBudget.map((b) => (
            <div
              key={`alert-over-${b.id}`}
              className="flex items-center gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-xs text-foreground shadow-sm"
            >
              <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />
              <span className="font-medium leading-relaxed">
                <strong className="text-rose-500">{b.category.name}</strong> budget exceeded! Spent{" "}
                <span className="font-bold text-rose-500">{formatCurrency(b.spentAmount)}</span> of {formatCurrency(b.amount)} ({b.percentage.toFixed(0)}%).
              </span>
            </div>
          ))}
        </div>
      )}

      {warningBudget.length > 0 && overBudget.length === 0 && (
        <div className="space-y-3">
          {warningBudget.map((b) => (
            <div
              key={`alert-warn-${b.id}`}
              className="flex items-center gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs text-foreground shadow-sm"
            >
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
              <span className="font-medium leading-relaxed">
                <strong className="text-amber-500">{b.category.name}</strong> threshold is nearing capacity. Current spent:{" "}
                <span className="font-bold text-amber-500">{b.percentage.toFixed(0)}%</span>.
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Budgets Grid */}
      {budgets.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <Target className="mb-4 h-12 w-12 text-muted-foreground animate-pulse" />
          <h3 className="text-sm font-bold text-foreground">No limits active</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">Establish budget limits on specific categories to protect your margins.</p>
          <Button className="mt-6 rounded-xl font-semibold" onClick={openAddDialog}>
            <Plus className="mr-1.5 h-4 w-4" />
            Establish Limit
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {budgets.map((budget) => {
            const isOver = budget.percentage > 100
            const isWarning = budget.percentage >= 80 && budget.percentage <= 100
            const progressColor = isOver
              ? "bg-rose-500"
              : isWarning
                ? "bg-amber-500"
                : "bg-primary"

            return (
              <GlowCard
                key={budget.id}
                glowColor={isOver ? "rgba(244, 63, 94, 0.12)" : isWarning ? "rgba(245, 158, 11, 0.12)" : `${budget.category.color}15`}
                glowSize={300}
                className="p-6 relative rounded-2xl"
                style={{ borderColor: isOver ? "rgba(244, 63, 94, 0.2)" : `${budget.category.color}35` }}
              >
                {/* Visual Category Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-lg shadow-sm border border-border/30"
                      style={{ backgroundColor: `${budget.category.color}15`, color: budget.category.color }}
                    >
                      {budget.category.icon}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-foreground leading-tight">{budget.category.name}</h3>
                      <Badge className="bg-secondary/80 text-muted-foreground border border-border/60 text-[8px] font-extrabold uppercase py-0 px-1.5 mt-0.5 tracking-wider">
                        {budget.period}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEditDialog(budget)}
                      className="h-7 w-7 rounded-lg hover:bg-secondary border border-transparent hover:border-border/50 text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(budget.id)}
                      className="h-7 w-7 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 flex items-center justify-center transition-colors border border-transparent hover:border-rose-500/20"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Spent metrics details */}
                <div className="grid grid-cols-2 gap-4 mt-6 border-b border-border/10 pb-4 mb-4 text-xs font-semibold">
                  <div>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Assigned Envelope Cap</span>
                    <p className="text-sm font-bold text-foreground mt-0.5">{formatCurrency(budget.amount)}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Accumulated spent</span>
                    <p className={isOver ? "text-rose-500 text-sm font-bold mt-0.5" : "text-emerald-500 text-sm font-bold mt-0.5"}>
                      {formatCurrency(budget.spentAmount)}
                    </p>
                  </div>
                </div>

                {/* Progress bar container */}
                <div className="space-y-1.5 text-xs font-semibold">
                  <div className="h-2 w-full bg-secondary border border-border/20 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${progressColor} transition-all duration-500 ease-out`}
                      style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[9px]">
                    <span className="text-muted-foreground font-medium">Dynamic Envelope Space</span>
                    <span className={isOver ? "text-rose-500 font-bold" : isWarning ? "text-amber-500 font-bold" : "text-emerald-500 font-bold"}>
                      {budget.percentage.toFixed(0)}% used
                      {isOver && " (Cap Exceeded!)"}
                    </span>
                  </div>
                </div>

                {/* Remaining buffer alerts */}
                {!isOver ? (
                  <div className="mt-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 px-3.5 py-2 text-[10px] font-bold flex items-center justify-between">
                    <span className="text-muted-foreground">Remaining Safe Margin</span>
                    <span className="text-emerald-500">{formatCurrency(budget.amount - budget.spentAmount)}</span>
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl bg-rose-500/5 border border-rose-500/10 px-3.5 py-2 text-[10px] font-bold flex items-center justify-between">
                    <span className="text-rose-500 font-bold">Deficit Margin</span>
                    <span className="text-rose-500">{formatCurrency(budget.spentAmount - budget.amount)}</span>
                  </div>
                )}

              </GlowCard>
            )
          })}
        </div>
      )}

      {/* Add/Edit Budget Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md border border-border bg-popover text-foreground rounded-2xl shadow-premium-4 p-6 overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold tracking-tight uppercase tracking-widest flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              {editingId ? "Modify Budget parameters" : "Establish Budget envelope"}
            </DialogTitle>
            <DialogDescription className="text-[10px] font-medium text-muted-foreground mt-1">
              {editingId ? "Update selected budget cap parameters." : "Define category budget envelope limits."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4 text-xs font-semibold">
            {/* Category selection */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Category Selector</Label>
              <Select
                value={form.categoryId}
                onValueChange={(v) => setForm({ ...form, categoryId: v || "" })}
              >
                <SelectTrigger className="w-full h-10 rounded-xl bg-secondary/40 border-border/80 text-xs">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="border-border bg-popover">
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Amount */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="budgetAmount" className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Budget Amount (IDR)</Label>
              <Input
                id="budgetAmount"
                type="number"
                placeholder="0"
                className="bg-secondary/40 border-border/80 rounded-xl h-10 px-3 font-bold"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </div>

            {/* Period */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Budget Cycle Period</Label>
              <Select
                value={form.period}
                onValueChange={(v) => setForm({ ...form, period: v || "monthly" })}
              >
                <SelectTrigger className="w-full h-10 rounded-xl bg-secondary/40 border-border/80 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border bg-popover">
                  <SelectItem value="weekly">Weekly Cycle</SelectItem>
                  <SelectItem value="monthly">Monthly Cycle</SelectItem>
                  <SelectItem value="yearly">Yearly Cycle</SelectItem>
                </SelectContent>
              </Select>
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
              {editingId ? "Update Limits" : "Create Envelope"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function BudgetsSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-36 rounded-xl" />
          <Skeleton className="mt-2 h-4 w-60 rounded-lg" />
        </div>
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2].map((i) => (
          <GlowCard key={i} className="min-h-[220px]">
            <Skeleton className="h-6 w-24 rounded-lg" />
            <Skeleton className="mt-6 h-4 w-40 rounded" />
            <Skeleton className="mt-6 h-3.5 w-full rounded" />
            <Skeleton className="mt-4 h-8 w-full rounded-xl" />
          </GlowCard>
        ))}
      </div>
    </div>
  )
}
