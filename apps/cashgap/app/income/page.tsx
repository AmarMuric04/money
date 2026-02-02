"use client";

import Link from "next/link";
import {
  TrendingUp,
  Plus,
  DollarSign,
  Calendar,
  Clock,
  Edit,
  Trash2,
  MoreVertical,
} from "lucide-react";
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
import { formatCurrency, formatDate } from "@/lib/utils";
import { useDashboardData } from "@/hooks";
import type { Income } from "@/stores";
import { SectionHeader } from "@/components/ui/section-header";
import { useFinanceStore } from "@/stores";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/hooks/use-finance";

export default function IncomePage() {
  const { data, isLoading } = useDashboardData();
  const incomes = data?.incomes ?? [];

  // Calculate totals
  const totalIncome = incomes.reduce(
    (sum: number, i: Income) => sum + i.amount,
    0,
  );
  const monthlyIncome = incomes
    .filter((i: Income) => i.frequency === "monthly")
    .reduce((sum: number, i: Income) => sum + i.amount, 0);
  const yearlyIncome = incomes
    .filter((i: Income) => i.frequency === "yearly")
    .reduce((sum: number, i: Income) => sum + i.amount, 0);

  // Loading skeleton
  if (isLoading) {
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
            <SectionHeader
              icon={<TrendingUp className="h-5 w-5 text-green-500" />}
              title="Income Sources"
              count={incomes.length}
              countLabel={incomes.length === 1 ? "source" : "sources"}
            />
            <div className="space-y-3">
              {incomes.map((income: Income) => (
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
  const { deleteIncome } = useFinanceStore();
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const frequencyLabels = {
    once: "One-time",
    monthly: "Monthly",
    yearly: "Yearly",
  };

  const handleDelete = async () => {
    try {
      await deleteIncome(income.id);
      // Invalidate dashboard query to refetch fresh data
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      addToast({
        type: "success",
        title: "Income deleted",
        message: `"${income.name}" has been deleted`,
      });
    } catch (error) {
      console.error("Failed to delete income:", error);
      addToast({
        type: "error",
        title: "Failed to delete",
        message: "Please try again.",
      });
    }
  };

  return (
    <div className="flex items-center justify-between p-5 rounded-3xl border bg-card shadow-sm hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-green-500/10 flex items-center justify-center">
          <TrendingUp className="h-6 w-6 text-green-500" />
        </div>
        <div>
          <h3 className="font-semibold">{income.name}</h3>
          <p className="text-sm text-muted-foreground">
            {frequencyLabels[income.frequency]} • {formatDate(income.date)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-xl font-bold text-green-600">
            +{formatCurrency(income.amount)}
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
              <Link href={`/income/${income.id}/edit`}>
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
