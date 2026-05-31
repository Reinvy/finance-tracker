import { NextResponse } from "next/server"
import { auth } from "../../../lib/auth"
import { prisma } from "../../../lib/db"
import type { DashboardData, TransactionData, CategoryBreakdown, MonthlyTrend, BudgetProgress } from "../../../types"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const now = new Date()

    // Current month boundaries
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

    // Run all queries in parallel
    const [
      wallets,
      monthlyIncomeAgg,
      monthlyExpenseAgg,
      recentTransactions,
      categoryExpenses,
      budgets,
      monthlyTrendData,
    ] = await Promise.all([
      // 1. Total balance
      prisma.wallet.findMany({
        where: { userId, isActive: true },
        select: { balance: true },
      }),

      // 2. Monthly income
      prisma.transaction.aggregate({
        where: {
          userId,
          type: "INCOME",
          date: { gte: monthStart, lte: monthEnd },
        },
        _sum: { amount: true },
      }),

      // 3. Monthly expense
      prisma.transaction.aggregate({
        where: {
          userId,
          type: "EXPENSE",
          date: { gte: monthStart, lte: monthEnd },
        },
        _sum: { amount: true },
      }),

      // 4. Recent transactions
      prisma.transaction.findMany({
        where: { userId },
        include: {
          category: { select: { id: true, name: true, icon: true, color: true } },
          wallet: { select: { id: true, name: true, icon: true, color: true } },
        },
        orderBy: { date: "desc" },
        take: 5,
      }),

      // 5. Category breakdown (expenses by category this month)
      prisma.transaction.groupBy({
        by: ["categoryId"],
        where: {
          userId,
          type: "EXPENSE",
          date: { gte: monthStart, lte: monthEnd },
        },
        _sum: { amount: true },
      }),

      // 6. Budgets for progress
      prisma.budget.findMany({
        where: { userId },
        include: {
          category: { select: { id: true, name: true, icon: true, color: true } },
        },
      }),

      // 7. Monthly trend (last 6 months)
      Promise.all(
        Array.from({ length: 6 }, (_, i) => {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
          const start = new Date(d.getFullYear(), d.getMonth(), 1)
          const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999)
          const monthLabel = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`

          return Promise.all([
            prisma.transaction.aggregate({
              where: { userId, type: "INCOME", date: { gte: start, lte: end } },
              _sum: { amount: true },
            }),
            prisma.transaction.aggregate({
              where: { userId, type: "EXPENSE", date: { gte: start, lte: end } },
              _sum: { amount: true },
            }),
          ]).then(([income, expense]) => ({
            month: monthLabel,
            income: Number(income._sum.amount || 0),
            expense: Number(expense._sum.amount || 0),
          }))
        })
      ),
    ])

    const totalBalance = wallets.reduce((sum, w) => sum + Number(w.balance), 0)
    const monthlyIncome = Number(monthlyIncomeAgg._sum.amount || 0)
    const monthlyExpense = Number(monthlyExpenseAgg._sum.amount || 0)

    // Map recent transactions to TransactionData format
    const recentTransactionsData: TransactionData[] = recentTransactions.map((t) => ({
      id: t.id,
      amount: Number(t.amount),
      type: t.type as "INCOME" | "EXPENSE",
      description: t.description,
      date: t.date,
      category: t.category,
      wallet: t.wallet,
    }))

    // Build category breakdown with category details
    const categoryIds = categoryExpenses.map((c) => c.categoryId)
    const categoryDetails = categoryIds.length > 0
      ? await prisma.category.findMany({
          where: { id: { in: categoryIds }, userId },
          select: { id: true, name: true, icon: true, color: true },
        })
      : []

    const categoryMap = new Map(categoryDetails.map((c) => [c.id, c]))
    const totalExpenses = categoryExpenses.reduce((sum, c) => sum + Number(c._sum.amount || 0), 0)

    const categoryBreakdown: CategoryBreakdown[] = categoryExpenses.map((c) => {
      const cat = categoryMap.get(c.categoryId)
      const total = Number(c._sum.amount || 0)
      return {
        name: cat?.name || "Unknown",
        icon: cat?.icon || "tag",
        color: cat?.color || "#6366f1",
        total,
        percentage: totalExpenses > 0 ? Math.round((total / totalExpenses) * 100) : 0,
      }
    })

    // Monthly trend (already computed, reverse to chronological order)
    const monthlyTrend: MonthlyTrend[] = monthlyTrendData.reverse()

    // Budget progress
    const budgetProgress: BudgetProgress[] = await Promise.all(
      budgets.map(async (budget) => {
        let startDate: Date
        switch (budget.period) {
          case "weekly": {
            const dayOfWeek = now.getDay()
            startDate = new Date(now)
            startDate.setDate(now.getDate() - dayOfWeek)
            startDate.setHours(0, 0, 0, 0)
            break
          }
          case "monthly":
            startDate = new Date(now.getFullYear(), now.getMonth(), 1)
            break
          case "yearly":
            startDate = new Date(now.getFullYear(), 0, 1)
            break
          default:
            startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        }

        const endDate = budget.endDate || now

        const spentAgg = await prisma.transaction.aggregate({
          where: {
            userId,
            categoryId: budget.categoryId,
            type: "EXPENSE",
            date: { gte: startDate, lte: endDate },
          },
          _sum: { amount: true },
        })

        const spentAmount = Number(spentAgg._sum.amount || 0)
        const budgetAmount = Number(budget.amount)

        return {
          id: budget.id,
          categoryName: budget.category.name,
          categoryIcon: budget.category.icon,
          categoryColor: budget.category.color,
          budgetAmount,
          spentAmount,
          percentage: budgetAmount > 0 ? Math.round((spentAmount / budgetAmount) * 100) : 0,
          period: budget.period,
        }
      })
    )

    const dashboard: DashboardData = {
      totalBalance,
      monthlyIncome,
      monthlyExpense,
      recentTransactions: recentTransactionsData,
      categoryBreakdown,
      monthlyTrend,
      budgetProgress,
    }

    return NextResponse.json(dashboard)
  } catch (error) {
    console.error("GET /api/dashboard error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
