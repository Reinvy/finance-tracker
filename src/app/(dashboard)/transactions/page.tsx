"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertTriangle,
  CalendarIcon,
  X,
  TrendingDown,
  TrendingUp,
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
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency, formatDate } from "../../../lib/utils"
import type { TransactionData } from "../../../types"

interface TransactionWithPagination {
  transactions: TransactionData[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface Category {
  id: string
  name: string
  type: "INCOME" | "EXPENSE"
  icon: string
  color: string
}

interface Wallet {
  id: string
  name: string
  icon: string
  color: string
  balance: number
}

interface TransactionForm {
  amount: string
  type: "INCOME" | "EXPENSE"
  description: string
  date: string
  walletId: string
  categoryId: string
  isRecurring: boolean
  recurringInterval: string
}

const emptyForm: TransactionForm = {
  amount: "",
  type: "EXPENSE",
  description: "",
  date: new Date().toISOString().split("T")[0],
  walletId: "",
  categoryId: "",
  isRecurring: false,
  recurringInterval: "MONTHLY",
}

export default function TransactionsPage() {
  const [data, setData] = useState<TransactionWithPagination | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [walletFilter, setWalletFilter] = useState("")
  const [dateFrom, setDateFrom] = useState<Date | undefined>()
  const [dateTo, setDateTo] = useState<Date | undefined>()

  // Dialog
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState<TransactionForm>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.set("page", String(page))
      params.set("limit", "20")
      if (search) params.set("search", search)
      if (typeFilter) params.set("type", typeFilter)
      if (categoryFilter) params.set("categoryId", categoryFilter)
      if (walletFilter) params.set("walletId", walletFilter)
      if (dateFrom) params.set("from", dateFrom.toISOString())
      if (dateTo) params.set("to", dateTo.toISOString())

      const res = await fetch(`/api/transactions?${params}`)
      if (!res.ok) throw new Error("Failed to fetch transactions")
      const json = await res.json()
      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }, [page, search, typeFilter, categoryFilter, walletFilter, dateFrom, dateTo])

