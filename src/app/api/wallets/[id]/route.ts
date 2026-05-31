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
    const { name, type, icon, color, isActive } = body

    const wallet = await prisma.wallet.findUnique({ where: { id } })

    if (!wallet || wallet.userId !== userId) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 })
    }

    // Only allow updating balance through transactions, not directly
    const updated = await prisma.wallet.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(type !== undefined && { type }),
        ...(icon !== undefined && { icon }),
        ...(color !== undefined && { color }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    return NextResponse.json({
      ...updated,
      balance: Number(updated.balance),
    })
  } catch (error) {
    console.error("PUT /api/wallets/[id] error:", error)
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

    const wallet = await prisma.wallet.findUnique({ where: { id } })

    if (!wallet || wallet.userId !== userId) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 })
    }

    await prisma.wallet.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/wallets/[id] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
