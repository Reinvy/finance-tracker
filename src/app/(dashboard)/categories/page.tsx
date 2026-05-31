"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertTriangle,
  Tag,
  Sparkles,
} from "lucide-react"
import { toast } from "sonner"
import { GlowCard } from "@/components/ui/glow-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"

interface CategoryData {
  id: string
  name: string
  type: "INCOME" | "EXPENSE"
  icon: string
  color: string
}

interface CategoryForm {
  name: string
  type: "INCOME" | "EXPENSE"
  icon: string
  color: string
}

const emptyForm: CategoryForm = {
  name: "",
  type: "EXPENSE",
  icon: "tag",
  color: "#6366f1",
}

const ICON_OPTIONS = [
  { value: "tag", label: "🏷️ Tag" },
  { value: "shopping-cart", label: "🛒 Shopping" },
  { value: "food", label: "🍔 Food" },
  { value: "car", label: "🚗 Transport" },
  { value: "home", label: "🏠 Housing" },
  { value: "health", label: "🏥 Health" },
  { value: "education", label: "📚 Education" },
  { value: "entertainment", label: "🎬 Entertainment" },
  { value: "shopping-bag", label: "🛍️ Retail" },
  { value: "coffee", label: "☕ Beverage" },
  { value: "gym", label: "💪 Wellness" },
  { value: "plane", label: "✈️ Travel" },
  { value: "gift", label: "🎁 Gift" },
  { value: "salary", label: "💰 Salary" },
  { value: "investment", label: "📈 Portfolio" },
  { value: "freelance", label: "💻 Freelance" },
  { value: "rental", label: "🏘️ Asset Rental" },
  { value: "other", label: "📦 Package Box" },
]

