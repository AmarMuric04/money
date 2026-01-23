"use client";

import Link from "next/link";
import {
  TrendingDown,
  Plus,
  ShoppingBag,
  Utensils,
  Car,
  Home,
  Zap,
  MoreHorizontal,
  Gamepad2,
  Heart,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";
import { Button, DashboardWrapper, Skeleton } from "@repo/ui";
import { formatCurrency } from "@/lib/utils";
import { useFinanceStore, type Expense, type ExpenseCategory } from "@/stores";
import { useHydration } from "@/hooks";

// Category configuration
const categoryConfig: Record<
  ExpenseCategory,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bg: string;
  }
> = {
  food: {
    label: "Food & Dining",
    icon: Utensils,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  transport: {
    label: "Transport",
    icon: Car,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  shopping: {
    label: "Shopping",
    icon: ShoppingBag,
    color: "text-pink-500",
    bg: "bg-pink-500/10",
  },
  housing: {
    label: "Housing",
    icon: Home,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  utilities: {
    label: "Utilities",
    icon: Zap,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
  },
  entertainment: {
    label: "Entertainment",
    icon: Gamepad2,
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
  },
  health: {
    label: "Health",
    icon: Heart,
    color: "text-red-500",
    bg: "bg-red-500/10",
  },
  other: {
    label: "Other",
    icon: MoreHorizontal,
    color: "text-gray-500",
    bg: "bg-gray-500/10",
  },
};

export default function ExpensesPage() {
  const isHydrated = useHydration();
  const { expenses } = useFinanceStore();

  // Calculate totals
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Group by category for summary
  const expensesByCategory = expenses.reduce(
    (acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    },
    {} as Record<ExpenseCategory, number>,
  );

  // Get this month's expenses
  const thisMonth = new Date().toISOString().slice(0, 7);
  const thisMonthExpenses = expenses.filter((e) =>
    e.date.startsWith(thisMonth),
  );
  const thisMonthTotal = thisMonthExpenses.reduce(
    (sum, e) => sum + e.amount,
    0,
  );

  // Loading skeleton
  if (!isHydrated) {
    return (
      <DashboardLayout>
        <DashboardWrapper className="space-y-8">
          {/* Header Skeleton */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-9 w-32" />
              <Skeleton className="h-6 w-56" />
            </div>
            <Skeleton className="h-11 w-36 rounded-2xl" />
          </div>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-5 rounded-3xl border bg-card shadow-sm"
              >
                <Skeleton className="h-12 w-12 rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
            ))}
          </div>

          {/* Category Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-7 w-28" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl border bg-card shadow-sm flex flex-col items-center"
                >
                  <Skeleton className="h-10 w-10 rounded-xl mb-2" />
                  <Skeleton className="h-3 w-16 mb-1" />
                  <Skeleton className="h-5 w-14" />
                </div>
              ))}
            </div>
          </div>

          {/* Expenses List Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-7 w-36" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-5 rounded-3xl border bg-card shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-2xl" />
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                  </div>
                  <Skeleton className="h-7 w-24" />
                </div>
              ))}
            </div>
          </div>
        </DashboardWrapper>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardWrapper className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Expenses</h1>
            <p className="text-muted-foreground text-lg">
              Track where your money goes
            </p>
          </div>
          <Button
            asChild
            className="rounded-2xl h-11 px-6 shadow-lg shadow-primary/20"
          >
            <Link href="/expenses/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-4 p-5 rounded-3xl border bg-card shadow-sm">
            <div className="h-12 w-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <p className="text-2xl font-bold">
                {formatCurrency(totalExpenses)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-5 rounded-3xl border bg-card shadow-sm">
            <div className="h-12 w-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">This Month</p>
              <p className="text-2xl font-bold">
                {formatCurrency(thisMonthTotal)}
              </p>
            </div>
          </div>
        </div>

        {/* Category Breakdown - only show if there are expenses */}
        {expenses.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">By Category</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {(Object.keys(categoryConfig) as ExpenseCategory[]).map((cat) => {
                const config = categoryConfig[cat];
                const amount = expensesByCategory[cat] || 0;
                const Icon = config.icon;
                return (
                  <div
                    key={cat}
                    className="p-4 rounded-2xl border bg-card shadow-sm text-center"
                  >
                    <div
                      className={`h-10 w-10 rounded-xl ${config.bg} flex items-center justify-center mx-auto mb-2`}
                    >
                      <Icon className={`h-5 w-5 ${config.color}`} />
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">
                      {config.label}
                    </p>
                    <p className="font-semibold">{formatCurrency(amount)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Expenses List or Empty State */}
        {expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border rounded-3xl bg-card shadow-sm">
            <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold">No expenses recorded</h3>
            <p className="text-muted-foreground mt-1 mb-4 max-w-md">
              Start logging your expenses to understand your spending habits and
              find opportunities to save.
            </p>
            <Button
              asChild
              className="rounded-2xl h-11 px-6 shadow-lg shadow-primary/20"
            >
              <Link href="/expenses/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Expense
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Recent Expenses</h2>
            <div className="space-y-3">
              {expenses.map((expense) => (
                <ExpenseCard key={expense.id} expense={expense} />
              ))}
            </div>
          </div>
        )}
      </DashboardWrapper>
    </DashboardLayout>
  );
}

// Expense Card Component
function ExpenseCard({ expense }: { expense: Expense }) {
  const config = categoryConfig[expense.category];
  const Icon = config.icon;

  return (
    <div className="flex items-center justify-between p-5 rounded-3xl border bg-card shadow-sm">
      <div className="flex items-center gap-4">
        <div
          className={`h-12 w-12 rounded-2xl ${config.bg} flex items-center justify-center`}
        >
          <Icon className={`h-6 w-6 ${config.color}`} />
        </div>
        <div>
          <h3 className="font-semibold">{expense.name}</h3>
          <p className="text-sm text-muted-foreground">
            {config.label} • {expense.date}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xl font-bold text-red-600">
          -{formatCurrency(expense.amount)}
        </p>
      </div>
    </div>
  );
}
