"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Download,
  TrendingUp,
  TrendingDown,
  Wallet,
  Loader2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { toast } from "sonner"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency, formatDate } from "../../../lib/utils"

interface TransactionData {
  id: string
  amount: number
  type: "INCOME" | "EXPENSE"
  description: string | null
  date: string
  category: { id: string; name: string; icon: string; color: string }
  wallet: { id: string; name: string; icon: string; color: string }
}

interface CategoryTotal {
  name: string
  icon: string
  color: string
  total: number
  percentage: number
}

interface MonthlyData {
  month: string
  income: number
  expense: number
}

export default function ReportsPage() {
  const now = new Date()
  const [currentMonth, setCurrentMonth] = useState(now.getMonth())
  const [currentYear, setCurrentYear] = useState(now.getFullYear())

  const [transactions, setTransactions] = useState<TransactionData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const monthStart = new Date(currentYear, currentMonth, 1)
      const monthEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999)

      // Fetch monthly transactions
      const params = new URLSearchParams({
        from: monthStart.toISOString(),
        to: monthEnd.toISOString(),
        limit: "500",
      })
      const res = await fetch(`/api/transactions?${params}`)
      if (!res.ok) throw new Error("Failed to fetch data")
      const json = await res.json()
      setTransactions(json.transactions || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }, [currentMonth, currentYear])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Calculate summary
  const monthlyIncome = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0)
  const monthlyExpense = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0)
  const netAmount = monthlyIncome - monthlyExpense

  // Category breakdown
  const categoryBreakdown: CategoryTotal[] = (() => {
    const expenseTx = transactions.filter((t) => t.type === "EXPENSE")
    const totalExpense = expenseTx.reduce((sum, t) => sum + t.amount, 0)
    const grouped: Record<string, { name: string; icon: string; color: string; total: number }> = {}

    expenseTx.forEach((t) => {
      const key = t.category.id
      if (!grouped[key]) {
        grouped[key] = {
          name: t.category.name,
          icon: t.category.icon,
          color: t.category.color,
          total: 0,
        }
      }
      grouped[key].total += t.amount
    })

    return Object.values(grouped)
      .map((g) => ({
        ...g,
        percentage: totalExpense > 0 ? Math.round((g.total / totalExpense) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total)
  })()

  // Monthly trend (last 6 months including current)
  const [trendData, setTrendData] = useState<MonthlyData[]>([])

  useEffect(() => {
    async function fetchTrend() {
      const data: MonthlyData[] = []
      for (let i = 5; i >= 0; i--) {
        const d = new Date(currentYear, currentMonth - i, 1)
        const start = new Date(d.getFullYear(), d.getMonth(), 1)
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999)
        const monthLabel = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`

        try {
          const params = new URLSearchParams({
            from: start.toISOString(),
            to: end.toISOString(),
            limit: "1000",
          })
          const res = await fetch(`/api/transactions?${params}`)
          if (res.ok) {
            const json = await res.json()
            const txs: TransactionData[] = json.transactions || []
            const income = txs.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0)
            const expense = txs.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0)
            data.push({ month: monthLabel, income, expense })
          }
        } catch {
          data.push({ month: monthLabel, income: 0, expense: 0 })
        }
      }
      setTrendData(data)
    }
    fetchTrend()
  }, [currentMonth, currentYear])

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ]

  function prevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear((y) => y - 1)
    } else {
      setCurrentMonth((m) => m - 1)
    }
  }

  function nextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear((y) => y + 1)
    } else {
      setCurrentMonth((m) => m + 1)
    }
  }

  function exportCSV() {
    if (transactions.length === 0) {
      toast.error("No transactions to export")
      return
    }

    const headers = ["Date", "Type", "Description", "Category", "Wallet", "Amount (IDR)"]
    const rows = transactions.map((t) => [
      formatDate(t.date),
      t.type === "INCOME" ? "Income" : "Expense",
      `"${(t.description || t.category.name).replace(/"/g, '""')}"`,
      t.category.name,
      t.wallet.name,
      t.type === "INCOME" ? t.amount : -t.amount,
    ])

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `finance-report-${currentYear}-${String(currentMonth + 1).padStart(2, "0")}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Report exported successfully")
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
        <Skeleton className="h-12 w-full max-w-xs" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-[300px] w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="mb-4 h-12 w-12 text-red-400" />
        <h2 className="text-xl font-semibold text-foreground">Failed to load reports</h2>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        <Button className="mt-6" onClick={fetchData}>
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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Reports</h1>
          <p className="text-sm text-muted-foreground">Analyze your financial data</p>
        </div>
        <Button onClick={exportCSV} disabled={transactions.length === 0}>
          <Download className="mr-1.5 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Month Picker */}
      <Card className="bg-card/60 backdrop-blur-sm">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon-sm" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-[180px] text-center">
              <p className="text-lg font-semibold text-foreground">
                {monthNames[currentMonth]} {currentYear}
              </p>
            </div>
            <Button variant="outline" size="icon-sm" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Badge variant="secondary" className="text-xs">
            {transactions.length} transactions
          </Badge>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-600/20 via-emerald-500/10 to-transparent ring-1 ring-emerald-500/30">
          <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-500/20 blur-2xl" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-200">Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-50">
              {formatCurrency(monthlyIncome)}
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs text-emerald-300/70">
              <TrendingUp className="h-3 w-3" />
              <span>{transactions.filter((t) => t.type === "INCOME").length} transactions</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-rose-600/20 via-rose-500/10 to-transparent ring-1 ring-rose-500/30">
          <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-rose-500/20 blur-2xl" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-rose-200">Total Expense</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-50">
              {formatCurrency(monthlyExpense)}
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs text-rose-300/70">
              <TrendingDown className="h-3 w-3" />
              <span>{transactions.filter((t) => t.type === "EXPENSE").length} transactions</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-indigo-600/20 via-indigo-500/10 to-transparent ring-1 ring-indigo-500/30">
          <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-indigo-500/20 blur-2xl" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-indigo-200">Net Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${netAmount >= 0 ? "text-emerald-50" : "text-rose-50"}`}
            >
              {formatCurrency(Math.abs(netAmount))}
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs text-indigo-300/70">
              <Wallet className="h-3 w-3" />
              <span>{netAmount >= 0 ? "Surplus" : "Deficit"}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Category Breakdown Pie */}
        <Card className="bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
            <CardDescription>Expense distribution for {monthNames[currentMonth]}</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryBreakdown.length === 0 ? (
              <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
                No expense data for this month
              </div>
            ) : (
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="total"
                      nameKey="name"
                    >
                      {categoryBreakdown.map((entry, index) => (
                        <Cell key={index} fill={entry.color || "#6366f1"} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                        color: "hsl(var(--popover-foreground))",
                      }}
                      formatter={(value, name) => {
                        const item = categoryBreakdown.find((c) => c.name === name)
                        return [`${formatCurrency(Number(value))} (${item?.percentage ?? 0}%)`, name]
                      }}
                    />
                    <Legend
                      formatter={(value: string) => (
                        <span className="text-xs text-muted-foreground">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Trend Line */}
        <Card className="bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Monthly Trend</CardTitle>
            <CardDescription>Income vs expenses over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="month"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(v) => {
                      const [, m] = v.split("-")
                      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
                      return months[parseInt(m) - 1] || v
                    }}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                      color: "hsl(var(--popover-foreground))",
                    }}
                    formatter={(value) => [formatCurrency(Number(value ?? 0))]}
                  />
                  <Line
                    type="monotone"
                    dataKey="income"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: "#10b981", r: 4 }}
                    name="Income"
                  />
                  <Line
                    type="monotone"
                    dataKey="expense"
                    stroke="#f43f5e"
                    strokeWidth={2}
                    dot={{ fill: "#f43f5e", r: 4 }}
                    name="Expense"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction List for Month */}
      <Card className="bg-card/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Monthly Transactions</CardTitle>
          <CardDescription>
            All transactions for {monthNames[currentMonth]} {currentYear}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No transactions this month
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {transactions.slice(0, 10).map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-2.5"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-sm"
                      style={{ backgroundColor: `${tx.category.color}20` }}
                    >
                      {tx.category.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {tx.description || tx.category.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDate(tx.date)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-semibold ${
                        tx.type === "INCOME" ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {tx.type === "INCOME" ? "+" : "-"}
                      {formatCurrency(tx.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
