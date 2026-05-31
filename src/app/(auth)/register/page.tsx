"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (password !== confirmPassword) {
      toast.error("Password tidak cocok")
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Gagal mendaftar")
        setLoading(false)
        return
      }

      toast.success("Akun berhasil dibuat!")
      
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.ok) {
        window.location.href = "/dashboard"
      } else {
        toast.error("Gagal login otomatis. Silakan login manual.")
      }
    } catch {
      toast.error("Terjadi kesalahan. Silakan coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/30 via-black to-black p-4">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-950/40 backdrop-blur-xl shadow-2xl shadow-black ring-1 ring-zinc-800/50">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-300 shadow-lg ring-1 ring-white/20">
            <svg className="h-6 w-6 text-zinc-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight bg-gradient-to-r from-zinc-100 to-zinc-300 bg-clip-text text-transparent">Buat Akun</CardTitle>
          <CardDescription className="text-zinc-500 text-sm">Daftar untuk mulai mencatat keuangan Anda</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-zinc-300 text-sm font-medium">Nama</Label>
              <Input
                id="name"
                name="name"
                placeholder="Nama lengkap"
                required
                className="border-zinc-800 bg-zinc-900/30 text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/10 focus:bg-zinc-900/50 transition-all rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300 text-sm font-medium">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="nama@email.com"
                required
                className="border-zinc-800 bg-zinc-900/30 text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/10 focus:bg-zinc-900/50 transition-all rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300 text-sm font-medium">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Minimal 6 karakter"
                required
                minLength={6}
                className="border-zinc-800 bg-zinc-900/30 text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/10 focus:bg-zinc-900/50 transition-all rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-zinc-300 text-sm font-medium">Konfirmasi Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Ulangi password"
                required
                minLength={6}
                className="border-zinc-800 bg-zinc-900/30 text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/10 focus:bg-zinc-900/50 transition-all rounded-lg"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 mt-2">
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-300 hover:from-white hover:to-zinc-100 text-zinc-950 font-bold border-0 shadow-lg active:translate-y-px transition-all py-2.5 rounded-lg"
            >
              {loading ? "Memproses..." : "Daftar"}
            </Button>
            <p className="text-xs text-zinc-500">
              Sudah punya akun?{" "}
              <Link href="/login" className="text-zinc-300 hover:text-white font-medium hover:underline underline-offset-4 transition-all">
                Masuk
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
