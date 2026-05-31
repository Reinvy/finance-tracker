import type { Metadata } from "next"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Logo } from "@/components/ui/logo"
import {
  Wallet,
  TrendingUp,
  PieChart,
  Shield,
  ArrowRight,
  Sparkles,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Vectra Finance — Smart Wealth Suite",
  description:
    "Track assets, manage budgets, and accelerate your financial velocity with beautiful, high-performance dashboards.",
}

export default async function HomePage() {
  const session = await auth()
  if (session?.user) redirect("/dashboard")

  return (
    <div className="flex min-h-screen flex-col bg-black text-zinc-100 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-950/20 via-black to-black">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-900 bg-black/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Logo showText={true} />
          
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 px-4 text-sm font-semibold text-white shadow-sm transition-all duration-200"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center px-6 pt-20 pb-32 text-center">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-indigo-900/40 bg-indigo-950/25 px-3 py-1 text-xs font-semibold text-indigo-300">
            <Sparkles className="h-3.5 w-3.5 text-pink-400 animate-pulse" />
            Smart Wealth Suite
          </div>
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl leading-none">
            Accelerate Your{" "}
            <span className="bg-gradient-to-r from-indigo-300 via-violet-200 to-pink-300 bg-clip-text text-transparent">
              Financial Velocity
            </span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-base text-zinc-400 sm:text-lg">
            Track assets, optimize budgets, and visualize your portfolio's growth
            with beautiful, high-performance dashboards. Your premium intelligence companion.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-8 text-base font-bold text-black shadow-lg shadow-white/5 transition-all hover:bg-zinc-100 hover:scale-105 active:scale-95 duration-200"
            >
              Start Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950/40 px-8 text-base font-semibold text-zinc-300 shadow-sm transition-all hover:bg-zinc-900 hover:text-white"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-zinc-900 bg-zinc-950/20 px-6 py-24">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl text-white">
              Designed for Peak Performance
            </h2>
            <p className="mx-auto max-w-2xl text-zinc-400 text-sm">
              Sophisticated tools to help you manage your assets and scale your wealth like a professional.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-2xl border border-zinc-900 bg-zinc-950/40 p-6 shadow-2xl transition-all hover:border-indigo-900/60 hover:shadow-indigo-950/10 ring-1 ring-zinc-900/50"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-indigo-400 border border-zinc-800 group-hover:border-indigo-500/40 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="mb-2 text-base font-bold text-zinc-200 group-hover:text-white transition-colors">{feature.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-zinc-900 px-6 py-24 text-center">
        <div className="container mx-auto max-w-3xl">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl text-white">
            Ready to Begin?
          </h2>
          <p className="mb-8 text-zinc-400 text-sm">
            Join thousands of smart individuals who have accelerated their wealth journey with Vectra.
          </p>
          <Link
            href="/register"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-8 text-base font-bold text-white shadow-lg shadow-indigo-500/10 transition-all hover:opacity-95 hover:scale-105 duration-200"
          >
            Create Free Account
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 px-6 py-8">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Logo showText={true} />
          <p className="text-xs text-zinc-500">
            &copy; {new Date().getFullYear()} Vectra Finance. All rights
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

