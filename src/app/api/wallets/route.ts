import { NextResponse } from "next/server"
import { auth } from "../../../lib/auth"
import { prisma } from "../../../lib/db"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const wallets = await prisma.wallet.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "asc" },
    })

    // Convert Decimal balance to number for JSON serialization
    const result = wallets.map((w) => ({
      ...w,
      balance: Number(w.balance),
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error("GET /api/wallets error:", error)
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
    const { name, type, balance, icon, color, isActive } = body

    if (!name) {
      return NextResponse.json({ error: "Missing required field: name" }, { status: 400 })
    }

    const wallet = await prisma.wallet.create({
      data: {
        name,
        type: type || "cash",
        balance: balance ?? 0,
        icon: icon || "wallet",
        color: color || "#6366f1",
        isActive: isActive ?? true,
        userId,
      },
    })

    return NextResponse.json({
      ...wallet,
      balance: Number(wallet.balance),
    }, { status: 201 })
  } catch (error) {
    console.error("POST /api/wallets error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
