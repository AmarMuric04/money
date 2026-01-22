"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

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

  // Income operations
  addIncome: (income: Omit<Income, "id" | "createdAt" | "updatedAt">) => string;
  updateIncome: (id: string, updates: Partial<Income>) => void;
  deleteIncome: (id: string) => void;

  // Expense operations
  addExpense: (
    expense: Omit<Expense, "id" | "createdAt" | "updatedAt">,
  ) => string;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  // Subscription operations
  addSubscription: (
    subscription: Omit<Subscription, "id" | "createdAt" | "updatedAt">,
  ) => string;
  updateSubscription: (id: string, updates: Partial<Subscription>) => void;
  deleteSubscription: (id: string) => void;
  toggleSubscriptionActive: (id: string) => void;

  // Settings
  setCurrency: (currency: string) => void;

  // Bulk operations
  clearAllData: () => void;
}

// ============================================================================
// Helper Functions
// ============================================================================

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function getTimestamp(): string {
  return new Date().toISOString();
}

// ============================================================================
// Store
// ============================================================================

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set) => ({
      // Initial state
      incomes: [],
      expenses: [],
      subscriptions: [],
      currency: "USD",

      // Income operations
      addIncome: (income) => {
        const id = generateId();
        const timestamp = getTimestamp();
        set((state) => ({
          incomes: [
            ...state.incomes,
            { ...income, id, createdAt: timestamp, updatedAt: timestamp },
          ],
        }));
        return id;
      },

      updateIncome: (id, updates) => {
        set((state) => ({
          incomes: state.incomes.map((income) =>
            income.id === id
              ? { ...income, ...updates, updatedAt: getTimestamp() }
              : income,
          ),
        }));
      },

      deleteIncome: (id) => {
        set((state) => ({
          incomes: state.incomes.filter((income) => income.id !== id),
        }));
      },

      // Expense operations
      addExpense: (expense) => {
        const id = generateId();
        const timestamp = getTimestamp();
        set((state) => ({
          expenses: [
            ...state.expenses,
            { ...expense, id, createdAt: timestamp, updatedAt: timestamp },
          ],
        }));
        return id;
      },

      updateExpense: (id, updates) => {
        set((state) => ({
          expenses: state.expenses.map((expense) =>
            expense.id === id
              ? { ...expense, ...updates, updatedAt: getTimestamp() }
              : expense,
          ),
        }));
      },

      deleteExpense: (id) => {
        set((state) => ({
          expenses: state.expenses.filter((expense) => expense.id !== id),
        }));
      },

      // Subscription operations
      addSubscription: (subscription) => {
        const id = generateId();
        const timestamp = getTimestamp();
        set((state) => ({
          subscriptions: [
            ...state.subscriptions,
            { ...subscription, id, createdAt: timestamp, updatedAt: timestamp },
          ],
        }));
        return id;
      },

      updateSubscription: (id, updates) => {
        set((state) => ({
          subscriptions: state.subscriptions.map((sub) =>
            sub.id === id
              ? { ...sub, ...updates, updatedAt: getTimestamp() }
              : sub,
          ),
        }));
      },

      deleteSubscription: (id) => {
        set((state) => ({
          subscriptions: state.subscriptions.filter((sub) => sub.id !== id),
        }));
      },

      toggleSubscriptionActive: (id) => {
        set((state) => ({
          subscriptions: state.subscriptions.map((sub) =>
            sub.id === id
              ? { ...sub, active: !sub.active, updatedAt: getTimestamp() }
              : sub,
          ),
        }));
      },

      // Settings
      setCurrency: (currency) => {
        set({ currency });
      },

      // Bulk operations
      clearAllData: () => {
        set({
          incomes: [],
          expenses: [],
          subscriptions: [],
        });
      },
    }),
    {
      name: "cashgap-finance-storage",
    },
  ),
);
