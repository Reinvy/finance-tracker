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
  Loader2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  DollarSign,
  Percent,
} from "lucide-react"
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
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertTriangle className="mb-4 h-12 w-12 text-red-500 animate-bounce" />
        <h2 className="text-xl font-bold tracking-tight text-foreground">Sync Error</h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm">{error}</p>
        <Button className="mt-6 px-5 py-2.5 rounded-xl font-semibold" onClick={fetchDashboard}>
          Retry Sync
        </Button>
      </div>
    )
  }

  if (!data) return null

  const netSavings = data.monthlyIncome - data.monthlyExpense
  const savingsRate = data.monthlyIncome > 0 ? (netSavings / data.monthlyIncome) * 100 : 0

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
      
      {/* Header and Quick Creation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Executive Command</h1>
          <p className="text-xs font-medium text-muted-foreground">Strategic fiscal command center</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => router.push("/transactions?action=add-transaction")}
            className="rounded-xl px-4 py-2.5 bg-gradient-to-r from-primary via-purple-500 to-pink-500 hover:from-primary/90 hover:to-pink-600 text-white font-semibold hover:-translate-y-0.5 shadow-md shadow-primary/20 hover:shadow-primary/35 flex items-center gap-1.5 transition-all duration-200 border-0"
          >
            <Plus className="h-4 w-4" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* AI Strategist Recommendation Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-2xl border border-primary/25 bg-gradient-to-r from-purple-950/25 via-fuchsia-950/10 to-pink-950/10 backdrop-blur-xl shadow-lg shadow-primary/5 relative overflow-hidden group/ai-banner">
        {/* Pulsing neon highlight */}
        <div className="absolute right-0 top-0 h-full w-[4px] bg-gradient-to-b from-primary via-purple-500 to-pink-500 opacity-80" />
        <div className="absolute -right-16 -top-16 w-32 h-32 rounded-full bg-pink-500/5 blur-2xl pointer-events-none group-hover/ai-banner:scale-125 transition-transform duration-700" />
        
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-purple-500 to-pink-500 text-white shadow-lg shadow-primary/25 animate-pulse">
            <Sparkles className="h-4.5 w-4.5 text-white" />
          </div>
          <div>
            <p className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-200 via-purple-100 to-pink-200">Vectra AI Wealth Auditor</p>
            <p className="text-muted-foreground text-[11px] mt-0.5 font-medium leading-relaxed">
              We identified 2 budget sectors nearing warning limits. Cap Food & Dining dining habits to protect your 46% net savings target.
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/reports")}
          className="text-xs font-bold text-primary hover:text-white flex items-center gap-1 hover:bg-white/5 rounded-xl py-1.5 px-4 transition-all"
        >
          View Full AI Insights <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Live Operational KPIs */}
      <div className="grid gap-6 md:grid-cols-4">
        
        {/* Total Liquidity */}
        <GlowCard glowColor="rgba(139, 92, 246, 0.2)" glowSize={250} className="relative overflow-hidden group/kpi">
          <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-br from-primary/5 to-transparent blur-xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Liquidity</span>
            <div className="rounded-xl border border-primary/10 bg-gradient-to-br from-primary/10 to-purple-500/5 p-2 shadow-sm text-primary group-hover/kpi:scale-105 transition-transform duration-300">
              <Wallet className="h-4 w-4 text-primary" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-extrabold text-foreground tracking-tight bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
              {formatCurrency(data.totalBalance)}
            </span>
            <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground font-medium">
              <span className="text-emerald-500 flex items-center font-bold">
                +4.2%
              </span>
              <span>across all linked vaults</span>
            </div>
          </div>
        </GlowCard>

        {/* Monthly Income Flow */}
        <GlowCard glowColor="rgba(16, 185, 129, 0.12)" glowSize={250}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider">Monthly Inbound</span>
            <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-2 shadow-sm text-emerald-500">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-extrabold text-emerald-500 tracking-tight">
              {formatCurrency(data.monthlyIncome)}
            </span>
            <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground font-medium">
              <ArrowUpRight className="h-3 w-3 text-emerald-500" />
              <span>Current fiscal cycle</span>
            </div>
          </div>
        </GlowCard>

        {/* Monthly Outbound Flow */}
        <GlowCard glowColor="rgba(244, 63, 94, 0.12)" glowSize={250}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-500 uppercase tracking-wider">Monthly Outbound</span>
            <div className="rounded-xl border border-rose-500/10 bg-rose-500/5 p-2 shadow-sm text-rose-500">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-extrabold text-rose-500 tracking-tight">
              {formatCurrency(data.monthlyExpense)}
            </span>
            <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground font-medium">
              <ArrowDownRight className="h-3 w-3 text-rose-500" />
              <span>Accrued this month</span>
            </div>
          </div>
        </GlowCard>

        {/* Net Savings & Savings Rate */}
        <GlowCard glowColor="rgba(236, 72, 153, 0.2)" glowSize={250} className="relative overflow-hidden group/kpi">
          <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-br from-pink-500/5 to-transparent blur-xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-pink-400 uppercase tracking-wider">Net Savings</span>
            <div className="rounded-xl border border-pink-500/10 bg-gradient-to-br from-purple-500/10 to-pink-500/5 p-2 shadow-sm text-pink-400 group-hover/kpi:scale-105 transition-transform duration-300">
              <Percent className="h-4 w-4 text-pink-400" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-extrabold text-foreground tracking-tight bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
              {formatCurrency(netSavings)}
            </span>
            <div className="flex items-center gap-1 mt-2 text-[10px] font-bold text-pink-400">
              <span>{savingsRate.toFixed(1)}% savings rate</span>
            </div>
          </div>
        </GlowCard>

      </div>

      {/* Advanced Visual Analytics */}
      <div className="grid gap-6 md:grid-cols-3">
        
        {/* Gradients Line Chart Trend */}
        <GlowCard className="md:col-span-2 p-6" glowSize={400}>
          <div className="flex flex-col gap-1 pb-4">
            <h3 className="text-sm font-semibold tracking-tight">Financial Flow History</h3>
            <p className="text-[10px] text-muted-foreground">Rolling 6-month visual analysis of inbound vs outbound cash flows</p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(139, 92, 246, 0.06)" vertical={false} />
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
                    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                  }}
                  formatter={(value) => [formatCurrency(Number(value))]}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorIncome)"
                  name="Inbound Flow"
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorExpense)"
                  name="Outbound Flow"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlowCard>

        {/* Categories Pie Breakdown */}
        <GlowCard className="p-6">
          <div className="flex flex-col gap-1 pb-4">
            <h3 className="text-sm font-semibold tracking-tight">Category Allocation</h3>
            <p className="text-[10px] text-muted-foreground">Percentage representation of outbound volume</p>
          </div>
          <div className="h-[200px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.categoryBreakdown.length > 0 ? data.categoryBreakdown : [{ name: "No data", total: 1, color: "#374151", percentage: 100 }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="total"
                  nameKey="name"
                >
                  {(data.categoryBreakdown.length > 0 ? data.categoryBreakdown : [{ name: "No data", total: 1, color: "#374151", percentage: 100 }]).map((entry, index) => (
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
                    const item = data.categoryBreakdown.find((c) => c.name === name)
                    return [`${formatCurrency(Number(value))} (${item?.percentage ?? 0}%)`, name]
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2 max-h-[90px] overflow-y-auto pr-1">
            {data.categoryBreakdown.slice(0, 3).map((entry, idx) => (
              <div key={idx} className="flex items-center justify-between text-[11px] font-medium text-foreground">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-muted-foreground truncate">{entry.name}</span>
                </div>
                <span>{entry.percentage}%</span>
              </div>
            ))}
          </div>
        </GlowCard>

      </div>

      {/* Bottom Ledger Rows */}
      <div className="grid gap-6 md:grid-cols-2">
        
        {/* Recent Ledger Audit Logs */}
        <GlowCard className="p-6">
          <div className="flex items-center justify-between pb-4">
            <div>
              <h3 className="text-sm font-semibold tracking-tight">Operations Ledger</h3>
              <p className="text-[10px] text-muted-foreground">Most recent strategic movements</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/transactions")}
              className="text-[11px] font-semibold text-primary hover:bg-primary/5 rounded-lg py-1 px-3"
            >
              View Full Ledger
            </Button>
          </div>
          
          {data.recentTransactions.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground font-medium">
              No transactions recorded in current ledger.
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {data.recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-3 hover:bg-secondary/20 rounded-xl px-2 transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${tx.category.color}15` }}
                    >
                      <span className="text-base">{tx.category.icon}</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">
                        {tx.description || tx.category.name}
                      </p>
                      <p className="text-[9px] text-muted-foreground mt-0.5 font-medium">
                        {tx.wallet.name} &middot; {formatDate(tx.date)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-xs font-bold ${
                        tx.type === "INCOME" ? "text-emerald-500" : "text-rose-500"
                      }`}
                    >
                      {tx.type === "INCOME" ? "+" : "-"}
                      {formatCurrency(tx.amount)}
                    </p>
                    <Badge
                      className={`mt-1 text-[8px] font-bold uppercase tracking-wider py-0 px-1.5 rounded border border-transparent ${
                        tx.type === "INCOME"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-rose-500/10 text-rose-500"
                      }`}
                    >
                      {tx.type === "INCOME" ? "Inbound" : "Outbound"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlowCard>

        {/* Budget Envelopes Progress */}
        <GlowCard className="p-6">
          <div className="flex items-center justify-between pb-4">
            <div>
              <h3 className="text-sm font-semibold tracking-tight">Active Budget Envelopes</h3>
              <p className="text-[10px] text-muted-foreground">Strategic envelope parameters progress</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/budgets")}
              className="text-[11px] font-semibold text-primary hover:bg-primary/5 rounded-lg py-1 px-3"
            >
              Configure Envelopes
            </Button>
          </div>
          
          {data.budgetProgress.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground font-medium">
              No budget envelopes configured. Create parameters in wallets.
            </div>
          ) : (
            <div className="space-y-5">
              {data.budgetProgress.map((budget) => {
                const isOverBudget = budget.percentage > 100
                const isWarning = budget.percentage >= 80 && budget.percentage <= 100
                  const progressColor = isOverBudget
                    ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.35)]"
                    : isWarning
                      ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.35)]"
                      : "bg-gradient-to-r from-primary via-purple-500 to-pink-500 shadow-[0_0_8px_rgba(139,92,246,0.35)]"

                return (
                  <div key={budget.id} className="group/budget">
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{budget.categoryIcon}</span>
                        <span className="font-semibold text-foreground">
                          {budget.categoryName}
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold text-muted-foreground">
                        {formatCurrency(budget.spentAmount)} / {formatCurrency(budget.budgetAmount)}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden border border-border/20">
                      <div
                        className={`h-full ${progressColor} transition-all duration-500 ease-out`}
                        style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                      />
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[9px] font-medium">
                      <span className="text-muted-foreground capitalize">{budget.period} limit</span>
                      <span
                        className={`font-semibold ${
                          isOverBudget
                            ? "text-rose-500"
                            : isWarning
                              ? "text-amber-500"
                              : "text-emerald-500"
                        }`}
                      >
                        {budget.percentage.toFixed(0)}% used
                        {isOverBudget && " (Envelope Exceeded!)"}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </GlowCard>

      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48 rounded-xl" />
          <Skeleton className="mt-2 h-4 w-64 rounded-lg" />
        </div>
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <GlowCard key={i}>
            <Skeleton className="h-5 w-24 rounded-lg" />
            <Skeleton className="mt-4 h-8 w-36 rounded-xl" />
            <Skeleton className="mt-2 h-3.5 w-28 rounded" />
          </GlowCard>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <GlowCard className="md:col-span-2">
          <Skeleton className="h-[300px] w-full rounded-2xl" />
        </GlowCard>
        <GlowCard>
          <Skeleton className="h-[300px] w-full rounded-2xl" />
        </GlowCard>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2].map((i) => (
          <GlowCard key={i}>
            <Skeleton className="h-[250px] w-full rounded-2xl" />
          </GlowCard>
        ))}
      </div>
    </div>
  )
}
