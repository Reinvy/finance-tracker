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
    const { name, type, icon, color } = body

    const category = await prisma.category.findUnique({ where: { id } })

    if (!category || category.userId !== userId) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    if (type && type !== "INCOME" && type !== "EXPENSE") {
      return NextResponse.json({ error: "Type must be INCOME or EXPENSE" }, { status: 400 })
    }

    // Check duplicate name
    if (name && name !== category.name) {
      const duplicate = await prisma.category.findUnique({
        where: { name_userId: { name, userId } },
      })
      if (duplicate) {
        return NextResponse.json({ error: "Category with this name already exists" }, { status: 409 })
      }
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(type !== undefined && { type }),
        ...(icon !== undefined && { icon }),
        ...(color !== undefined && { color }),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("PUT /api/categories/[id] error:", error)
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

    const category = await prisma.category.findUnique({ where: { id } })

    if (!category || category.userId !== userId) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    await prisma.category.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/categories/[id] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export { PUT as PATCH }

