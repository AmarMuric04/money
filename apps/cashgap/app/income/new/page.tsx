"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, ArrowLeft } from "lucide-react";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard-layout";
import { Button, DashboardWrapper } from "@repo/ui";
import { useFinanceStore, type IncomeCategory } from "@/stores";

const incomeCategories: { value: IncomeCategory; label: string }[] = [
  { value: "salary", label: "Salary" },
  { value: "freelance", label: "Freelance" },
  { value: "investment", label: "Investment" },
  { value: "rental", label: "Rental Income" },
  { value: "gift", label: "Gift" },
  { value: "other", label: "Other" },
];

const frequencies = [
  { value: "once" as const, label: "One-time" },
  { value: "monthly" as const, label: "Monthly" },
  { value: "yearly" as const, label: "Yearly" },
];

export default function NewIncomePage() {
  const router = useRouter();
  const { addIncome } = useFinanceStore();

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<IncomeCategory>("salary");
  const [frequency, setFrequency] = useState<"once" | "monthly" | "yearly">(
    "monthly",
  );
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0] ?? "",
  );
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

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

    setIsSubmitting(true);
    try {
      addIncome({
        name: name.trim(),
        amount: parsedAmount,
        category,
        frequency,
        date,
        note: note.trim() || undefined,
      });

      router.push("/income");
    } catch {
      setError("Failed to add income. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <DashboardWrapper>
        <div className="max-w-4xl mx-auto pb-6">
          {/* Back Button */}
          <Link
            href="/income"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Income
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Add Income
            </h1>
            <p className="text-muted-foreground text-lg">
              Record a new income source
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive">
                {error}
              </div>
            )}

            {/* Income Details */}
            <div className="bg-card rounded-3xl border shadow-sm p-8 space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-green-500/10 rounded-2xl">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">
                  Income Details
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
                  placeholder="e.g., Monthly Salary, Client Project"
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

              {/* Category */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {incomeCategories.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setCategory(cat.value)}
                      className={`p-3 rounded-xl border text-sm font-medium transition-colors cursor-pointer ${
                        category === cat.value
                          ? "border-green-500 bg-green-500/10 text-green-600"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Frequency */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Frequency
                </label>
                <div className="grid grid-cols-3 gap-2">
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

              {/* Date */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
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
                  className="w-full px-4 py-3 border border-input rounded-2xl bg-transparent focus:outline-none focus-visible:border-primary focus-visible:ring-primary/20 focus-visible:ring-[3px] transition-all resize-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 sticky bottom-0 bg-background pt-4 pb-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1 h-12 rounded-2xl text-base font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 h-12 rounded-2xl text-base font-semibold shadow-lg shadow-primary/20"
              >
                {isSubmitting ? "Adding..." : "Add Income"}
              </Button>
            </div>
          </form>
        </div>
      </DashboardWrapper>
    </DashboardLayout>
  );
}
