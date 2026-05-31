import { NextResponse } from "next/server"
import { auth } from "../../../lib/auth"
import { prisma } from "../../../lib/db"

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20")))
    const skip = (page - 1) * limit

    const from = searchParams.get("from")
    const to = searchParams.get("to")
    const categoryId = searchParams.get("categoryId")
    const walletId = searchParams.get("walletId")
    const type = searchParams.get("type")
    const search = searchParams.get("search")

    const where: Record<string, unknown> = { userId: session.user.id }

    if (from || to) {
      where.date = {} as Record<string, Date>
      if (from) (where.date as Record<string, Date>).gte = new Date(from)
      if (to) (where.date as Record<string, Date>).lte = new Date(to)
    }

    if (categoryId) where.categoryId = categoryId
    if (walletId) where.walletId = walletId
    if (type && (type === "INCOME" || type === "EXPENSE")) where.type = type
    if (search) {
      where.description = { contains: search, mode: "insensitive" }
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, icon: true, color: true } },
          wallet: { select: { id: true, name: true, icon: true, color: true } },
        },
        orderBy: { date: "desc" },
        skip,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ])

    return NextResponse.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("GET /api/transactions error:", error)
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

    const { amount, type, description, date, isRecurring, recurringInterval, recurringEndDate, walletId, categoryId } = body

    if (!amount || !type || !walletId || !categoryId) {
      return NextResponse.json({ error: "Missing required fields: amount, type, walletId, categoryId" }, { status: 400 })
    }

    if (type !== "INCOME" && type !== "EXPENSE") {
      return NextResponse.json({ error: "Type must be INCOME or EXPENSE" }, { status: 400 })
    }

    // Verify wallet and category belong to user
    const [wallet, category] = await Promise.all([
      prisma.wallet.findUnique({ where: { id: walletId } }),
      prisma.category.findUnique({ where: { id: categoryId } }),
    ])

    if (!wallet || wallet.userId !== userId) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 })
    }
    if (!category || category.userId !== userId) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    const transaction = await prisma.$transaction(async (tx) => {
      const txRecord = await tx.transaction.create({
        data: {
          amount,
          type,
          description: description || null,
          date: date ? new Date(date) : new Date(),
          isRecurring: isRecurring || false,
          recurringInterval: isRecurring ? (recurringInterval || null) : null,
          recurringEndDate: isRecurring && recurringEndDate ? new Date(recurringEndDate) : null,
          walletId,
          categoryId,
          userId,
        },
        include: {
          category: { select: { id: true, name: true, icon: true, color: true } },
          wallet: { select: { id: true, name: true, icon: true, color: true } },
        },
      })

      // Update wallet balance
      const balanceChange = type === "INCOME" ? amount : -amount
      await tx.wallet.update({
        where: { id: walletId },
        data: { balance: { increment: balanceChange } },
      })

      return txRecord
    })

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error("POST /api/transactions error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
