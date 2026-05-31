"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertTriangle,
  AlertCircle,
  Target,
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
import { Progress } from "@/components/ui/progress"
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
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-32" />
            <Skeleton className="mt-2 h-4 w-48" />
          </div>
          <Skeleton className="h-9 w-36" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="mb-4 h-12 w-12 text-red-400" />
        <h2 className="text-xl font-semibold text-foreground">Failed to load budgets</h2>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        <Button className="mt-6" onClick={fetchBudgets}>
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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Budgets</h1>
          <p className="text-sm text-muted-foreground">Set spending limits and track your progress</p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add Budget
        </Button>
      </div>

      {/* Alerts */}
      {overBudget.length > 0 && (
        <div className="space-y-2">
          {overBudget.map((b) => (
            <div
              key={`alert-over-${b.id}`}
              className="flex items-center gap-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300"
            >
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>
                <strong>{b.category.name}</strong> budget exceeded! Spent{" "}
                {formatCurrency(b.spentAmount)} of {formatCurrency(b.amount)} ({b.percentage}%).
              </span>
            </div>
          ))}
        </div>
      )}

      {warningBudget.length > 0 && overBudget.length === 0 && (
        <div className="space-y-2">
          {warningBudget.map((b) => (
            <div
              key={`alert-warn-${b.id}`}
              className="flex items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300"
            >
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <span>
                <strong>{b.category.name}</strong> is at {b.percentage}% of budget.
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Budget Cards */}
      {budgets.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <Target className="mb-3 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-medium text-foreground">No budgets set</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a budget to track your spending limits.
          </p>
          <Button className="mt-4" onClick={openAddDialog}>
            <Plus className="mr-1.5 h-4 w-4" />
            Create Budget
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {budgets.map((budget) => {
            const isOver = budget.percentage > 100
            const isWarning = budget.percentage >= 80 && budget.percentage <= 100
            const progressColor = isOver
              ? "#f43f5e"
              : isWarning
                ? "#f59e0b"
                : budget.category.color || "#6366f1"

            return (
              <Card
                key={budget.id}
                className={`relative overflow-hidden border-0 bg-card/60 backdrop-blur-sm ring-1 transition-all ${
                  isOver ? "ring-rose-500/40" : ""
                }`}
              >
                {/* Color accent */}
                <div
                  className="absolute left-0 top-0 h-full w-1"
                  style={{ backgroundColor: budget.category.color }}
                />

                <CardHeader className="flex flex-row items-start justify-between pb-2 pl-5">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-lg"
                      style={{ backgroundColor: `${budget.category.color}20` }}
                    >
                      <span>{budget.category.icon}</span>
                    </div>
                    <div>
                      <CardTitle className="text-base text-foreground">
                        {budget.category.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1.5 text-xs capitalize">
                        <Badge variant="secondary" className="text-[10px]">
                          {budget.period}
                        </Badge>
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => openEditDialog(budget)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => handleDelete(budget.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="pl-5">
                  {/* Amount */}
                  <div className="mb-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Budget</span>
                      <span className="text-sm font-semibold text-foreground">
                        {formatCurrency(budget.amount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Spent</span>
                      <span
                        className={`text-sm font-semibold ${
                          isOver ? "text-rose-400" : "text-emerald-400"
                        }`}
                      >
                        {formatCurrency(budget.spentAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <Progress
                      value={Math.min(budget.percentage, 100)}
                      color={progressColor}
                      className="h-2.5"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Progress</span>
                      <span
                        className={`text-xs font-medium ${
                          isOver
                            ? "text-rose-400"
                            : isWarning
                              ? "text-amber-400"
                              : "text-emerald-400"
                        }`}
                      >
                        {budget.percentage}%
                        {isOver && " (exceeded!)"}
                      </span>
                    </div>
                  </div>

                  {/* Remaining */}
                  {!isOver && (
                    <div className="mt-3 rounded-lg bg-muted/50 px-3 py-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Remaining</span>
                        <span className="text-sm font-semibold text-emerald-400">
                          {formatCurrency(budget.amount - budget.spentAmount)}
                        </span>
                      </div>
                    </div>
                  )}
                  {isOver && (
                    <div className="mt-3 rounded-lg bg-rose-500/10 px-3 py-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-rose-300">Overspent</span>
                        <span className="text-sm font-semibold text-rose-400">
                          {formatCurrency(budget.spentAmount - budget.amount)}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Add/Edit Budget Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Budget" : "Add Budget"}</DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update your budget limit."
                : "Set a spending limit for a category."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {/* Category */}
            <div>
              <Label>Category</Label>
              <Select
                value={form.categoryId}
                onValueChange={(v) => {
                  if (v) setForm({ ...form, categoryId: v })
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Amount */}
            <div>
              <Label htmlFor="budgetAmount">Budget Amount (IDR)</Label>
              <Input
                id="budgetAmount"
                type="number"
                placeholder="0"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </div>

            {/* Period */}
            <div>
              <Label>Period</Label>
              <Select
                value={form.period}
                onValueChange={(v) => setForm({ ...form, period: (v as string) || "monthly" })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
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
