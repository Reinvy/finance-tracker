import { auth } from "../../lib/auth"
import { prisma } from "../../lib/db"
import { Sidebar } from "../../components/layout/sidebar"
import { Navbar } from "../../components/layout/navbar"
import type { ReactNode } from "react"

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await auth()

  return (
    <div className="flex h-screen overflow-hidden bg-[#070512]">
      {/* Fixed sidebar */}
      <Sidebar user={session?.user ?? null} />

      {/* Main content area */}
      <div className="flex flex-1 flex-col pl-64">
        {/* Top navbar */}
        <Navbar user={session?.user ?? null} />

        {/* Page content */}
        <main className="relative flex-1 overflow-y-auto">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-950/20 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10 mx-auto max-w-7xl p-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
