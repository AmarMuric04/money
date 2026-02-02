"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { CreditCard, ArrowLeft } from "lucide-react";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard-layout";
import { Button, DashboardWrapper, useToast } from "@repo/ui";
import { useUpdateSubscription } from "@/hooks";
import { useDashboardData } from "@/hooks";
import type { Subscription } from "@/stores";

const subscriptionCategories = [
  { value: "streaming", label: "Streaming" },
  { value: "software", label: "Software" },
  { value: "gaming", label: "Gaming" },
  { value: "music", label: "Music" },
  { value: "cloud", label: "Cloud Storage" },
  { value: "fitness", label: "Fitness" },
  { value: "news", label: "News & Media" },
  { value: "other", label: "Other" },
];

const frequencies = [
  { value: "monthly" as const, label: "Monthly" },
  { value: "yearly" as const, label: "Yearly" },
];

export default function EditSubscriptionPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const updateSubscription = useUpdateSubscription();
  const { addToast } = useToast();
  const { data } = useDashboardData();

  const subscription = data?.subscriptions?.find(
    (s: Subscription) => s.id === id,
  );

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("streaming");
  const [frequency, setFrequency] = useState<"monthly" | "yearly">("monthly");
  const [nextBillingDate, setNextBillingDate] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form when subscription is loaded
  useEffect(() => {
    if (subscription) {
      setName(subscription.name);
      setAmount(subscription.amount.toString());
      setCategory(subscription.category || "streaming");
      setFrequency(
        (subscription.frequency as "monthly" | "yearly") || "monthly",
      );
      setNextBillingDate(subscription.nextBillingDate);
      setNote(subscription.note || "");
    }
  }, [subscription]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setIsLoading(true);
    try {
      await updateSubscription.mutateAsync({
        id,
        name: name.trim(),
        amount: parsedAmount,
        category,
        frequency,
        nextBillingDate,
        note: note.trim() || undefined,
      });

      addToast({
        type: "success",
        title: "Subscription updated",
        message: `"${name.trim()}" has been updated successfully`,
      });

      router.push("/subscriptions");
    } catch {
      addToast({
        type: "error",
        title: "Failed to update subscription",
        message: "Please try again.",
      });
      setError("Failed to update subscription. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!subscription) {
    return (
      <DashboardLayout>
        <DashboardWrapper>
          <div className="max-w-4xl mx-auto pb-6">
            <Link
              href="/subscriptions"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Subscriptions
            </Link>
            <p className="text-muted-foreground">Subscription not found</p>
          </div>
        </DashboardWrapper>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardWrapper>
        <div className="max-w-4xl mx-auto pb-6">
          {/* Back Button */}
          <Link
            href="/subscriptions"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Subscriptions
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Edit Subscription
            </h1>
            <p className="text-muted-foreground text-lg">
              Update subscription details
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive">
                {error}
              </div>
            )}

            {/* Subscription Details */}
            <div className="bg-card rounded-3xl border shadow-sm p-8 space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-orange-500/10 rounded-2xl">
                  <CreditCard className="h-5 w-5 text-orange-500" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">
                  Subscription Details
                </h2>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Netflix, Spotify, Adobe"
                  className="w-full h-12 px-4 border border-input rounded-2xl bg-transparent focus:outline-none focus-visible:border-primary focus-visible:ring-primary/20 focus-visible:ring-[3px] transition-all"
                />
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Amount <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full h-12 pl-8 pr-4 border border-input rounded-2xl bg-transparent focus:outline-none focus-visible:border-primary focus-visible:ring-primary/20 focus-visible:ring-[3px] transition-all"
                  />
                </div>
              </div>

              {/* Frequency */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Billing Cycle
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {frequencies.map((freq) => (
                    <button
                      key={freq.value}
                      type="button"
                      onClick={() => setFrequency(freq.value)}
                      className={`p-3 rounded-xl border text-sm font-medium transition-colors cursor-pointer ${
                        frequency === freq.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      {freq.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {subscriptionCategories.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setCategory(cat.value)}
                      className={`p-3 rounded-xl border text-sm font-medium transition-colors cursor-pointer ${
                        category === cat.value
                          ? "border-orange-500 bg-orange-500/10 text-orange-600"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Next Billing Date */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Next Billing Date
                </label>
                <input
                  type="date"
                  value={nextBillingDate}
                  onChange={(e) => setNextBillingDate(e.target.value)}
                  className="w-full h-12 px-4 border border-input rounded-2xl bg-transparent focus:outline-none focus-visible:border-primary focus-visible:ring-primary/20 focus-visible:ring-[3px] transition-all"
                />
              </div>

              {/* Note */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Note <span className="text-muted-foreground">(optional)</span>
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Any additional details..."
                  rows={3}
                  className="w-full px-4 py-3 border border-input rounded-2xl bg-transparent resize-none focus:outline-none focus-visible:border-primary focus-visible:ring-primary/20 focus-visible:ring-[3px] transition-all"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 sticky bottom-0 bg-background pt-4 pb-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/subscriptions")}
                className="flex-1 h-12 rounded-2xl text-base font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isLoading}
                className="flex-1 h-12 rounded-2xl text-base font-semibold shadow-lg shadow-primary/20"
              >
                Update Subscription
              </Button>
            </div>
          </form>
        </div>
      </DashboardWrapper>
    </DashboardLayout>
  );
}
