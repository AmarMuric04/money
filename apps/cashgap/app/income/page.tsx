"use client";

import Link from "next/link";
import { TrendingUp, Plus, DollarSign, Calendar, Clock } from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";
import { Button, DashboardWrapper, Skeleton } from "@repo/ui";
import { formatCurrency } from "@/lib/utils";
import { useFinanceStore, type Income } from "@/stores";
import { useHydration } from "@/hooks";

export default function IncomePage() {
  const isHydrated = useHydration();
  const { incomes } = useFinanceStore();

  // Calculate totals
  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
  const monthlyIncome = incomes
    .filter((i) => i.frequency === "monthly")
    .reduce((sum, i) => sum + i.amount, 0);
  const yearlyIncome = incomes
    .filter((i) => i.frequency === "yearly")
    .reduce((sum, i) => sum + i.amount, 0);

  // Loading skeleton
  if (!isHydrated) {
    return (
      <DashboardLayout>
        <DashboardWrapper className="space-y-8">
          {/* Header Skeleton */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-9 w-32" />
              <Skeleton className="h-6 w-64" />
            </div>
            <Skeleton className="h-11 w-36 rounded-2xl" />
          </div>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
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

          {/* Income List Skeleton */}
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
                      <Skeleton className="h-4 w-48" />
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
            <h1 className="text-3xl font-bold mb-2">Income</h1>
            <p className="text-muted-foreground text-lg">
              Track and manage your income sources
            </p>
          </div>
          <Button
            asChild
            className="rounded-2xl h-11 px-6 shadow-lg shadow-primary/20"
          >
            <Link href="/income/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Income
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Total Income"
            value={totalIncome}
            icon={DollarSign}
            iconColor="text-green-500"
            iconBg="bg-green-500/10"
          />
          <StatCard
            label="Monthly Income"
            value={monthlyIncome}
            icon={Calendar}
            iconColor="text-blue-500"
            iconBg="bg-blue-500/10"
            suffix="/mo"
          />
          <StatCard
            label="Yearly Income"
            value={yearlyIncome}
            icon={Clock}
            iconColor="text-purple-500"
            iconBg="bg-purple-500/10"
            suffix="/yr"
          />
        </div>

        {/* Income List or Empty State */}
        {incomes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border rounded-3xl bg-card shadow-sm">
            <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold">No income sources yet</h3>
            <p className="text-muted-foreground mt-1 mb-4 max-w-md">
              Start tracking your salary, freelance work, investments, or any
              other income sources to get a complete picture of your earnings.
            </p>
            <Button
              asChild
              className="rounded-2xl h-11 px-6 shadow-lg shadow-primary/20"
            >
              <Link href="/income/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Income
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Income Sources</h2>
            <div className="space-y-3">
              {incomes.map((income) => (
                <IncomeCard key={income.id} income={income} />
              ))}
            </div>
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

// Income Card Component
function IncomeCard({ income }: { income: Income }) {
  const frequencyLabels = {
    once: "One-time",
    monthly: "Monthly",
    yearly: "Yearly",
  };

  return (
    <div className="flex items-center justify-between p-5 rounded-3xl border bg-card shadow-sm">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-green-500/10 flex items-center justify-center">
          <TrendingUp className="h-6 w-6 text-green-500" />
        </div>
        <div>
          <h3 className="font-semibold">{income.name}</h3>
          <p className="text-sm text-muted-foreground">
            {frequencyLabels[income.frequency]} • {income.date}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xl font-bold text-green-600">
          +{formatCurrency(income.amount)}
        </p>
      </div>
    </div>
  );
}
