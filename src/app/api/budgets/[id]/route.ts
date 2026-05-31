import { NextResponse } from "next/server"
import { auth } from "../../../../lib/auth"
import { prisma } from "../../../../lib/db"

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
    const { amount, period, startDate, endDate, categoryId } = body

    const budget = await prisma.budget.findUnique({ where: { id } })

    if (!budget || budget.userId !== userId) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 })
    }

    // If category is changing, verify new category belongs to user
    if (categoryId && categoryId !== budget.categoryId) {
      const category = await prisma.category.findUnique({ where: { id: categoryId } })
      if (!category || category.userId !== userId) {
        return NextResponse.json({ error: "Category not found" }, { status: 404 })
      }

      // Check no duplicate budget for new category
      const duplicate = await prisma.budget.findFirst({
        where: { userId, categoryId, id: { not: id } },
      })
      if (duplicate) {
        return NextResponse.json({ error: "Budget already exists for this category" }, { status: 409 })
      }
    }

    const updated = await prisma.budget.update({
      where: { id },
      data: {
        ...(amount !== undefined && { amount }),
        ...(period !== undefined && { period }),
        ...(startDate !== undefined && { startDate: new Date(startDate) }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(categoryId !== undefined && { categoryId }),
      },
      include: {
        category: { select: { id: true, name: true, icon: true, color: true } },
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("PUT /api/budgets/[id] error:", error)
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

    const budget = await prisma.budget.findUnique({ where: { id } })

    if (!budget || budget.userId !== userId) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 })
    }

    await prisma.budget.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/budgets/[id] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
