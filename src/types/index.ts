export type TransactionType = "INCOME" | "EXPENSE"
export type RecurringInterval = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY"

export interface DashboardData {
  totalBalance: number
  monthlyIncome: number
  monthlyExpense: number
  recentTransactions: TransactionData[]
  categoryBreakdown: CategoryBreakdown[]
  monthlyTrend: MonthlyTrend[]
  budgetProgress: BudgetProgress[]
}

export interface TransactionData {
  id: string
  amount: number
  type: TransactionType
  description: string | null
  date: Date
  category: { id: string; name: string; icon: string; color: string }
  wallet: { id: string; name: string; icon: string; color: string }
}

export interface CategoryBreakdown {
  name: string
  icon: string
  color: string
  total: number
  percentage: number
}

export interface MonthlyTrend {
  month: string
  income: number
  expense: number
}

export interface BudgetProgress {
  id: string
  categoryName: string
  categoryIcon: string
  categoryColor: string
  budgetAmount: number
  spentAmount: number
  percentage: number
  period: string
}
