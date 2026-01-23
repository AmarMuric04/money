"use client";

import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  CreditCard,
  Plus,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";
import { Button, DashboardWrapper, Skeleton } from "@repo/ui";
import { formatCurrency } from "@/lib/utils";
import { useFinanceStore } from "@/stores";
import { useHydration } from "@/hooks";

export default function Dashboard() {
  const isHydrated = useHydration();
  const { incomes, expenses, subscriptions } = useFinanceStore();

  // Calculate totals
  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const monthlySubscriptions = subscriptions
    .filter((s) => s.active)
    .reduce((sum, s) => {
      return sum + (s.frequency === "yearly" ? s.amount / 12 : s.amount);
    }, 0);
  const balance = totalIncome - totalExpenses - monthlySubscriptions;

  // Loading skeleton
  if (!isHydrated) {
    return (
      <DashboardLayout>
        <DashboardWrapper className="space-y-8">
          {/* Header Skeleton */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-9 w-48" />
              <Skeleton className="h-6 w-72" />
            </div>
            <Skeleton className="h-11 w-40 rounded-2xl" />
          </div>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
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

          {/* Quick Actions Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-7 w-32" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-5 bg-card rounded-3xl border shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-2xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-28" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  </div>
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
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground text-lg">
              Your financial overview at a glance
            </p>
          </div>
          <Button
            asChild
            className="rounded-2xl h-11 px-6 shadow-lg shadow-primary/20"
          >
            <Link href="/income/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Transaction
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Balance"
            value={balance}
            icon={Wallet}
            iconColor="text-primary"
            iconBg="bg-primary/10"
          />
          <StatCard
            label="Total Income"
            value={totalIncome}
            icon={TrendingUp}
            iconColor="text-green-500"
            iconBg="bg-green-500/10"
          />
          <StatCard
            label="Total Expenses"
            value={totalExpenses}
            icon={TrendingDown}
            iconColor="text-red-500"
            iconBg="bg-red-500/10"
          />
          <StatCard
            label="Subscriptions"
            value={monthlySubscriptions}
            icon={CreditCard}
            iconColor="text-orange-500"
            iconBg="bg-orange-500/10"
            suffix="/mo"
          />
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <QuickActionCard
              href="/income/new"
              title="Add Income"
              description="Record salary, freelance, or other income"
              icon={TrendingUp}
              iconColor="text-green-500"
              iconBg="bg-green-500/10"
            />
            <QuickActionCard
              href="/expenses/new"
              title="Add Expense"
              description="Track where your money goes"
              icon={TrendingDown}
              iconColor="text-red-500"
              iconBg="bg-red-500/10"
            />
            <QuickActionCard
              href="/subscriptions/new"
              title="Add Subscription"
              description="Manage recurring payments"
              icon={CreditCard}
              iconColor="text-orange-500"
              iconBg="bg-orange-500/10"
            />
          </div>
        </div>

        {/* Empty State */}
        {incomes.length === 0 &&
          expenses.length === 0 &&
          subscriptions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center border rounded-3xl bg-card shadow-sm">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Wallet className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No transactions yet</h3>
              <p className="text-muted-foreground mt-1 mb-4 max-w-md">
                Start by adding your income sources, expenses, or subscriptions
                to get a clear picture of your finances.
              </p>
              <Button
                asChild
                className="rounded-2xl h-11 px-6 shadow-lg shadow-primary/20"
              >
                <Link href="/income/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Transaction
                </Link>
              </Button>
            </div>
          )}
      </DashboardWrapper>
    </DashboardLayout>
  );
}

// Stat Card Component
function StatCard({
  label,
  value,
  icon: Icon,
  iconColor,
  iconBg,
  suffix = "",
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  iconBg: string;
  suffix?: string;
}) {
  return (
    <div className="flex items-center gap-4 p-5 rounded-3xl border bg-card shadow-sm">
      <div
        className={`h-12 w-12 rounded-2xl flex items-center justify-center ${iconBg}`}
      >
        <Icon className={`h-6 w-6 ${iconColor}`} />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold">
          {formatCurrency(value)}
          {suffix && (
            <span className="text-sm font-normal text-muted-foreground">
              {suffix}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

// Quick Action Card Component
function QuickActionCard({
  href,
  title,
  description,
  icon: Icon,
  iconColor,
  iconBg,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  iconBg: string;
}) {
  return (
    <Link
      href={href}
      className="group relative p-5 bg-card rounded-3xl border hover:border-primary transition-all shadow-sm hover:shadow-md"
    >
      <div className="flex items-center gap-4">
        <div
          className={`h-12 w-12 rounded-2xl flex items-center justify-center ${iconBg} group-hover:scale-105 transition-transform`}
        >
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </Link>
  );
}
