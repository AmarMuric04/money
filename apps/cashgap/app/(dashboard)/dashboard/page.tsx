"use client";

import { Card, Skeleton } from "@repo/ui";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  ArrowUpDown,
  PieChart,
  ChevronDown,
} from "lucide-react";
import { useDashboardData } from "@/hooks";
import { useMemo, useState } from "react";
import type { Income, Expense, Subscription } from "@/stores";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

// Category display names and colors
const categoryConfig: Record<string, { label: string; color: string }> = {
  food: { label: "Food & Dining", color: "bg-blue-600" },
  transport: { label: "Transportation", color: "bg-green-600" },
  shopping: { label: "Shopping", color: "bg-purple-600" },
  housing: { label: "Housing", color: "bg-orange-600" },
  utilities: { label: "Utilities", color: "bg-yellow-600" },
  entertainment: { label: "Entertainment", color: "bg-pink-600" },
  health: { label: "Health", color: "bg-red-600" },
  other: { label: "Other", color: "bg-gray-600" },
};

const emptyIncomes: Income[] = [];
const emptyExpenses: Expense[] = [];
const emptySubscriptions: Subscription[] = [];

export default function DashboardPage() {
  const { data, isLoading } = useDashboardData();
  const [transactionsOpen, setTransactionsOpen] = useState(true);
  const [categoryOpen, setCategoryOpen] = useState(true);

  const incomes = data?.incomes ?? emptyIncomes;
  const expenses = data?.expenses ?? emptyExpenses;
  const subscriptions = data?.subscriptions ?? emptySubscriptions;
  const currency = data?.settings?.currency ?? "USD";

  // Calculate totals
  const stats = useMemo(() => {
    const totalIncome = incomes.reduce(
      (sum: number, i: Income) => sum + i.amount,
      0,
    );
    const totalExpenses = expenses.reduce(
      (sum: number, e: Expense) => sum + e.amount,
      0,
    );
    const activeSubscriptions = subscriptions.filter(
      (s: Subscription) => s.active,
    );
    const totalSubscriptions = activeSubscriptions.reduce(
      (sum: number, s: Subscription) => sum + s.amount,
      0,
    );
    const totalBalance = totalIncome - totalExpenses - totalSubscriptions;

    return {
      totalBalance,
      totalIncome,
      totalExpenses,
      totalSubscriptions,
      activeSubscriptionCount: activeSubscriptions.length,
    };
  }, [incomes, expenses, subscriptions]);

  // Get recent transactions (combine incomes and expenses, sorted by date)
  const recentTransactions = useMemo(() => {
    const allTransactions = [
      ...incomes.map((i: Income) => ({
        id: i.id,
        name: i.name,
        date: i.date,
        amount: i.amount,
        type: "income" as const,
      })),
      ...expenses.map((e: Expense) => ({
        id: e.id,
        name: e.name,
        date: e.date,
        amount: -e.amount,
        type: "expense" as const,
      })),
    ];

    return allTransactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [incomes, expenses]);

  // Calculate spending by category
  const spendingByCategory = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    expenses.forEach((e: Expense) => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });

    const totalSpending = Object.values(categoryTotals).reduce(
      (sum, v) => sum + v,
      0,
    );

    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalSpending > 0 ? (amount / totalSpending) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [expenses]);

  // Format currency
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your finances</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Total Balance</h3>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <div className="text-2xl font-bold">
              {formatAmount(stats.totalBalance)}
            </div>
          )}
          <p className="text-xs text-muted-foreground">Income minus expenses</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Income</h3>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <div className="text-2xl font-bold">
              {formatAmount(stats.totalIncome)}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            {incomes.length} income source{incomes.length !== 1 ? "s" : ""}
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Expenses</h3>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <div className="text-2xl font-bold">
              {formatAmount(stats.totalExpenses)}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            {expenses.length} expense{expenses.length !== 1 ? "s" : ""}
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Subscriptions</h3>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <div className="text-2xl font-bold">
              {formatAmount(stats.totalSubscriptions)}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            {stats.activeSubscriptionCount} active subscription
            {stats.activeSubscriptionCount !== 1 ? "s" : ""}
          </p>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Transactions - Collapsible */}
        <Card className="p-6">
          <Collapsible open={transactionsOpen} onOpenChange={setTransactionsOpen}>
            <CollapsibleTrigger asChild>
              <button className="flex items-center gap-3 w-full group mb-4">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Recent Transactions</h3>
                </div>
                <div className="flex-1 h-px bg-border" />
                <span className="text-sm text-muted-foreground font-medium">
                  {recentTransactions.length} {recentTransactions.length === 1 ? "transaction" : "transactions"}
                </span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 text-muted-foreground transition-transform duration-200",
                    transactionsOpen && "rotate-180",
                  )}
                />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-6 w-20" />
                    </div>
                  ))}
                </div>
              ) : recentTransactions.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No transactions yet. Add your first income or expense to get
                  started.
                </p>
              ) : (
                <div className="space-y-4">
                  {recentTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">{transaction.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(transaction.date)}
                        </p>
                      </div>
                      <span
                        className={`font-semibold ${
                          transaction.amount >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {transaction.amount >= 0 ? "+" : ""}
                        {formatAmount(Math.abs(transaction.amount))}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Spending by Category - Collapsible */}
        <Card className="p-6">
          <Collapsible open={categoryOpen} onOpenChange={setCategoryOpen}>
            <CollapsibleTrigger asChild>
              <button className="flex items-center gap-3 w-full group mb-4">
                <div className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Spending by Category</h3>
                </div>
                <div className="flex-1 h-px bg-border" />
                <span className="text-sm text-muted-foreground font-medium">
                  {spendingByCategory.length} {spendingByCategory.length === 1 ? "category" : "categories"}
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
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i}>
                      <div className="flex justify-between mb-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <Skeleton className="h-2 w-full rounded-full" />
                    </div>
                  ))}
                </div>
              ) : spendingByCategory.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No expenses yet. Add expenses to see your spending breakdown.
                </p>
              ) : (
                <div className="space-y-3">
                  {spendingByCategory.map(({ category, amount, percentage }) => (
                    <div key={category}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{categoryConfig[category]?.label || category}</span>
                        <span className="font-semibold">
                          {formatAmount(amount)}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            categoryConfig[category]?.color || "bg-gray-600"
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </Card>
      </div>
    </div>
  );
}
