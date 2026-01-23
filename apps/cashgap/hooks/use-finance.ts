/**
 * Finance API Hooks using TanStack Query
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Income, Expense, Subscription } from "@/stores";

// ============================================================================
// Types
// ============================================================================

interface DashboardData {
  incomes: Income[];
  expenses: Expense[];
  subscriptions: Subscription[];
  settings: { currency: string };
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
}

// ============================================================================
// API Helper
// ============================================================================

async function apiRequest<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  const result: ApiResponse<T> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error?.message || "Request failed");
  }

  return result.data as T;
}

// ============================================================================
// Query Keys
// ============================================================================

export const queryKeys = {
  dashboard: ["dashboard"] as const,
  incomes: ["incomes"] as const,
  income: (id: string) => ["incomes", id] as const,
  expenses: ["expenses"] as const,
  expense: (id: string) => ["expenses", id] as const,
  subscriptions: ["subscriptions"] as const,
  subscription: (id: string) => ["subscriptions", id] as const,
  settings: ["settings"] as const,
};

// ============================================================================
// Dashboard Query
// ============================================================================

export function useDashboardData() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: () => apiRequest<DashboardData>("/api/dashboard"),
  });
}

// ============================================================================
// Income Mutations
// ============================================================================

export function useAddIncome() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (income: Omit<Income, "id" | "createdAt" | "updatedAt">) =>
      apiRequest<Income>("/api/income", {
        method: "POST",
        body: JSON.stringify(income),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.incomes });
    },
  });
}

export function useUpdateIncome() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...updates }: Partial<Income> & { id: string }) =>
      apiRequest<Income>(`/api/income/${id}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.incomes });
    },
  });
}

export function useDeleteIncome() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiRequest<{ deleted: boolean }>(`/api/income/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.incomes });
    },
  });
}

// ============================================================================
// Expense Mutations
// ============================================================================

export function useAddExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (expense: Omit<Expense, "id" | "createdAt" | "updatedAt">) =>
      apiRequest<Expense>("/api/expenses", {
        method: "POST",
        body: JSON.stringify(expense),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses });
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...updates }: Partial<Expense> & { id: string }) =>
      apiRequest<Expense>(`/api/expenses/${id}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses });
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiRequest<{ deleted: boolean }>(`/api/expenses/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses });
    },
  });
}

// ============================================================================
// Subscription Mutations
// ============================================================================

export function useAddSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      subscription: Omit<Subscription, "id" | "createdAt" | "updatedAt">,
    ) =>
      apiRequest<Subscription>("/api/subscriptions", {
        method: "POST",
        body: JSON.stringify(subscription),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions });
    },
  });
}

export function useUpdateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...updates }: Partial<Subscription> & { id: string }) =>
      apiRequest<Subscription>(`/api/subscriptions/${id}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions });
    },
  });
}

export function useDeleteSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiRequest<{ deleted: boolean }>(`/api/subscriptions/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions });
    },
  });
}

// ============================================================================
// Settings Mutation
// ============================================================================

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: { currency?: string }) =>
      apiRequest<{ currency: string }>("/api/user/settings", {
        method: "PUT",
        body: JSON.stringify(settings),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.settings });
    },
  });
}
