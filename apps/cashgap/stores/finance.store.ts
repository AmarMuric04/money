"use client";

import { create } from "zustand";

// ============================================================================
// Types
// ============================================================================

export interface Income {
  id: string;
  name: string;
  amount: number;
  frequency: "once" | "monthly" | "yearly";
  date: string;
  category?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  frequency: "monthly" | "yearly";
  nextBillingDate: string;
  category?: string;
  active: boolean;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export type ExpenseCategory =
  | "food"
  | "transport"
  | "shopping"
  | "housing"
  | "utilities"
  | "entertainment"
  | "health"
  | "other";

export type IncomeCategory =
  | "salary"
  | "freelance"
  | "investment"
  | "rental"
  | "gift"
  | "other";

// ============================================================================
// Store Interface
// ============================================================================

interface FinanceState {
  // Data
  incomes: Income[];
  expenses: Expense[];
  subscriptions: Subscription[];
  currency: string;

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Data fetching
  fetchDashboardData: () => Promise<void>;

  // Income operations
  addIncome: (
    income: Omit<Income, "id" | "createdAt" | "updatedAt">,
  ) => Promise<string>;
  updateIncome: (id: string, updates: Partial<Income>) => Promise<void>;
  deleteIncome: (id: string) => Promise<void>;

  // Expense operations
  addExpense: (
    expense: Omit<Expense, "id" | "createdAt" | "updatedAt">,
  ) => Promise<string>;
  updateExpense: (id: string, updates: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;

  // Subscription operations
  addSubscription: (
    subscription: Omit<Subscription, "id" | "createdAt" | "updatedAt">,
  ) => Promise<string>;
  updateSubscription: (
    id: string,
    updates: Partial<Subscription>,
  ) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;
  toggleSubscriptionActive: (id: string) => Promise<void>;

  // Settings
  setCurrency: (currency: string) => Promise<void>;

  // Bulk operations
  clearAllData: () => Promise<void>;
  clearError: () => void;
}

// ============================================================================
// API Helper
// ============================================================================

async function apiRequest<T>(
  url: string,
  options?: RequestInit,
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error?.message || "Request failed",
      };
    }

