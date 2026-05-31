import { NextResponse } from "next/server"
import { auth } from "../../../lib/auth"
import { prisma } from "../../../lib/db"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    const budgets = await prisma.budget.findMany({
      where: { userId },
      include: {
        category: { select: { id: true, name: true, icon: true, color: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    // Calculate spent amount for each budget
    const now = new Date()
    const budgetsWithSpent = await Promise.all(
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

        const aggregate = await prisma.transaction.aggregate({
          where: {
            userId,
            categoryId: budget.categoryId,
            type: "EXPENSE",
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
          _sum: { amount: true },
        })

        const spentAmount = Number(aggregate._sum.amount || 0)
        const budgetAmount = Number(budget.amount)

        return {
          id: budget.id,
          amount: budgetAmount,
          period: budget.period,
          startDate: budget.startDate,
          endDate: budget.endDate,
          categoryId: budget.categoryId,
          createdAt: budget.createdAt,
          updatedAt: budget.updatedAt,
          category: budget.category,
          spentAmount,
          percentage: budgetAmount > 0 ? Math.round((spentAmount / budgetAmount) * 100) : 0,
        }
      })
    )

    return NextResponse.json(budgetsWithSpent)
  } catch (error) {
    console.error("GET /api/budgets error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const body = await req.json()
    const { amount, period, startDate, endDate, categoryId } = body

    if (!amount || !categoryId) {
      return NextResponse.json({ error: "Missing required fields: amount, categoryId" }, { status: 400 })
    }

    // Verify category belongs to user
    const category = await prisma.category.findUnique({ where: { id: categoryId } })
    if (!category || category.userId !== userId) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    // Check if budget already exists for this category
    const existing = await prisma.budget.findFirst({
      where: { userId, categoryId },
    })
    if (existing) {
      return NextResponse.json({ error: "Budget already exists for this category" }, { status: 409 })
    }

    const budget = await prisma.budget.create({
      data: {
        amount,
        period: period || "monthly",
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
        categoryId,
        userId,
      },
      include: {
        category: { select: { id: true, name: true, icon: true, color: true } },
      },
    })

    return NextResponse.json(budget, { status: 201 })
  } catch (error) {
    console.error("POST /api/budgets error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
