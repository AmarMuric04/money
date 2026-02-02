"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { TrendingDown, ArrowLeft } from "lucide-react";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard-layout";
import { Button, DashboardWrapper, useToast } from "@repo/ui";
import { useUpdateExpense } from "@/hooks";
import { useDashboardData } from "@/hooks";
import type { ExpenseCategory, Expense } from "@/stores";

const expenseCategories: { value: ExpenseCategory; label: string }[] = [
  { value: "food", label: "Food & Dining" },
  { value: "transport", label: "Transport" },
  { value: "shopping", label: "Shopping" },
  { value: "housing", label: "Housing" },
  { value: "utilities", label: "Utilities" },
  { value: "entertainment", label: "Entertainment" },
  { value: "health", label: "Health" },
  { value: "other", label: "Other" },
];

export default function EditExpensePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const updateExpense = useUpdateExpense();
  const { addToast } = useToast();
  const { data } = useDashboardData();

  const expense = data?.expenses?.find((e: Expense) => e.id === id);

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("food");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form when expense is loaded
  useEffect(() => {
    if (expense) {
      setName(expense.name);
      setAmount(expense.amount.toString());
      setCategory(expense.category);
      setDate(expense.date);
      setNote(expense.note || "");
    }
  }, [expense]);

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
      await updateExpense.mutateAsync({
        id,
        name: name.trim(),
        amount: parsedAmount,
        category,
        date,
        note: note.trim() || undefined,
      });

      addToast({
        type: "success",
        title: "Expense updated",
        message: `"${name.trim()}" has been updated successfully`,
      });

      router.push("/expenses");
    } catch {
      addToast({
        type: "error",
        title: "Failed to update expense",
        message: "Please try again.",
      });
      setError("Failed to update expense. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!expense) {
    return (
      <DashboardLayout>
        <DashboardWrapper>
          <div className="max-w-4xl mx-auto pb-6">
            <Link
              href="/expenses"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Expenses
            </Link>
            <p className="text-muted-foreground">Expense not found</p>
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
            href="/expenses"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Expenses
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Edit Expense
            </h1>
            <p className="text-muted-foreground text-lg">
              Update expense details
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive">
                {error}
              </div>
            )}

            {/* Expense Details */}
            <div className="bg-card rounded-3xl border shadow-sm p-8 space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-red-500/10 rounded-2xl">
                  <TrendingDown className="h-5 w-5 text-red-500" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">
                  Expense Details
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
                  placeholder="e.g., Grocery shopping, Gas, Coffee"
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
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {expenseCategories.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setCategory(cat.value)}
                      className={`p-3 rounded-xl border text-sm font-medium transition-colors cursor-pointer ${
                        category === cat.value
                          ? "border-red-500 bg-red-500/10 text-red-600"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      {cat.label}
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
                  className="w-full px-4 py-3 border border-input rounded-2xl bg-transparent resize-none focus:outline-none focus-visible:border-primary focus-visible:ring-primary/20 focus-visible:ring-[3px] transition-all"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 sticky bottom-0 bg-background pt-4 pb-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/expenses")}
                className="flex-1 h-12 rounded-2xl text-base font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isLoading}
                className="flex-1 h-12 rounded-2xl text-base font-semibold shadow-lg shadow-primary/20"
              >
                Update Expense
              </Button>
            </div>
          </form>
        </div>
      </DashboardWrapper>
    </DashboardLayout>
  );
}
