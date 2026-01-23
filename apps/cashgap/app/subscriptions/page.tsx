"use client";

import Link from "next/link";
import {
  CreditCard,
  Plus,
  Calendar,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";
import { Button, DashboardWrapper, Skeleton } from "@repo/ui";
import { formatCurrency } from "@/lib/utils";
import { useDashboardData } from "@/hooks";
import type { Subscription } from "@/stores";
import { SectionHeader } from "@/components/ui/section-header";

export default function SubscriptionsPage() {
  const { data, isLoading } = useDashboardData();
  const subscriptions = data?.subscriptions ?? [];

  // Calculate totals
  const activeSubscriptions = subscriptions.filter(
    (s: Subscription) => s.active,
  );
  const monthlyTotal = activeSubscriptions.reduce(
    (sum: number, s: Subscription) => {
      return sum + (s.frequency === "yearly" ? s.amount / 12 : s.amount);
    },
    0,
  );
  const yearlyTotal = monthlyTotal * 12;

  // Find upcoming renewals (next 7 days)
  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcomingRenewals = activeSubscriptions.filter((s: Subscription) => {
    const billingDate = new Date(s.nextBillingDate);
    return billingDate >= today && billingDate <= nextWeek;
  });

  // Loading skeleton
  if (isLoading) {
    return (
      <DashboardLayout>
        <DashboardWrapper className="space-y-8">
          {/* Header Skeleton */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-9 w-44" />
              <Skeleton className="h-6 w-56" />
            </div>
            <Skeleton className="h-11 w-44 rounded-2xl" />
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
                  <Skeleton className="h-8 w-28" />
                </div>
              </div>
            ))}
          </div>

          {/* Subscriptions List Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-7 w-40" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-5 rounded-3xl border bg-card shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-2xl" />
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-28" />
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
            <h1 className="text-3xl font-bold mb-2">Subscriptions</h1>
            <p className="text-muted-foreground text-lg">
              Manage your recurring payments
            </p>
          </div>
          <Button
            asChild
            className="rounded-2xl h-11 px-6 shadow-lg shadow-primary/20"
          >
            <Link href="/subscriptions/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Subscription
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-4 p-5 rounded-3xl border bg-card shadow-sm">
            <div className="h-12 w-12 rounded-2xl bg-orange-500/10 flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Monthly Cost</p>
              <p className="text-2xl font-bold">
                {formatCurrency(monthlyTotal)}
                <span className="text-sm font-normal text-muted-foreground">
                  /mo
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-5 rounded-3xl border bg-card shadow-sm">
            <div className="h-12 w-12 rounded-2xl bg-purple-500/10 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Yearly Cost</p>
              <p className="text-2xl font-bold">
                {formatCurrency(yearlyTotal)}
                <span className="text-sm font-normal text-muted-foreground">
                  /yr
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-5 rounded-3xl border bg-card shadow-sm">
            <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-2xl font-bold">
                {activeSubscriptions.length}
                <span className="text-sm font-normal text-muted-foreground">
                  {" "}
                  subscription{activeSubscriptions.length !== 1 ? "s" : ""}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Upcoming Renewals Alert */}
        {upcomingRenewals.length > 0 && (
          <div className="flex items-center gap-4 p-5 rounded-3xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="font-semibold text-amber-800 dark:text-amber-200">
                Upcoming Renewals
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                {upcomingRenewals.length} subscription
                {upcomingRenewals.length !== 1 ? "s" : ""} renewing in the next
                7 days
              </p>
            </div>
          </div>
        )}

        {/* Subscriptions List or Empty State */}
        {subscriptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border rounded-3xl bg-card shadow-sm">
            <div className="h-16 w-16 rounded-full bg-orange-500/10 flex items-center justify-center mb-4">
              <CreditCard className="h-8 w-8 text-orange-500" />
            </div>
            <h3 className="text-lg font-semibold">No subscriptions yet</h3>
            <p className="text-muted-foreground mt-1 mb-4 max-w-md">
              Add your streaming services, software licenses, gym memberships,
              and other recurring payments to never miss a billing date.
            </p>
            <Button
              asChild
              className="rounded-2xl h-11 px-6 shadow-lg shadow-primary/20"
            >
              <Link href="/subscriptions/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Subscription
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <SectionHeader
              icon={<CreditCard className="h-5 w-5 text-orange-500" />}
              title="All Subscriptions"
              count={subscriptions.length}
              countLabel={subscriptions.length === 1 ? "subscription" : "subscriptions"}
            />
            <div className="space-y-3">
              {subscriptions.map((subscription: Subscription) => (
                <SubscriptionCard
                  key={subscription.id}
                  subscription={subscription}
                />
              ))}
            </div>
          </div>
        )}
      </DashboardWrapper>
    </DashboardLayout>
  );
}

// Subscription Card Component
function SubscriptionCard({ subscription }: { subscription: Subscription }) {
  const nextBilling = new Date(subscription.nextBillingDate);
  const formattedDate = nextBilling.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <div className="flex items-center justify-between p-5 rounded-3xl border bg-card shadow-sm">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-orange-500/10 flex items-center justify-center">
          <CreditCard className="h-6 w-6 text-orange-500" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{subscription.name}</h3>
            {!subscription.active && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                Paused
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {subscription.frequency === "monthly" ? "Monthly" : "Yearly"} •
            Next: {formattedDate}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xl font-bold text-orange-600">
          {formatCurrency(subscription.amount)}
          <span className="text-sm font-normal text-muted-foreground">
            /{subscription.frequency === "monthly" ? "mo" : "yr"}
          </span>
        </p>
      </div>
    </div>
  );
}
