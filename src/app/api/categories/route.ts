import { NextResponse } from "next/server"
import { auth } from "../../../lib/auth"
import { prisma } from "../../../lib/db"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const categories = await prisma.category.findMany({
      where: { userId: session.user.id },
      orderBy: { name: "asc" },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error("GET /api/categories error:", error)
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
    const { name, type, icon, color } = body

    if (!name || !type) {
      return NextResponse.json({ error: "Missing required fields: name, type" }, { status: 400 })
    }

    if (type !== "INCOME" && type !== "EXPENSE") {
      return NextResponse.json({ error: "Type must be INCOME or EXPENSE" }, { status: 400 })
    }

    // Check duplicate name for this user
    const existing = await prisma.category.findUnique({
      where: { name_userId: { name, userId } },
    })

    if (existing) {
      return NextResponse.json({ error: "Category with this name already exists" }, { status: 409 })
    }

    const category = await prisma.category.create({
      data: {
        name,
        type,
        icon: icon || "tag",
        color: color || "#6366f1",
        userId,
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error("POST /api/categories error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