  const fetchMeta = useCallback(async () => {
    try {
      const [catRes, walRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/wallets"),
      ])
      if (catRes.ok) setCategories(await catRes.json())
      if (walRes.ok) setWallets(await walRes.json())
    } catch {
      // non-fatal
    }
  }, [])

  useEffect(() => {
    fetchTransactions()
    fetchMeta()
  }, [fetchTransactions, fetchMeta])

  function resetFilters() {
    setSearch("")
    setTypeFilter("")
    setCategoryFilter("")
    setWalletFilter("")
    setDateFrom(undefined)
    setDateTo(undefined)
    setPage(1)
  }

  function openAddDialog() {
    setEditingId(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  function openEditDialog(tx: TransactionData) {
    setEditingId(tx.id)
    setForm({
      amount: String(tx.amount),
      type: tx.type,
      description: tx.description || "",
      date: new Date(tx.date).toISOString().split("T")[0],
      walletId: tx.wallet.id,
      categoryId: tx.category.id,
      isRecurring: false,
      recurringInterval: "MONTHLY",
    })
    setDialogOpen(true)
  }

  async function handleSubmit() {
    if (!form.amount || !form.walletId || !form.categoryId) {
      toast.error("Please fill in all required fields")
      return
    }

    setSubmitting(true)
    try {
      const body = {
        amount: parseFloat(form.amount),
        type: form.type,
        description: form.description || null,
        date: form.date,
        walletId: form.walletId,
        categoryId: form.categoryId,
        isRecurring: form.isRecurring,
        recurringInterval: form.isRecurring ? form.recurringInterval : undefined,
      }

      const res = await fetch("/api/transactions", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to save transaction")
      }

      toast.success(editingId ? "Transaction updated" : "Transaction created")
      setDialogOpen(false)
      fetchTransactions()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this transaction?")) return

    try {
      const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      toast.success("Transaction deleted")
      fetchTransactions()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An error occurred")
    }
  }

  const hasFilters = search || typeFilter || categoryFilter || walletFilter || dateFrom || dateTo

  // Determine selected category type for filtering
  const expenseCategories = categories.filter((c) => c.type === "EXPENSE")
  const incomeCategories = categories.filter((c) => c.type === "INCOME")
  const allFilteredCategories = typeFilter
    ? categories.filter((c) => c.type === typeFilter)
    : categories

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Transactions</h1>
          <p className="text-sm text-muted-foreground">Manage your income and expenses</p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add Transaction
        </Button>
      </div>

      {/* Filter Bar */}
      <Card className="bg-card/60 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[200px]">
              <Label className="mb-1.5 block text-xs text-muted-foreground">Search</Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  className="pl-8"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                />
              </div>
            </div>

            <div className="w-[130px]">
              <Label className="mb-1.5 block text-xs text-muted-foreground">Type</Label>
              <Select
                value={typeFilter}
                onValueChange={(v) => { setTypeFilter(v ?? ""); setPage(1) }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All types</SelectItem>
                  <SelectItem value="INCOME">Income</SelectItem>
                  <SelectItem value="EXPENSE">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-[150px]">
              <Label className="mb-1.5 block text-xs text-muted-foreground">Category</Label>
              <Select
                value={categoryFilter}
                onValueChange={(v) => { setCategoryFilter(v ?? ""); setPage(1) }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All categories</SelectItem>
                  {allFilteredCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-[140px]">
              <Label className="mb-1.5 block text-xs text-muted-foreground">Wallet</Label>
              <Select
                value={walletFilter}
                onValueChange={(v) => { setWalletFilter(v ?? ""); setPage(1) }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All wallets" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All wallets</SelectItem>
                  {wallets.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.icon} {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-[150px]">
              <Label className="mb-1.5 block text-xs text-muted-foreground">From</Label>
              <Popover>
                <PopoverTrigger render={<Button variant="outline" className="w-full justify-start text-left font-normal" />}>
                  <CalendarIcon className="mr-1 h-4 w-4" />
                  {dateFrom ? formatDate(dateFrom) : "Pick date"}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={(d) => { setDateFrom(d); setPage(1) }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="w-[150px]">
              <Label className="mb-1.5 block text-xs text-muted-foreground">To</Label>
              <Popover>
                <PopoverTrigger render={<Button variant="outline" className="w-full justify-start text-left font-normal" />}>
                  <CalendarIcon className="mr-1 h-4 w-4" />
                  {dateTo ? formatDate(dateTo) : "Pick date"}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={(d) => { setDateTo(d); setPage(1) }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8">
                <X className="mr-1 h-3 w-3" />
                Clear filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card className="bg-card/60 backdrop-blur-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-3 p-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center py-12 text-center">
              <AlertTriangle className="mb-3 h-8 w-8 text-red-400" />
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={fetchTransactions}>
                Retry
              </Button>
            </div>
          ) : !data || data.transactions.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <p className="text-sm text-muted-foreground">No transactions found</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={openAddDialog}>
                Add your first transaction
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Wallet</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="w-[80px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-medium">
                        {tx.description || tx.category.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <span>{tx.category.icon}</span>
                          <span className="text-sm">{tx.category.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <span>{tx.wallet.icon}</span>
                          <span className="text-sm">{tx.wallet.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(tx.date)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={tx.type === "INCOME" ? "default" : "destructive"}
                          className={
                            tx.type === "INCOME"
                              ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                              : ""
                          }
                        >
                          {tx.type === "INCOME" ? "Income" : "Expense"}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className={`text-right font-semibold ${
                          tx.type === "INCOME" ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {tx.type === "INCOME" ? "+" : "-"}
                        {formatCurrency(tx.amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => openEditDialog(tx)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => handleDelete(tx.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {data.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between border-t px-4 py-3">
                  <p className="text-sm text-muted-foreground">
                    Showing {(data.pagination.page - 1) * data.pagination.limit + 1}–
                    {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of{" "}
                    {data.pagination.total}
                  </p>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon-sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {Array.from({ length: data.pagination.totalPages }, (_, i) => i + 1).map(
                      (p) => (
                        <Button
                          key={p}
                          variant={p === page ? "default" : "outline"}
                          size="icon-sm"
                          onClick={() => setPage(p)}
                          className={p === page ? "" : ""}
                        >
                          {p}
                        </Button>
                      )
                    )}
                    <Button
                      variant="outline"
                      size="icon-sm"
                      disabled={page >= data.pagination.totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Transaction Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Transaction" : "Add Transaction"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Update the transaction details below." : "Fill in the details to add a new transaction."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {/* Type */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={form.type === "EXPENSE" ? "destructive" : "outline"}
                onClick={() => setForm({ ...form, type: "EXPENSE" })}
                className={form.type === "EXPENSE" ? "ring-1 ring-rose-500/50" : ""}
              >
                <TrendingDown className="mr-1.5 h-4 w-4" />
                Expense
              </Button>
              <Button
                type="button"
                variant={form.type === "INCOME" ? "default" : "outline"}
                onClick={() => setForm({ ...form, type: "INCOME" })}
                className={form.type === "INCOME" ? "bg-emerald-600 hover:bg-emerald-700 ring-1 ring-emerald-500/50" : ""}
              >
                <TrendingUp className="mr-1.5 h-4 w-4" />
                Income
              </Button>
            </div>

            {/* Amount */}
            <div>
              <Label htmlFor="amount">Amount (IDR)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="e.g. Grocery shopping"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            {/* Date */}
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>

            {/* Wallet */}
            <div>
              <Label>Wallet</Label>
              <Select
                value={form.walletId}
                onValueChange={(v) => {
                  const val = v as string
                  setForm({ ...form, walletId: val })
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select wallet" />
                </SelectTrigger>
                <SelectContent>
                  {wallets.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.icon} {w.name} ({formatCurrency(w.balance)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category */}
            <div>
              <Label>Category</Label>
              <Select
                value={form.categoryId}
                onValueChange={(v) => {
                  const val = v as string
                  setForm({ ...form, categoryId: val })
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {(form.type === "INCOME" ? incomeCategories : expenseCategories).map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Recurring toggle */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isRecurring"
                checked={form.isRecurring}
                onChange={(e) => setForm({ ...form, isRecurring: e.target.checked })}
                className="h-4 w-4 rounded border-border bg-transparent"
              />
              <Label htmlFor="isRecurring" className="text-sm font-normal">
                Recurring transaction
              </Label>
            </div>

            {form.isRecurring && (
              <div>
                <Label>Interval</Label>
                <Select
                  value={form.recurringInterval}
                  onValueChange={(v) => {
                    const val = v as string
                    setForm({ ...form, recurringInterval: val })
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DAILY">Daily</SelectItem>
                    <SelectItem value="WEEKLY">Weekly</SelectItem>
                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                    <SelectItem value="YEARLY">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
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


