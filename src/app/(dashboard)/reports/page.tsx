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
  Sparkles,
  Layers,
} from "lucide-react"
import { toast } from "sonner"
import {
  AreaChart,
  Area,
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
import { GlowCard } from "@/components/ui/glow-card"
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

  const nextMonth = useCallback(() => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear((y) => y + 1)
    } else {
      setCurrentMonth((m) => m + 1)
    }
  }, [currentMonth])

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
    return <ReportsSkeleton />
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertTriangle className="mb-4 h-12 w-12 text-red-500 animate-bounce" />
        <h2 className="text-xl font-bold text-foreground">Sync Error</h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm">{error}</p>
        <Button className="mt-6 px-5 py-2.5 rounded-xl font-semibold" onClick={fetchData}>
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
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Intelligence Hub</h1>
          <p className="text-xs font-medium text-muted-foreground">Strategic summaries, rolling flows, and exports</p>
        </div>
        <Button
          onClick={exportCSV}
          disabled={transactions.length === 0}
          className="rounded-xl px-4 py-2.5 bg-primary text-primary-foreground font-semibold hover:-translate-y-0.5 shadow-md shadow-primary/20 hover:shadow-primary/35 flex items-center gap-1.5 transition-all duration-200"
        >
          <Download className="h-4 w-4" />
          Export CSV Ledger
        </Button>
      </div>

      {/* Month Slider Control Panel */}
      <GlowCard className="p-4" glowSize={250}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={prevMonth}
              className="h-9 w-9 rounded-xl border-border bg-secondary/30"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-[180px] text-center">
              <span className="text-base font-extrabold text-foreground tracking-tight">
                {monthNames[currentMonth]} {currentYear}
              </span>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={nextMonth}
              className="h-9 w-9 rounded-xl border-border bg-secondary/30"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Badge className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold py-1 px-3">
            {transactions.length} operations parsed
          </Badge>
        </div>
      </GlowCard>

      {/* Summary KPI Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        
        <GlowCard glowColor="rgba(16, 185, 129, 0.12)" glowSize={250}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider">Inbound Allocation</span>
            <div className="rounded-xl border border-emerald-550/10 bg-emerald-550/5 p-2 shadow-sm text-emerald-500">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-extrabold text-emerald-500 tracking-tight">
              {formatCurrency(monthlyIncome)}
            </span>
            <div className="flex items-center gap-1 mt-2 text-[9px] text-muted-foreground font-semibold">
              <span>{transactions.filter((t) => t.type === "INCOME").length} strategic deposits</span>
            </div>
          </div>
        </GlowCard>

        <GlowCard glowColor="rgba(244, 63, 94, 0.12)" glowSize={250}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-500 uppercase tracking-wider">Outbound Allocation</span>
            <div className="rounded-xl border border-rose-550/10 bg-rose-550/5 p-2 shadow-sm text-rose-500">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-extrabold text-rose-500 tracking-tight">
              {formatCurrency(monthlyExpense)}
            </span>
            <div className="flex items-center gap-1 mt-2 text-[9px] text-muted-foreground font-semibold">
              <span>{transactions.filter((t) => t.type === "EXPENSE").length} operational drafts</span>
            </div>
          </div>
        </GlowCard>

        <GlowCard glowColor="rgba(99, 102, 241, 0.12)" glowSize={250}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-primary uppercase tracking-wider">Net Balance surplus</span>
            <div className="rounded-xl border border-border/80 bg-secondary/55 p-2 shadow-sm text-primary">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-extrabold text-foreground tracking-tight">
              {formatCurrency(netAmount)}
            </span>
            <div className="flex items-center gap-1 mt-2 text-[9px] font-bold text-primary">
              <span>{netAmount >= 0 ? "Surplus operational buffer" : "Deficit budget gap"}</span>
            </div>
          </div>
        </GlowCard>

      </div>

      {/* Visual Analytics */}
      <div className="grid gap-6 md:grid-cols-2">
        
        {/* Category Allocation Pie */}
        <GlowCard className="p-6">
          <div className="flex flex-col gap-1 pb-4">
            <h3 className="text-sm font-semibold tracking-tight">Category Breakdown</h3>
            <p className="text-[10px] text-muted-foreground">Expense distribution for selected monthly cycle</p>
          </div>
          {categoryBreakdown.length === 0 ? (
            <div className="flex h-[280px] items-center justify-center text-xs text-muted-foreground font-medium">
              No categories mapped to outbound flows.
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
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="total"
                    nameKey="name"
                  >
                    {categoryBreakdown.map((entry, index) => (
                      <Cell key={index} fill={entry.color || "var(--primary)"} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius)",
                      fontSize: "11px",
                    }}
                    formatter={(value, name) => {
                      const item = categoryBreakdown.find((c) => c.name === name)
                      return [`${formatCurrency(Number(value))} (${item?.percentage ?? 0}%)`, name]
                    }}
                  />
                  <Legend
                    formatter={(value) => <span className="text-[10px] font-medium text-muted-foreground">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </GlowCard>

        {/* Six months trend area chart */}
        <GlowCard className="p-6">
          <div className="flex flex-col gap-1 pb-4">
            <h3 className="text-sm font-semibold tracking-tight">Rolling Six-Month Trend</h3>
            <p className="text-[10px] text-muted-foreground">Comparative overview of income and expenses</p>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99, 102, 241, 0.05)" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="currentColor"
                  className="text-muted-foreground"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => {
                    const [, m] = v.split("-")
                    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
                    return months[parseInt(m) - 1] || v
                  }}
                />
                <YAxis
                  stroke="currentColor"
                  className="text-muted-foreground"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    fontSize: "11px",
                  }}
                  formatter={(value) => [formatCurrency(Number(value ?? 0))]}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorInc)"
                  name="Income"
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorExp)"
                  name="Expense"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlowCard>

      </div>

      {/* Transaction List for Month */}
      <GlowCard className="p-6">
        <div className="flex flex-col gap-1 pb-4 border-b border-border/20 mb-4">
          <h3 className="text-sm font-semibold tracking-tight">Ledger Operations Ticker</h3>
          <p className="text-[10px] text-muted-foreground">Transactions audit listing for current cycle</p>
        </div>
        {transactions.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground font-medium">
            No transaction records located for selected cycle.
          </div>
        ) : (
          <div className="divide-y divide-border/20 max-h-[300px] overflow-y-auto pr-1">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-3 hover:bg-secondary/10 rounded-xl px-2 transition-all">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-sm shadow-sm border border-border/30"
                    style={{ backgroundColor: `${tx.category.color}15` }}
                  >
                    {tx.category.icon}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      {tx.description || tx.category.name}
                    </p>
                    <p className="text-[9px] text-muted-foreground mt-0.5 font-medium">{formatDate(tx.date)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-xs font-bold ${
                      tx.type === "INCOME" ? "text-emerald-550" : "text-rose-550"
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
      </GlowCard>

    </div>
  )
}

function ReportsSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-36 rounded-xl" />
          <Skeleton className="mt-2 h-4 w-60 rounded-lg" />
        </div>
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>
      <Skeleton className="h-16 w-full rounded-2xl" />
      <div className="grid gap-6 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <GlowCard key={i}>
            <Skeleton className="h-5 w-24 rounded-lg" />
            <Skeleton className="mt-4 h-8 w-36 rounded-xl" />
          </GlowCard>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2].map((i) => (
          <GlowCard key={i}>
            <Skeleton className="h-[280px] w-full rounded-2xl" />
          </GlowCard>
        ))}
      </div>
    </div>
  )
}
