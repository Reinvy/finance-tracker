import { auth } from "../../lib/auth"
import { DashboardShell } from "../../components/layout/dashboard-shell"
import type { ReactNode } from "react"

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await auth()

  return (
    <DashboardShell user={session?.user ?? null}>
      {children}
    </DashboardShell>
  )
}
