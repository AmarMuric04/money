"use client";

import Link from "next/link";
import { Plus, ChevronDown, Edit, Trash2, MoreVertical } from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";
import {
  Button,
  DashboardWrapper,
  Skeleton,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  useToast,
} from "@repo/ui";
import { formatCurrency, cn, formatDate } from "@/lib/utils";
import { useDashboardData } from "@/hooks";
import type { Expense, ExpenseCategory } from "@/stores";
import { useState } from "react";
import { useFinanceStore } from "@/stores";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/hooks/use-finance";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { SectionHeader } from "@/components/ui/section-header";

// Category labels
const categoryConfig: Record<ExpenseCategory, { label: string }> = {
  food: { label: "Food & dining" },
  transport: { label: "Transport" },
  shopping: { label: "Shopping" },
  housing: { label: "Housing" },
  utilities: { label: "Utilities" },
  entertainment: { label: "Entertainment" },
  health: { label: "Health" },
  other: { label: "Other" },
};

export default function ExpensesPage() {
  const { data, isLoading } = useDashboardData();
  const expenses = data?.expenses ?? [];
  const [categoryOpen, setCategoryOpen] = useState(true);

  // Calculate totals
  const totalExpenses = expenses.reduce(
    (sum: number, e: Expense) => sum + e.amount,
    0,
  );

  // Group by category for summary
  const expensesByCategory = expenses.reduce(
    (acc: Record<ExpenseCategory, number>, expense: Expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    },
    {} as Record<ExpenseCategory, number>,
  );

  // Get this month's expenses
  const thisMonth = new Date().toISOString().slice(0, 7);
  const thisMonthExpenses = expenses.filter((e: Expense) =>
    e.date.startsWith(thisMonth),
  );
  const thisMonthTotal = thisMonthExpenses.reduce(
    (sum: number, e: Expense) => sum + e.amount,
    0,
  );

  // Loading skeleton
  if (isLoading) {
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
                className="flex items-center gap-4 p-5 rounded-2xl border bg-card"
              >
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
            <div className="grid gap-x-10 gap-y-4 rounded-2xl border bg-card p-5 sm:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-16" />
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
                  className="flex items-center justify-between p-5 rounded-2xl border bg-card"
                >
                  <div className="flex items-center gap-4">
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
              Everything you spend, sorted into eight categories
            </p>
          </div>
          <Button asChild className="rounded-xl h-11 px-6">
            <Link href="/expenses/new">
              <Plus className="mr-2 h-4 w-4" />
              Add expense
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl border bg-card">
            <div>
              <p className="text-sm text-muted-foreground">Total expenses</p>
              <p className="text-2xl font-bold">
                {formatCurrency(totalExpenses)}
              </p>
            </div>
          </div>
          <div className="p-5 rounded-2xl border bg-card">
            <div>
              <p className="text-sm text-muted-foreground">This month</p>
              <p className="text-2xl font-bold">
                {formatCurrency(thisMonthTotal)}
              </p>
            </div>
          </div>
        </div>

        {/* Category Breakdown - Collapsible */}
        {expenses.length > 0 && (
          <Collapsible
            open={categoryOpen}
            onOpenChange={setCategoryOpen}
            className="space-y-4"
          >
            <CollapsibleTrigger asChild>
              <button className="flex items-center gap-3 w-full group">
                <h2 className="text-lg font-semibold text-foreground">
                  By category
                </h2>
                <div className="flex-1 h-px bg-border" />
                <span className="text-sm text-muted-foreground font-medium">
                  {Object.keys(expensesByCategory).length} categories
                </span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 text-muted-foreground transition-transform duration-200",
                    categoryOpen && "rotate-180",
                  )}
                />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
              <dl className="grid gap-x-10 rounded-2xl border bg-card px-5 py-2 sm:grid-cols-2">
                {(Object.keys(categoryConfig) as ExpenseCategory[]).map(
                  (cat) => (
                    <div
                      key={cat}
                      className="flex items-baseline justify-between gap-4 border-b border-border py-3 last:border-b-0 sm:[&:nth-last-child(2)]:border-b-0"
                    >
                      <dt className="text-sm text-muted-foreground">
                        {categoryConfig[cat].label}
                      </dt>
                      <dd className="font-semibold tabular-nums">
                        {formatCurrency(expensesByCategory[cat] || 0)}
                      </dd>
                    </div>
                  ),
                )}
              </dl>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Expenses List or Empty State */}
        {expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border rounded-2xl bg-card">
            <h3 className="text-lg font-semibold">No expenses recorded</h3>
            <p className="text-muted-foreground mt-1 mb-4 max-w-md">
              Log what you spend and pick a category for each one. The totals
              per category show up here.
            </p>
            <Button asChild className="rounded-xl h-11 px-6">
              <Link href="/expenses/new">
                <Plus className="mr-2 h-4 w-4" />
                Add your first expense
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <SectionHeader
              title="All expenses"
              count={expenses.length}
              countLabel={expenses.length === 1 ? "expense" : "expenses"}
            />
            <div className="space-y-3">
              {expenses.map((expense: Expense) => (
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
  const { deleteExpense } = useFinanceStore();
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const config = categoryConfig[expense.category];

  const handleDelete = async () => {
    try {
      await deleteExpense(expense.id);
      // Invalidate dashboard query to refetch fresh data
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      addToast({
        type: "success",
        title: "Expense deleted",
        message: `"${expense.name}" has been deleted`,
      });
    } catch (error) {
      console.error("Failed to delete expense:", error);
      addToast({
        type: "error",
        title: "Failed to delete",
        message: "Please try again.",
      });
    }
  };

  return (
    <div className="flex items-center justify-between p-5 rounded-2xl border bg-card hover:bg-muted/50 transition-colors">
      <div className="min-w-0">
        <h3 className="font-semibold">{expense.name}</h3>
        <p className="text-sm text-muted-foreground">{config.label}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-xl font-bold text-red-600">
            -{formatCurrency(expense.amount)}
          </p>
          <p className="text-sm text-muted-foreground">
            {formatDate(expense.date)}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-2xl transition-all">
              <MoreVertical className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-lg">
            <DropdownMenuItem asChild>
              <Link href={`/expenses/${expense.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
