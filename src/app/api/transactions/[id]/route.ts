import { NextResponse } from "next/server"
import { auth } from "../../../../lib/auth"
import { prisma } from "../../../../lib/db"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true, icon: true, color: true } },
        wallet: { select: { id: true, name: true, icon: true, color: true } },
      },
    })

    if (!transaction || transaction.userId !== session.user.id) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    return NextResponse.json(transaction)
  } catch (error) {
    console.error("GET /api/transactions/[id] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const userId = session.user.id
    const body = await req.json()

    const { amount, type, description, date, isRecurring, recurringInterval, recurringEndDate, walletId, categoryId } = body

    // Get existing transaction
    const existing = await prisma.transaction.findUnique({
      where: { id },
      include: { wallet: true },
    })

    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    // If wallet is changing, verify new wallet belongs to user
    const targetWalletId = walletId || existing.walletId
    if (targetWalletId !== existing.walletId) {
      const newWallet = await prisma.wallet.findUnique({ where: { id: targetWalletId } })
      if (!newWallet || newWallet.userId !== userId) {
        return NextResponse.json({ error: "Wallet not found" }, { status: 404 })
      }
    }

    // If category is changing, verify new category belongs to user
    const targetCategoryId = categoryId || existing.categoryId
    if (targetCategoryId !== existing.categoryId) {
      const newCategory = await prisma.category.findUnique({ where: { id: targetCategoryId } })
      if (!newCategory || newCategory.userId !== userId) {
        return NextResponse.json({ error: "Category not found" }, { status: 404 })
      }
    }

    if (type && type !== "INCOME" && type !== "EXPENSE") {
      return NextResponse.json({ error: "Type must be INCOME or EXPENSE" }, { status: 400 })
    }

    const transaction = await prisma.$transaction(async (tx) => {
      // Reverse old balance change
      const oldBalanceChange = existing.type === "INCOME" ? existing.amount : -existing.amount
      const oldBalance = existing.wallet.balance
      const walletAfterReverse = Number(oldBalance) - Number(oldBalanceChange)

      // Update old wallet balance (reverse)
      await tx.wallet.update({
        where: { id: existing.walletId },
        data: { balance: walletAfterReverse },
      })

      // Apply new balance change to target wallet
      const finalType = type || existing.type
      const finalAmount = amount !== undefined ? amount : existing.amount
      const newBalanceChange = finalType === "INCOME" ? Number(finalAmount) : -Number(finalAmount)

      await tx.wallet.update({
        where: { id: targetWalletId },
        data: { balance: { increment: newBalanceChange } },
      })

      // Update the transaction
      return tx.transaction.update({
        where: { id },
        data: {
          ...(amount !== undefined && { amount }),
          ...(type !== undefined && { type }),
          ...(description !== undefined && { description: description || null }),
          ...(date !== undefined && { date: new Date(date) }),
          ...(isRecurring !== undefined && { isRecurring }),
          ...(recurringInterval !== undefined && { recurringInterval: recurringInterval || null }),
          ...(recurringEndDate !== undefined && { recurringEndDate: recurringEndDate ? new Date(recurringEndDate) : null }),
          ...(walletId !== undefined && { walletId }),
          ...(categoryId !== undefined && { categoryId }),
        },
        include: {
          category: { select: { id: true, name: true, icon: true, color: true } },
          wallet: { select: { id: true, name: true, icon: true, color: true } },
        },
      })
    })

    return NextResponse.json(transaction)
  } catch (error) {
    console.error("PUT /api/transactions/[id] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const userId = session.user.id

    // Get existing transaction with wallet
    const existing = await prisma.transaction.findUnique({
      where: { id },
      include: { wallet: true },
    })

    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    await prisma.$transaction(async (tx) => {
      // Reverse the balance change
      const balanceChange = existing.type === "INCOME" ? -existing.amount : existing.amount
      await tx.wallet.update({
        where: { id: existing.walletId },
        data: { balance: { increment: balanceChange } },
      })

      // Delete the transaction
      await tx.transaction.delete({ where: { id } })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/transactions/[id] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
