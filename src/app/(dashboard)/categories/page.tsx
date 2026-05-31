"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertTriangle,
  Tag,
} from "lucide-react"
import { toast } from "sonner"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
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
  { value: "shopping-bag", label: "🛍️ Shopping" },
  { value: "coffee", label: "☕ Coffee" },
  { value: "gym", label: "💪 Fitness" },
  { value: "plane", label: "✈️ Travel" },
  { value: "gift", label: "🎁 Gift" },
  { value: "salary", label: "💰 Salary" },
  { value: "investment", label: "📈 Investment" },
  { value: "freelance", label: "💻 Freelance" },
  { value: "rental", label: "🏘️ Rental" },
  { value: "other", label: "📦 Other" },
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
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-40" />
            <Skeleton className="mt-2 h-4 w-52" />
          </div>
          <Skeleton className="h-9 w-36" />
        </div>
        <Skeleton className="h-10 w-72" />
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="mb-4 h-12 w-12 text-red-400" />
        <h2 className="text-xl font-semibold text-foreground">Failed to load categories</h2>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        <Button className="mt-6" onClick={fetchCategories}>
          Try again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Categories</h1>
          <p className="text-sm text-muted-foreground">Organize your transactions with categories</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="expense">Expense</TabsTrigger>
            <TabsTrigger value="income">Income</TabsTrigger>
          </TabsList>
          <Button
            onClick={() =>
              openAddDialog(activeTab === "expense" ? "EXPENSE" : "INCOME")
            }
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add {activeTab === "expense" ? "Expense" : "Income"} Category
          </Button>
        </div>

        <TabsContent value="expense" className="mt-4">
          {expenseCategories.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <Tag className="mb-3 h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-medium text-foreground">No expense categories</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Create categories to track your spending.
              </p>
              <Button className="mt-4" onClick={() => openAddDialog("EXPENSE")}>
                <Plus className="mr-1.5 h-4 w-4" />
                Add Category
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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

        <TabsContent value="income" className="mt-4">
          {incomeCategories.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <Tag className="mb-3 h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-medium text-foreground">No income categories</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Create categories to track your income.
              </p>
              <Button className="mt-4" onClick={() => openAddDialog("INCOME")}>
                <Plus className="mr-1.5 h-4 w-4" />
                Add Category
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Category" : "Add Category"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Update the category details." : "Create a new category for your transactions."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {/* Name */}
            <div>
              <Label htmlFor="catName">Category Name</Label>
              <Input
                id="catName"
                placeholder="e.g. Groceries"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            {/* Type */}
            <div>
              <Label>Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) => {
                  if (v === "INCOME" || v === "EXPENSE") setForm({ ...form, type: v })
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EXPENSE">Expense</SelectItem>
                  <SelectItem value="INCOME">Income</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Icon */}
            <div>
              <Label>Icon</Label>
              <Select value={form.icon}                onValueChange={(v) => {
                  const val = v as string
                  setForm({ ...form, icon: val })
                }}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ICON_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Color */}
            <div>
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setForm({ ...form, color })}
                    className={`h-8 w-8 rounded-lg ring-2 ring-offset-2 ring-offset-background transition-all hover:scale-110 ${
                      form.color === color ? "ring-foreground scale-110" : "ring-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              {editingId ? "Update" : "Create"}
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
    <Card
      className="relative overflow-hidden border-0 bg-card/60 backdrop-blur-sm ring-1 transition-all hover:scale-[1.02]"
      style={{ "--tw-ring-color": `${category.color}40` } as React.CSSProperties}
    >
      {/* Color accent top */}
      <div
        className="absolute left-0 top-0 h-1 w-full"
        style={{ backgroundColor: category.color }}
      />
      {/* Glow */}
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full blur-2xl"
        style={{ backgroundColor: `${category.color}15` }}
      />

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-lg"
              style={{ backgroundColor: `${category.color}20` }}
            >
              <span>{getIconEmoji(category.icon)}</span>
            </div>
            <div>
              <CardTitle className="text-sm text-foreground">{category.name}</CardTitle>
              <CardDescription className="text-xs capitalize">{category.type.toLowerCase()}</CardDescription>
            </div>
          </div>
          <div className="flex gap-0.5">
            <Button variant="ghost" size="icon-xs" onClick={onEdit}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={onDelete}
              className="text-red-400 hover:text-red-300"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
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
