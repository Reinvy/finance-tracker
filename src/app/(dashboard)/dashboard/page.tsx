"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  MoreHorizontal,
  Loader2,
  AlertTriangle,
} from "lucide-react"
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { formatCurrency, formatDate } from "../../../lib/utils"
import type { DashboardData } from "../../../types"

export default function DashboardPage() {
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboard()
  }, [])

  async function fetchDashboard() {
    try {
      const res = await fetch("/api/dashboard")
      if (!res.ok) throw new Error("Failed to fetch dashboard data")
      const json = await res.json()
      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <DashboardSkeleton />
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="mb-4 h-12 w-12 text-red-400" />
        <h2 className="text-xl font-semibold text-foreground">Failed to load dashboard</h2>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        <Button className="mt-6" onClick={fetchDashboard}>
          Try again
        </Button>
      </div>
    )
  }

  if (!data) return null

  const netIncome = data.monthlyIncome - data.monthlyExpense

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground font-medium">Your financial overview</p>
        </div>
        <Button onClick={() => router.push("/transactions?action=add-transaction")}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add Transaction
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Total Balance */}
        <Card className="relative overflow-hidden border-zinc-800 bg-zinc-950/40 backdrop-blur-md shadow-xl shadow-black ring-1 ring-zinc-800/40">
          <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-zinc-400/5 blur-2xl" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-zinc-400">Total Balance</CardTitle>
            <div className="rounded-lg bg-zinc-900/60 border border-zinc-800/80 p-2">
              <Wallet className="h-4 w-4 text-zinc-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatCurrency(data.totalBalance)}</div>
            <p className="mt-1 text-xs text-zinc-500 font-medium">Across all wallets</p>
          </CardContent>
        </Card>

        {/* Monthly Income */}
        <Card className="relative overflow-hidden border-zinc-800 bg-zinc-950/40 backdrop-blur-md shadow-xl shadow-black ring-1 ring-zinc-800/40">
          <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-500/5 blur-2xl" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-emerald-400/90">Monthly Income</CardTitle>
            <div className="rounded-lg bg-emerald-950/30 border border-emerald-900/30 p-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400">{formatCurrency(data.monthlyIncome)}</div>
            <p className="mt-1 flex items-center gap-1 text-xs text-zinc-500 font-medium">
              <ArrowUpRight className="h-3 w-3 text-emerald-500" />
              Current month
            </p>
          </CardContent>
        </Card>

        {/* Monthly Expense */}
        <Card className="relative overflow-hidden border-zinc-800 bg-zinc-950/40 backdrop-blur-md shadow-xl shadow-black ring-1 ring-zinc-800/40">
          <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-rose-500/5 blur-2xl" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-rose-400/90">Monthly Expense</CardTitle>
            <div className="rounded-lg bg-rose-950/30 border border-rose-900/30 p-2">
              <TrendingDown className="h-4 w-4 text-rose-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-400">{formatCurrency(data.monthlyExpense)}</div>
            <p className="mt-1 flex items-center gap-1 text-xs text-zinc-500 font-medium">
              <ArrowDownRight className="h-3 w-3 text-rose-500" />
              Current month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Monthly Trend Line Chart */}
        <Card className="bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Monthly Trend</CardTitle>
            <CardDescription>Income vs expenses over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.monthlyTrend}>
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
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                      color: "hsl(var(--popover-foreground))",
                    }}
                    formatter={(value) => [formatCurrency(Number(value))]}
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

        {/* Category Breakdown Pie Chart */}
        <Card className="bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
            <CardDescription>Expenses by category this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.categoryBreakdown.length > 0 ? data.categoryBreakdown : [{ name: "No data", total: 1, color: "#374151", percentage: 100, icon: "tag" }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="total"
                    nameKey="name"
                  >
                    {(data.categoryBreakdown.length > 0 ? data.categoryBreakdown : [{ name: "No data", total: 1, color: "#374151", percentage: 100, icon: "tag" }]).map((entry, index) => (
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
                      const item = data.categoryBreakdown.find((c) => c.name === name)
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
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row: Recent Transactions + Budget Progress */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Transactions */}
        <Card className="bg-card/60 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Last 5 transactions</CardDescription>
            </div>
            <Button variant="ghost" size="sm" render={<a href="/transactions" />}>
              View all
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {data.recentTransactions.length === 0 ? (
              <div className="px-4 pb-4 text-center text-sm text-muted-foreground">
                No transactions yet
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {data.recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-lg"
                        style={{ backgroundColor: `${tx.category.color}20` }}
                      >
                        <span className="text-lg">{tx.category.icon}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {tx.description || tx.category.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {tx.wallet.name} &middot; {formatDate(tx.date)}
                        </p>
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
                      <Badge
                        variant={tx.type === "INCOME" ? "default" : "destructive"}
                        className={`mt-0.5 text-[10px] ${
                          tx.type === "INCOME"
                            ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                            : ""
                        }`}
                      >
                        {tx.type === "INCOME" ? "Income" : "Expense"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Budget Progress */}
        <Card className="bg-card/60 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Budget Progress</CardTitle>
              <CardDescription>Monthly budget tracking</CardDescription>
            </div>
            <Button variant="ghost" size="sm" render={<a href="/budgets" />}>
              Manage
            </Button>
          </CardHeader>
          <CardContent>
            {data.budgetProgress.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No budgets set. Create one to track spending.
              </div>
            ) : (
              <div className="space-y-4">
                {data.budgetProgress.map((budget) => {
                  const isOverBudget = budget.percentage > 100
                  const isWarning = budget.percentage >= 80 && budget.percentage <= 100
                  const progressColor = isOverBudget
                    ? "#f43f5e"
                    : isWarning
                      ? "#f59e0b"
                      : budget.categoryColor || "#6366f1"

                  return (
                    <div key={budget.id}>
                      <div className="mb-1.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{budget.categoryIcon}</span>
                          <span className="text-sm font-medium text-foreground">
                            {budget.categoryName}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatCurrency(budget.spentAmount)} / {formatCurrency(budget.budgetAmount)}
                        </span>
                      </div>
                      <Progress
                        value={budget.percentage}
                        color={progressColor}
                        className="h-2"
                      />
                      <div className="mt-0.5 flex items-center justify-between">
                        <span className="text-[11px] text-muted-foreground capitalize">{budget.period}</span>
                        <span
                          className={`text-[11px] font-medium ${
                            isOverBudget
                              ? "text-rose-400"
                              : isWarning
                                ? "text-amber-400"
                                : "text-emerald-400"
                          }`}
                        >
                          {budget.percentage}%
                          {isOverBudget && " (exceeded!)"}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-40" />
          <Skeleton className="mt-2 h-4 w-56" />
        </div>
        <Skeleton className="h-9 w-36" />
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-36" />
              <Skeleton className="mt-2 h-3 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[280px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-40" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3].map((j) => (
                <Skeleton key={j} className="h-12 w-full" />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