    return { success: true, data: result.data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

// ============================================================================
// Store
// ============================================================================

export const useFinanceStore = create<FinanceState>()((set, get) => ({
  // Initial state
  incomes: [],
  expenses: [],
  subscriptions: [],
  currency: "USD",
  isLoading: false,
  error: null,

  // Fetch all dashboard data
  fetchDashboardData: async () => {
    set({ isLoading: true, error: null });

    const result = await apiRequest<{
      incomes: Income[];
      expenses: Expense[];
      subscriptions: Subscription[];
      settings: { currency: string };
    }>("/api/dashboard");

    if (result.success && result.data) {
      set({
        incomes: result.data.incomes,
        expenses: result.data.expenses,
        subscriptions: result.data.subscriptions,
        currency: result.data.settings.currency,
        isLoading: false,
      });
    } else {
      set({ isLoading: false, error: result.error || "Failed to fetch data" });
    }
  },

  // Income operations
  addIncome: async (income) => {
    const result = await apiRequest<Income>("/api/income", {
      method: "POST",
      body: JSON.stringify(income),
    });

    if (result.success && result.data) {
      set((state) => ({
        incomes: [result.data!, ...state.incomes],
      }));
      return result.data.id;
    }

    set({ error: result.error || "Failed to add income" });
    throw new Error(result.error || "Failed to add income");
  },

  updateIncome: async (id, updates) => {
    const result = await apiRequest<Income>(`/api/income/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });

    if (result.success && result.data) {
      set((state) => ({
        incomes: state.incomes.map((income) =>
          income.id === id ? result.data! : income,
        ),
      }));
    } else {
      set({ error: result.error || "Failed to update income" });
      throw new Error(result.error || "Failed to update income");
    }
  },

  deleteIncome: async (id) => {
    const result = await apiRequest(`/api/income/${id}`, {
      method: "DELETE",
    });

    if (result.success) {
      set((state) => ({
        incomes: state.incomes.filter((income) => income.id !== id),
      }));
    } else {
      set({ error: result.error || "Failed to delete income" });
      throw new Error(result.error || "Failed to delete income");
    }
  },

  // Expense operations
  addExpense: async (expense) => {
    const result = await apiRequest<Expense>("/api/expenses", {
      method: "POST",
      body: JSON.stringify(expense),
    });

    if (result.success && result.data) {
      set((state) => ({
        expenses: [result.data!, ...state.expenses],
      }));
      return result.data.id;
    }

    set({ error: result.error || "Failed to add expense" });
    throw new Error(result.error || "Failed to add expense");
  },

  updateExpense: async (id, updates) => {
    const result = await apiRequest<Expense>(`/api/expenses/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });

    if (result.success && result.data) {
      set((state) => ({
        expenses: state.expenses.map((expense) =>
          expense.id === id ? result.data! : expense,
        ),
      }));
    } else {
      set({ error: result.error || "Failed to update expense" });
      throw new Error(result.error || "Failed to update expense");
    }
  },

  deleteExpense: async (id) => {
    const result = await apiRequest(`/api/expenses/${id}`, {
      method: "DELETE",
    });

    if (result.success) {
      set((state) => ({
        expenses: state.expenses.filter((expense) => expense.id !== id),
      }));
    } else {
      set({ error: result.error || "Failed to delete expense" });
      throw new Error(result.error || "Failed to delete expense");
    }
  },

  // Subscription operations
  addSubscription: async (subscription) => {
    const result = await apiRequest<Subscription>("/api/subscriptions", {
      method: "POST",
      body: JSON.stringify(subscription),
    });

    if (result.success && result.data) {
      set((state) => ({
        subscriptions: [result.data!, ...state.subscriptions],
      }));
      return result.data.id;
    }

    set({ error: result.error || "Failed to add subscription" });
    throw new Error(result.error || "Failed to add subscription");
  },

  updateSubscription: async (id, updates) => {
    const result = await apiRequest<Subscription>(`/api/subscriptions/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });

    if (result.success && result.data) {
      set((state) => ({
        subscriptions: state.subscriptions.map((sub) =>
          sub.id === id ? result.data! : sub,
        ),
      }));
    } else {
      set({ error: result.error || "Failed to update subscription" });
      throw new Error(result.error || "Failed to update subscription");
    }
  },

  deleteSubscription: async (id) => {
    const result = await apiRequest(`/api/subscriptions/${id}`, {
      method: "DELETE",
    });

    if (result.success) {
      set((state) => ({
        subscriptions: state.subscriptions.filter((sub) => sub.id !== id),
      }));
    } else {
      set({ error: result.error || "Failed to delete subscription" });
      throw new Error(result.error || "Failed to delete subscription");
    }
  },

  toggleSubscriptionActive: async (id) => {
    const subscription = get().subscriptions.find((s) => s.id === id);
    if (!subscription) return;

    await get().updateSubscription(id, { active: !subscription.active });
  },

  // Settings
  setCurrency: async (currency) => {
    const result = await apiRequest("/api/user/settings", {
      method: "PUT",
      body: JSON.stringify({ currency }),
    });

    if (result.success) {
      set({ currency });
    } else {
      set({ error: result.error || "Failed to update currency" });
      throw new Error(result.error || "Failed to update currency");
    }
  },

  // Bulk operations
  clearAllData: async () => {
    const result = await apiRequest("/api/user/clear-all", {
      method: "DELETE",
    });

    if (result.success) {
      set({
        incomes: [],
        expenses: [],
        subscriptions: [],
        error: null,
      });
    } else {
      set({ error: result.error || "Failed to clear all data" });
      throw new Error(result.error || "Failed to clear all data");
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));