const COLOR_OPTIONS = [
  "#6366f1", "#8b5cf6", "#a855f7", "#d946ef",
  "#ec4899", "#f43f5e", "#ef4444", "#f97316",
  "#eab308", "#22c55e", "#10b981", "#14b8a6",
  "#06b6d4", "#3b82f6", "#2563eb", "#1d4ed8",
  "#71717a", "#78716c", "#7c3aed", "#0d9488",
]

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("expense")

  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState<CategoryForm>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/categories")
      if (!res.ok) throw new Error("Failed to fetch categories")
      setCategories(await res.json())
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const expenseCategories = categories.filter((c) => c.type === "EXPENSE")
  const incomeCategories = categories.filter((c) => c.type === "INCOME")

  function openAddDialog(type: "INCOME" | "EXPENSE") {
    setEditingId(null)
    setForm({ ...emptyForm, type })
    setDialogOpen(true)
  }

  function openEditDialog(cat: CategoryData) {
    setEditingId(cat.id)
    setForm({
      name: cat.name,
      type: cat.type,
      icon: cat.icon,
      color: cat.color,
    })
    setDialogOpen(true)
  }

  async function handleSubmit() {
    if (!form.name) {
      toast.error("Please enter a category name")
      return
    }

    setSubmitting(true)
    try {
      const body = {
        name: form.name,
        type: form.type,
        icon: form.icon,
        color: form.color,
      }

      const url = editingId ? `/api/categories/${editingId}` : "/api/categories"
      const method = editingId ? "PATCH" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to save category")
      }

      toast.success(editingId ? "Category updated" : "Category created")
      setDialogOpen(false)
      fetchCategories()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this category?")) return

    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      toast.success("Category deleted")
      fetchCategories()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An error occurred")
    }
  }

  if (loading) {
    return <CategoriesSkeleton />
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertTriangle className="mb-4 h-12 w-12 text-red-500 animate-bounce" />
        <h2 className="text-xl font-bold text-foreground">Sync Error</h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm">{error}</p>
        <Button className="mt-6 px-5 py-2.5 rounded-xl font-semibold" onClick={fetchCategories}>
          Retry Sync
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Taxonomy Categories</h1>
          <p className="text-xs font-medium text-muted-foreground font-medium">Define transaction category parameters, colors, and identifiers</p>
        </div>
      </div>

      {/* Tabs list with floating details */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-border/25">
          <TabsList className="bg-secondary/40 border border-border/80 rounded-xl p-1 h-10">
            <TabsTrigger value="expense" className="rounded-lg text-xs font-bold px-5 h-8">Outbound (Expense)</TabsTrigger>
            <TabsTrigger value="income" className="rounded-lg text-xs font-bold px-5 h-8">Inbound (Income)</TabsTrigger>
          </TabsList>
          <Button
            onClick={() => openAddDialog(activeTab === "expense" ? "EXPENSE" : "INCOME")}
            className="rounded-xl px-4 py-2.5 bg-primary text-primary-foreground font-semibold hover:-translate-y-0.5 shadow-md shadow-primary/20 hover:shadow-primary/35 flex items-center gap-1.5 transition-all duration-200"
          >
            <Plus className="h-4 w-4" />
            Add {activeTab === "expense" ? "Outbound" : "Inbound"} Category
          </Button>
        </div>

        <TabsContent value="expense" className="mt-6 focus:outline-none">
          {expenseCategories.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-center">
              <Tag className="mb-4 h-12 w-12 text-muted-foreground animate-pulse" />
              <h3 className="text-sm font-bold text-foreground">No outbound categories</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">Establish spending category parameters to segment transaction logs.</p>
              <Button className="mt-6 rounded-xl font-semibold" onClick={() => openAddDialog("EXPENSE")}>
                <Plus className="mr-1.5 h-4 w-4" />
                Add Category
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {expenseCategories.map((cat) => (
                <CategoryCard
                  key={cat.id}
                  category={cat}
                  onEdit={() => openEditDialog(cat)}
                  onDelete={() => handleDelete(cat.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="income" className="mt-6 focus:outline-none">
          {incomeCategories.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-center">
              <Tag className="mb-4 h-12 w-12 text-muted-foreground animate-pulse" />
              <h3 className="text-sm font-bold text-foreground">No inbound categories</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">Establish inbound categories to segment incoming salary or investment assets.</p>
              <Button className="mt-6 rounded-xl font-semibold" onClick={() => openAddDialog("INCOME")}>
                <Plus className="mr-1.5 h-4 w-4" />
                Add Category
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {incomeCategories.map((cat) => (
                <CategoryCard
                  key={cat.id}
                  category={cat}
                  onEdit={() => openEditDialog(cat)}
                  onDelete={() => handleDelete(cat.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add/Edit Category Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md border border-border bg-popover text-foreground rounded-2xl shadow-premium-4 p-6 overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold tracking-tight uppercase tracking-widest flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              {editingId ? "Modify Category parameters" : "Establish Category Taxonomy"}
            </DialogTitle>
            <DialogDescription className="text-[10px] font-medium text-muted-foreground mt-1">
              {editingId ? "Update selected taxonomy parameters." : "Define category visual parameters and identifiers."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4 text-xs font-semibold">
            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="catName" className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Category Name</Label>
              <Input
                id="catName"
                placeholder="e.g. Health & Wellness"
                className="bg-secondary/40 border-border/80 rounded-xl h-10 px-3"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            {/* Type */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Ledger Vector type</Label>
              <Select
                value={form.type}
                onValueChange={(v) => {
                  if (v === "INCOME" || v === "EXPENSE") setForm({ ...form, type: v })
                }}
              >
                <SelectTrigger className="w-full h-10 rounded-xl bg-secondary/40 border-border/80 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border bg-popover">
                  <SelectItem value="EXPENSE">Outbound (Expense)</SelectItem>
                  <SelectItem value="INCOME">Inbound (Income)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Icon */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Icon Identifier</Label>
              <Select value={form.icon} onValueChange={(v) => setForm({ ...form, icon: v || "tag" })}>
                <SelectTrigger className="w-full h-10 rounded-xl bg-secondary/40 border-border/80 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border bg-popover">
                  {ICON_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Color */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Visual Aesthetic Glow Accent</Label>
              <div className="flex flex-wrap gap-2 pt-1.5">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setForm({ ...form, color })}
                    className={`h-7 w-7 rounded-lg ring-2 ring-offset-2 ring-offset-background transition-all hover:scale-110 ${
                      form.color === color ? "ring-foreground scale-110 shadow" : "ring-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2.5">
            <DialogClose render={<Button variant="outline" className="rounded-xl font-bold h-10" />}>
              Cancel
            </DialogClose>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-primary text-primary-foreground font-semibold hover:-translate-y-0.5 rounded-xl h-10 px-5 transition-all shadow-md shadow-primary/20"
            >
              {submitting && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              {editingId ? "Update Parameters" : "Commit Link"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function CategoryCard({
  category,
  onEdit,
  onDelete,
}: {
  category: CategoryData
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <GlowCard
      glowColor={`${category.color}15`}
      glowSize={250}
      className="p-5 relative rounded-2xl overflow-hidden flex flex-col justify-between"
      style={{ borderColor: `${category.color}35` }}
    >
      {/* Decorative side accent */}
      <div
        className="absolute left-0 top-0 h-full w-1"
        style={{ backgroundColor: category.color }}
      />
      {/* Accent Glow */}
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full blur-2xl opacity-20"
        style={{ backgroundColor: category.color }}
      />

      <div className="flex items-start justify-between z-10 w-full">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl text-lg border border-border/30 shadow-sm"
            style={{ backgroundColor: `${category.color}15`, color: category.color }}
          >
            {getIconEmoji(category.icon)}
          </div>
          <div>
            <h3 className="text-xs font-bold text-foreground leading-tight">{category.name}</h3>
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5 block">{category.type.toLowerCase()}</span>
          </div>
        </div>
        <div className="flex gap-0.5">
          <Button variant="ghost" size="icon-xs" onClick={onEdit} className="h-7 w-7 rounded-lg hover:bg-secondary">
            <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onDelete}
            className="h-7 w-7 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 border border-transparent hover:border-rose-500/20"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </GlowCard>
  )
}

function getIconEmoji(icon: string): string {
  const map: Record<string, string> = {
    tag: "🏷️",
    "shopping-cart": "🛒",
    food: "🍔",
    car: "🚗",
    home: "🏠",
    health: "🏥",
    education: "📚",
    entertainment: "🎬",
    "shopping-bag": "🛍️",
    coffee: "☕",
    gym: "💪",
    plane: "✈️",
    gift: "🎁",
    salary: "💰",
    investment: "📈",
    freelance: "💻",
    rental: "🏘️",
    other: "📦",
  }
  return map[icon] || "🏷️"
}

function CategoriesSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-40 rounded-xl" />
          <Skeleton className="mt-2 h-4 w-60 rounded-lg" />
        </div>
      </div>
      <Skeleton className="h-10 w-48 rounded-xl" />
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <GlowCard key={i} className="h-20">
            <Skeleton className="h-5 w-24 rounded-lg" />
          </GlowCard>
        ))}
      </div>
    </div>
  )
}
