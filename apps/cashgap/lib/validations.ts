/**
 * Validation Schemas for CashGap API
 * Zod schemas for request validation
 */

import { z } from "zod";

// ============================================================================
// Income Validations
// ============================================================================

export const createIncomeSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  amount: z.number().positive("Amount must be positive"),
  frequency: z.enum(["once", "monthly", "yearly"]),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  category: z.string().max(50).optional(),
  note: z.string().max(500).optional(),
});

export const updateIncomeSchema = createIncomeSchema.partial();

export type CreateIncomeInput = z.infer<typeof createIncomeSchema>;
export type UpdateIncomeInput = z.infer<typeof updateIncomeSchema>;

// ============================================================================
// Expense Validations
// ============================================================================

export const expenseCategorySchema = z.enum([
  "food",
  "transport",
  "shopping",
  "housing",
  "utilities",
  "entertainment",
  "health",
  "other",
]);

export const createExpenseSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  amount: z.number().positive("Amount must be positive"),
  category: expenseCategorySchema,
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  note: z.string().max(500).optional(),
});

export const updateExpenseSchema = createExpenseSchema.partial();

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;

// ============================================================================
// Subscription Validations
// ============================================================================

export const createSubscriptionSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  amount: z.number().positive("Amount must be positive"),
  frequency: z.enum(["monthly", "yearly"]),
  nextBillingDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  category: z.string().max(50).optional(),
  active: z.boolean().optional().default(true),
  note: z.string().max(500).optional(),
});

export const updateSubscriptionSchema = createSubscriptionSchema.partial();

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionSchema>;

// ============================================================================
// User Settings Validations
// ============================================================================

export const updateSettingsSchema = z.object({
  currency: z.string().length(3, "Currency must be a 3-letter code").optional(),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
