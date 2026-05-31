"use client"

import { useEffect, useState, useCallback } from "react"
import { useSearchParams } from "next/navigation"
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
  Sparkles,
  SlidersHorizontal,
} from "lucide-react"
import { toast } from "sonner"
import { GlowCard } from "@/components/ui/glow-card"
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
  const searchParams = useSearchParams()
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

  useEffect(() => {
    if (searchParams.get("action") === "add-transaction") {
      openAddDialog()
      const newUrl = window.location.pathname
      window.history.replaceState({}, "", newUrl)
    }
  }, [searchParams])

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
      isRecurring: (tx as any).isRecurring || false,
      recurringInterval: (tx as any).recurringInterval || "MONTHLY",
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
        body: JSON.stringify(editingId ? { ...body, id: editingId } : body),
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
  const expenseCategories = categories.filter((c) => c.type === "EXPENSE")
  const incomeCategories = categories.filter((c) => c.type === "INCOME")
  const allFilteredCategories = typeFilter
    ? categories.filter((c) => c.type === typeFilter)
    : categories

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Operations Ledger</h1>
          <p className="text-xs font-medium text-muted-foreground font-medium">Strategic ledger of operations and cash movements</p>
        </div>
        <Button
          onClick={openAddDialog}
          className="rounded-xl px-4 py-2.5 bg-primary text-primary-foreground font-semibold hover:-translate-y-0.5 shadow-md shadow-primary/20 hover:shadow-primary/35 flex items-center gap-1.5 transition-all duration-200"
        >
          <Plus className="h-4 w-4" />
          Add Transaction
        </Button>
      </div>

      {/* Control Panel Filter bar */}
      <GlowCard className="p-5" glowSize={300}>
        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-border/20 text-muted-foreground">
          <SlidersHorizontal className="h-4 w-4" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-foreground">Advanced Query Filters</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 items-end">
          
          <div className="sm:col-span-2">
            <Label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Search</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search description..."
                className="pl-9 pr-3 py-1.5 text-xs h-9 bg-secondary/40 border-border/80 rounded-xl"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              />
            </div>
          </div>

          <div>
            <Label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Type</Label>
            <Select
              value={typeFilter}
              onValueChange={(v) => { setTypeFilter(v === "ALL" || !v ? "" : v); setPage(1) }}
            >
              <SelectTrigger className="w-full text-xs h-9 rounded-xl bg-secondary/40 border-border/85">
                <SelectValue placeholder="All flows" />
              </SelectTrigger>
              <SelectContent className="border-border">
                <SelectItem value="ALL">All flows</SelectItem>
                <SelectItem value="INCOME">Inbound</SelectItem>
                <SelectItem value="EXPENSE">Outbound</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Category</Label>
            <Select
              value={categoryFilter}
              onValueChange={(v) => { setCategoryFilter(v === "ALL" || !v ? "" : v); setPage(1) }}
            >
              <SelectTrigger className="w-full text-xs h-9 rounded-xl bg-secondary/40 border-border/85">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent className="border-border">
                <SelectItem value="ALL">All categories</SelectItem>
                {allFilteredCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Vault Wallet</Label>
            <Select
              value={walletFilter}
              onValueChange={(v) => { setWalletFilter(v === "ALL" || !v ? "" : v); setPage(1) }}
            >
              <SelectTrigger className="w-full text-xs h-9 rounded-xl bg-secondary/40 border-border/85">
                <SelectValue placeholder="All wallets" />
              </SelectTrigger>
              <SelectContent className="border-border">
                <SelectItem value="ALL">All wallets</SelectItem>
                {wallets.map((w) => (
                  <SelectItem key={w.id} value={w.id}>
                    {w.icon} {w.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger render={<Button variant="outline" className="text-xs h-9 w-full justify-start font-medium bg-secondary/40 rounded-xl" />}>
                <CalendarIcon className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                {dateFrom ? formatDate(dateFrom) : "From"}
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 border-border shadow-premium-4 bg-popover">
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={(d) => { setDateFrom(d); setPage(1) }}
                />
              </PopoverContent>
            </Popover>
          </div>

        </div>

        {hasFilters && (
          <div className="flex justify-end mt-4 pt-3 border-t border-border/10">
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-[11px] font-bold text-rose-500 hover:bg-rose-500/10 rounded-lg h-8 py-1 px-3"
            >
              <X className="mr-1 h-3.5 w-3.5" />
              Clear query filters
            </Button>
          </div>
        )}
      </GlowCard>

      {/* Airtable-like Operations Table */}
      <GlowCard className="p-0 overflow-hidden">
        {loading ? (
          <div className="space-y-3 p-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-11 w-full rounded-lg" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center py-16 text-center">
            <AlertTriangle className="mb-3 h-10 w-10 text-red-500 animate-bounce" />
            <p className="text-sm font-semibold text-foreground">Sync Failure</p>
            <p className="text-xs text-muted-foreground mt-1">{error}</p>
            <Button variant="outline" size="sm" className="mt-4 rounded-xl px-4 py-2 text-xs" onClick={fetchTransactions}>
              Retry Query
            </Button>
          </div>
        ) : !data || data.transactions.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <Sparkles className="mb-3 h-10 w-10 text-indigo-400 animate-pulse" />
            <p className="text-sm font-bold text-foreground">Ledger is Empty</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">No transaction matches identified for your query parameter.</p>
            <Button variant="outline" size="sm" className="mt-4 rounded-xl px-4 py-2 text-xs" onClick={openAddDialog}>
              Create Entry
            </Button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table className="text-xs">
                <TableHeader className="bg-secondary/40 border-b border-border/40">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-bold uppercase tracking-wider text-muted-foreground py-3.5 px-6">Description</TableHead>
                    <TableHead className="font-bold uppercase tracking-wider text-muted-foreground py-3.5">Category</TableHead>
                    <TableHead className="font-bold uppercase tracking-wider text-muted-foreground py-3.5">Linked Vault</TableHead>
                    <TableHead className="font-bold uppercase tracking-wider text-muted-foreground py-3.5">Date</TableHead>
                    <TableHead className="font-bold uppercase tracking-wider text-muted-foreground py-3.5">Recurring</TableHead>
                    <TableHead className="font-bold uppercase tracking-wider text-muted-foreground py-3.5 text-right">Flow Value</TableHead>
                    <TableHead className="w-[100px] font-bold uppercase tracking-wider text-muted-foreground text-right py-3.5 px-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-border/20">
                  {data.transactions.map((tx) => (
                    <TableRow key={tx.id} className="hover:bg-secondary/20 transition-all duration-200">
                      <TableCell className="font-semibold text-foreground py-3.5 px-6">
                        {tx.description || tx.category.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-secondary border border-border/30 text-sm shadow-sm">{tx.category.icon}</span>
                          <span className="font-medium text-foreground">{tx.category.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{tx.wallet.icon}</span>
                          <span className="font-semibold text-muted-foreground text-[11px] bg-secondary/50 px-2 py-0.5 rounded-md border">{tx.wallet.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground font-medium">
                        {formatDate(tx.date)}
                      </TableCell>
                      <TableCell>
                        {(tx as any).isRecurring ? (
                          <Badge className="bg-indigo-500/10 text-primary hover:bg-indigo-500/15 text-[9px] font-bold py-0.5 px-1.5 border border-indigo-500/20 rounded">
                            {(tx as any).recurringInterval || "MONTHLY"}
                          </Badge>
                        ) : (
                          <span className="text-[10px] text-muted-foreground font-bold">—</span>
                        )}
                      </TableCell>
                      <TableCell
                        className={`text-right font-extrabold text-[13px] ${
                          tx.type === "INCOME" ? "text-emerald-500" : "text-rose-500"
                        }`}
                      >
                        {tx.type === "INCOME" ? "+" : "-"}
                        {formatCurrency(tx.amount)}
                      </TableCell>
                      <TableCell className="text-right py-3.5 px-6">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => openEditDialog(tx)}
                            className="h-7 w-7 rounded-lg hover:bg-secondary border border-transparent hover:border-border/40"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => handleDelete(tx.id)}
                            className="h-7 w-7 rounded-lg hover:bg-rose-500/10 text-rose-500 hover:text-rose-400 border border-transparent hover:border-rose-500/20"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            {data.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-border/30 px-6 py-4 bg-secondary/10">
                <p className="text-[10px] font-semibold text-muted-foreground">
                  Showing {(data.pagination.page - 1) * data.pagination.limit + 1}–
                  {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of{" "}
                  {data.pagination.total} entries
                </p>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="icon-sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="h-8 w-8 rounded-lg bg-background"
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
                        className={`h-8 w-8 rounded-lg font-bold text-xs ${
                          p === page ? "bg-primary text-primary-foreground shadow" : "bg-background"
                        }`}
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
                    className="h-8 w-8 rounded-lg bg-background"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </GlowCard>

      {/* dialog styled premium */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md border border-border bg-popover text-foreground rounded-2xl shadow-premium-4 p-6 overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold tracking-tight text-foreground uppercase tracking-widest flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              {editingId ? "Modify Operation Parameter" : "Create Operation Parameter"}
            </DialogTitle>
            <DialogDescription className="text-[10px] font-medium text-muted-foreground mt-1">
              {editingId ? "Update existing financial ledger parameters." : "Define inbound/outbound financial ledger details."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4 text-xs font-semibold">
            {/* Flow Type selector */}
            <div className="grid grid-cols-2 gap-2.5">
              <Button
                type="button"
                variant={form.type === "EXPENSE" ? "destructive" : "outline"}
                onClick={() => setForm({ ...form, type: "EXPENSE" })}
                className={`rounded-xl h-10 font-bold ${
                  form.type === "EXPENSE" ? "bg-rose-500 hover:bg-rose-650 shadow" : "border-border/80"
                }`}
              >
                <TrendingDown className="mr-1.5 h-4 w-4" />
                Outbound (Expense)
              </Button>
              <Button
                type="button"
                variant={form.type === "INCOME" ? "default" : "outline"}
                onClick={() => setForm({ ...form, type: "INCOME" })}
                className={`rounded-xl h-10 font-bold ${
                  form.type === "INCOME" ? "bg-primary hover:bg-indigo-650 shadow" : "border-border/80"
                }`}
              >
                <TrendingUp className="mr-1.5 h-4 w-4" />
                Inbound (Income)
              </Button>
            </div>

            {/* Amount */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="amount" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Amount (IDR)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0"
                className="bg-secondary/40 border-border/80 rounded-xl h-10 px-3 py-1.5 font-bold"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="description" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Description</Label>
              <Input
                id="description"
                placeholder="e.g. Server hosting fee"
                className="bg-secondary/40 border-border/80 rounded-xl h-10 px-3 py-1.5"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            {/* Date */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="date" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Operation Date</Label>
              <Input
                id="date"
                type="date"
                className="bg-secondary/40 border-border/80 rounded-xl h-10 px-3 py-1.5 font-medium"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>

            {/* Wallet Vault */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Linked Vault Wallet</Label>
              <Select
                value={form.walletId}
                onValueChange={(v) => setForm({ ...form, walletId: v || "" })}
              >
                <SelectTrigger className="w-full h-10 rounded-xl bg-secondary/40 border-border/80 text-xs">
                  <SelectValue placeholder="Select wallet" />
                </SelectTrigger>
                <SelectContent className="border-border bg-popover">
                  {wallets.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.icon} {w.name} ({formatCurrency(w.balance)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category Taxonomy */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Category Taxonomy</Label>
              <Select
                value={form.categoryId}
                onValueChange={(v) => setForm({ ...form, categoryId: v || "" })}
              >
                <SelectTrigger className="w-full h-10 rounded-xl bg-secondary/40 border-border/80 text-xs">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="border-border bg-popover">
                  {(form.type === "INCOME" ? incomeCategories : expenseCategories).map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Recurring parameters */}
            <div className="flex items-center gap-2.5 py-1">
              <input
                type="checkbox"
                id="isRecurring"
                checked={form.isRecurring}
                onChange={(e) => setForm({ ...form, isRecurring: e.target.checked })}
                className="h-4 w-4 rounded-lg border-border bg-secondary/60 focus:ring-primary/20 accent-primary text-primary transition-all cursor-pointer"
              />
              <Label htmlFor="isRecurring" className="text-[11px] font-semibold text-foreground select-none cursor-pointer">
                Recurring automated calendar rule
              </Label>
            </div>

            {form.isRecurring && (
              <div className="flex flex-col gap-1.5 animate-in slide-in-from-top-1.5 duration-200">
                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Automated Interval</Label>
                <Select
                  value={form.recurringInterval}
                  onValueChange={(v) => setForm({ ...form, recurringInterval: v || "" })}
                >
                  <SelectTrigger className="w-full h-10 rounded-xl bg-secondary/40 border-border/80 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-border bg-popover">
                    <SelectItem value="DAILY">Daily Flow</SelectItem>
                    <SelectItem value="WEEKLY">Weekly Flow</SelectItem>
                    <SelectItem value="MONTHLY">Monthly Flow</SelectItem>
                    <SelectItem value="YEARLY">Yearly Flow</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
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
              {editingId ? "Update Parameters" : "Commit Entry"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
