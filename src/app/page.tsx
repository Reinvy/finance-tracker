import type { Metadata } from "next"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import {
  Wallet,
  TrendingUp,
  PieChart,
  Shield,
  ArrowRight,
  Sparkles,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Finance Tracker — Take Control of Your Finances",
  description:
    "Track expenses, manage budgets, and visualize your financial health with beautiful charts.",
}

export default async function HomePage() {
  const session = await auth()
  if (session?.user) redirect("/dashboard")

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-background via-background to-muted/30">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Wallet className="h-4 w-4" />
            </div>
            <span className="text-lg font-semibold tracking-tight">
              Finance Tracker
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-foreground px-4 text-sm font-medium text-background shadow-sm transition-all hover:bg-foreground/90"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center px-4 pt-20 pb-32">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5" />
            Smart Personal Finance
          </div>
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Take Control of{" "}
            <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Your Finances
            </span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Track expenses, manage budgets, and visualize your financial health
            with beautiful charts. Your personal finance companion.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-foreground px-8 text-base font-medium text-background shadow-lg shadow-foreground/10 transition-all hover:bg-foreground/90 hover:shadow-xl"
            >
              Start Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-border bg-background px-8 text-base font-medium text-foreground shadow-sm transition-all hover:bg-muted"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border/40 bg-muted/20 px-4 py-24">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Everything You Need
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Powerful features to help you manage your money like a pro.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-2xl border bg-background p-6 shadow-sm transition-all hover:shadow-md"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {feature.icon}
                </div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/40 px-4 py-24">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to Get Started?
          </h2>
          <p className="mb-8 text-muted-foreground">
            Join thousands of users who have taken control of their finances.
          </p>
          <Link
            href="/register"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-foreground px-8 text-base font-medium text-background shadow-lg shadow-foreground/10 transition-all hover:bg-foreground/90"
          >
            Create Free Account
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 px-4 py-8">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Wallet className="h-4 w-4" />
            Finance Tracker &mdash; Track your money wisely
          </div>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Finance Tracker. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

const features = [
  {
    title: "Track Transactions",
    description:
      "Log every income and expense with categories, wallets, and dates. Search, filter, and paginate through your history.",
    icon: <Wallet className="h-5 w-5" />,
  },
  {
    title: "Beautiful Charts",
    description:
      "Visualize your spending with interactive pie charts, line graphs, and bar charts powered by Recharts.",
    icon: <PieChart className="h-5 w-5" />,
  },
  {
    title: "Budget Planning",
    description:
      "Set monthly budgets per category and track progress with visual indicators. Get alerts when you're over budget.",
    icon: <TrendingUp className="h-5 w-5" />,
  },
  {
    title: "Multiple Wallets",
    description:
      "Manage cash, bank accounts, e-wallets, and credit cards all in one place. See your total balance at a glance.",
    icon: <Wallet className="h-5 w-5" />,
  },
  {
    title: "Recurring Transactions",
    description:
      "Automate subscriptions, bills, and regular income. Set daily, weekly, or monthly recurring entries.",
    icon: <Sparkles className="h-5 w-5" />,
  },
  {
    title: "Secure & Private",
    description:
      "Your data is encrypted and protected with NextAuth.js authentication. Only you can access your finances.",
    icon: <Shield className="h-5 w-5" />,
  },
]
