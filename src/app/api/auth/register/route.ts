import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { prisma } from "../../../../lib/db"

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email dan password wajib diisi" }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 400 })
    }

    const passwordHash = await hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name: name || null,
        email,
        passwordHash,
      },
    })

    // Create default categories
    const defaultCategories = [
      { name: "Gaji", type: "INCOME" as const, icon: "briefcase", color: "#22c55e" },
      { name: "Freelance", type: "INCOME" as const, icon: "laptop", color: "#3b82f6" },
      { name: "Investasi", type: "INCOME" as const, icon: "trending-up", color: "#a855f7" },
      { name: "Makanan", type: "EXPENSE" as const, icon: "utensils", color: "#ef4444" },
      { name: "Transport", type: "EXPENSE" as const, icon: "car", color: "#f59e0b" },
      { name: "Belanja", type: "EXPENSE" as const, icon: "shopping-cart", color: "#ec4899" },
      { name: "Tagihan", type: "EXPENSE" as const, icon: "file-text", color: "#6366f1" },
      { name: "Hiburan", type: "EXPENSE" as const, icon: "film", color: "#14b8a6" },
      { name: "Kesehatan", type: "EXPENSE" as const, icon: "heart", color: "#f43f5e" },
      { name: "Pendidikan", type: "EXPENSE" as const, icon: "book", color: "#8b5cf6" },
    ]

    // Create default wallet
    await prisma.wallet.create({
      data: {
        name: "Cash",
        type: "cash",
        balance: 0,
        icon: "wallet",
        color: "#6366f1",
        userId: user.id,
      },
    })

    for (const cat of defaultCategories) {
      await prisma.category.create({
        data: {
          name: cat.name,
          type: cat.type,
          icon: cat.icon,
          color: cat.color,
          userId: user.id,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
