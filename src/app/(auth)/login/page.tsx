"use client"

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { 
  Wallet, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  Sparkles, 
  TrendingUp, 
  PieChart, 
  ShieldCheck, 
  ArrowRight 
} from "lucide-react"

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)

  // Slideshow data for the premium right panel
  const features = [
    {
      title: "Smart Expense Tracking",
      description: "Catat pengeluaran dan pemasukan harian Anda secara instan dalam beberapa klik. Kategorikan secara otomatis untuk analisis cepat.",
      icon: <Wallet className="h-6 w-6 text-emerald-400" />,
      color: "from-emerald-500/20 to-teal-500/5"
    },
    {
      title: "Beautiful Financial Analytics",
      description: "Visualisasikan kondisi keuangan Anda dengan grafik interaktif kontras tinggi. Pahami aliran dana masuk dan keluar Anda seketika.",
      icon: <PieChart className="h-6 w-6 text-purple-400" />,
      color: "from-purple-500/20 to-indigo-500/5"
    },
    {
      title: "Smart Budget Planning",
      description: "Tetapkan limit anggaran bulanan per kategori. Dapatkan notifikasi dan visual tracker saat Anda mendekati batas pengeluaran.",
      icon: <TrendingUp className="h-6 w-6 text-amber-400" />,
      color: "from-amber-500/20 to-orange-500/5"
    }
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % features.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [features.length])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast.error("Email atau password salah. Silakan periksa kembali.")
      } else {
        toast.success("Berhasil masuk! Mengalihkan...")
        // Full page navigation so middleware re-checks session cookie
        window.location.href = "/dashboard"
      }
    } catch {
      toast.error("Terjadi kesalahan sistem. Silakan coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-black text-zinc-100 overflow-hidden font-sans">
      
      {/* LEFT PANEL: AUTHENTICATION FORM */}
      <section className="col-span-1 lg:col-span-5 flex flex-col justify-between p-6 md:p-12 bg-black relative z-10 border-r border-zinc-900">
        
        {/* Subtle decorative glow */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
        
        {/* Logo Section */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.3)] ring-1 ring-emerald-400/30">
            <Wallet className="h-4 w-4 text-zinc-950 stroke-[2.5]" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            Finance Tracker
          </span>
        </div>

        {/* Form Container */}
        <div className="my-auto py-8 max-w-sm w-full mx-auto space-y-8">
          <div className="space-y-2.5 text-center lg:text-left">
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
              Selamat Datang Kembali
            </h1>
            <p className="text-zinc-500 text-sm font-medium leading-relaxed">
              Masuk untuk memantau, menganalisis, dan merencanakan keuangan Anda secara pintar.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300 text-xs font-semibold uppercase tracking-wider">
                Alamat Email
              </Label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-600 group-focus-within:text-emerald-400 transition-colors">
                  <Mail className="h-4 w-4" />
                </div>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="nama@email.com"
                  required
                  className="pl-10 pr-4 py-2.5 w-full border-zinc-800 bg-zinc-950/50 text-zinc-100 placeholder:text-zinc-700 focus:border-emerald-500/80 focus:ring-4 focus:ring-emerald-500/10 focus:bg-zinc-950 transition-all rounded-xl border"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-zinc-300 text-xs font-semibold uppercase tracking-wider">
                  Password
                </Label>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-600 group-focus-within:text-emerald-400 transition-colors">
                  <Lock className="h-4 w-4" />
                </div>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  className="pl-10 pr-10 py-2.5 w-full border-zinc-800 bg-zinc-950/50 text-zinc-100 placeholder:text-zinc-700 focus:border-emerald-500/80 focus:ring-4 focus:ring-emerald-500/10 focus:bg-zinc-950 transition-all rounded-xl border"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-600 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full relative overflow-hidden group/btn bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 hover:from-emerald-300 hover:to-teal-400 text-zinc-950 font-bold shadow-lg shadow-emerald-500/15 active:translate-y-px transition-all py-3 rounded-xl border-0 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-zinc-950" />
                  <span>Memverifikasi akun...</span>
                </>
              ) : (
                <>
                  <span>Masuk Ke Dashboard</span>
                  <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-0.5 transition-transform duration-200" />
                </>
              )}
            </Button>
          </form>

          {/* Footer Navigation */}
          <div className="text-center">
            <p className="text-xs text-zinc-500">
              Belum terdaftar?{" "}
              <Link href="/register" className="text-zinc-200 hover:text-white font-bold hover:underline underline-offset-4 transition-all">
                Daftar Sekarang
              </Link>
            </p>
          </div>
        </div>

        {/* Clean branding note */}
        <div className="text-center lg:text-left">
          <p className="text-[10px] text-zinc-600">
            &copy; {new Date().getFullYear()} Finance Tracker. Secure & Encrypted.
          </p>
        </div>
      </section>

      {/* RIGHT PANEL: EXQUISITE VISUAL & FEATURE SHOWCASE */}
      <section className="hidden lg:col-span-7 lg:flex flex-col justify-center items-center p-12 bg-black relative overflow-hidden border-zinc-900">
        
        {/* Modern grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#09090b_1px,transparent_1px),linear-gradient(to_bottom,#09090b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none opacity-80" />
        
        {/* Elegant pulsing radial glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[120px] animate-pulse duration-10000 pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-teal-500/5 blur-[100px] pointer-events-none" />

        <div className="max-w-md w-full z-10 space-y-10">
          
          {/* Glassmorphic dashboard mockup preview */}
          <div className="relative group p-1.5 rounded-2xl bg-zinc-950/40 border border-zinc-800/40 backdrop-blur-xl shadow-2xl shadow-black ring-1 ring-white/5 overflow-hidden transition-all duration-700 hover:border-emerald-500/20">
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />
            
            {/* Mockup header */}
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3 px-4 pt-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
              </div>
              <div className="text-[10px] text-zinc-600 font-mono tracking-wider">FINANCIAL_REPORT.XLS</div>
              <div className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500/70" />
                <span className="text-[9px] text-zinc-500 font-semibold uppercase tracking-wider">Secured</span>
              </div>
            </div>

            {/* Mockup contents */}
            <div className="p-4 space-y-4">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Total Saldo Aktif</span>
                  <div className="text-2xl font-bold tracking-tight text-white">Rp 48.750.000</div>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +12.4%
                </span>
              </div>

              {/* Progress Tracker Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-zinc-400 font-medium">Batas Anggaran Makanan</span>
                  <span className="text-emerald-400 font-bold">72% Terpakai</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden p-px">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" style={{ width: '72%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Slide Feature Details */}
          <div className="space-y-6 pt-4 text-center">
            
            {/* Active Feature Slider Container */}
            <div className="min-h-[140px] flex flex-col items-center justify-center transition-all duration-500">
              <div className="mb-4 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 shadow-md">
                {features[currentSlide].icon}
              </div>
              <h2 className="text-xl font-bold text-zinc-100 tracking-tight transition-all duration-300">
                {features[currentSlide].title}
              </h2>
              <p className="text-zinc-400 text-sm mt-2.5 leading-relaxed max-w-sm">
                {features[currentSlide].description}
              </p>
            </div>

            {/* Indicators */}
            <div className="flex justify-center gap-2 mt-4">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === currentSlide ? "w-6 bg-emerald-400" : "w-1.5 bg-zinc-800 hover:bg-zinc-700"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

        </div>
      </section>

    </main>
  )
}
