/**
 * MongoDB Models for CashGap
 * Mongoose schemas for all collections
 */

import mongoose, { Schema, Document, Model } from "mongoose";

// ============================================================================
// Email Verification Token Model
// ============================================================================

export interface EmailVerificationTokenDocument extends Document {
  email: string;
  token: string;
  code: string; // 6-digit verification code
  expiresAt: Date;
  verified: boolean;
  // Store registration data temporarily until verified
  registrationData?: {
    password: string; // Hashed password
    name?: string;
  };
}

const emailVerificationTokenSchema = new Schema<EmailVerificationTokenDocument>(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    token: { type: String, required: true, unique: true },
    code: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    verified: { type: Boolean, default: false },
    registrationData: {
      password: { type: String },
      name: { type: String },
    },
  },
  {
    timestamps: true,
  },
);

// TTL index: automatically delete expired tokens
emailVerificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
emailVerificationTokenSchema.index({ email: 1 });

export const EmailVerificationTokenModel: Model<EmailVerificationTokenDocument> =
  mongoose.models.EmailVerificationToken ||
  mongoose.model<EmailVerificationTokenDocument>(
    "EmailVerificationToken",
    emailVerificationTokenSchema,
  );

// ============================================================================
// Income Model
// ============================================================================

export interface IncomeDocument extends Document {
  userId: string;
  name: string;
  amount: number;
  frequency: "once" | "monthly" | "yearly";
  date: Date;
  category?: string;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const incomeSchema = new Schema<IncomeDocument>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    frequency: {
      type: String,
      required: true,
      enum: ["once", "monthly", "yearly"],
      default: "once",
    },
    date: { type: Date, required: true },
    category: { type: String, trim: true },
    note: { type: String, trim: true },
  },
  {
    timestamps: true,
  },
);

// Compound index for efficient user queries
incomeSchema.index({ userId: 1, date: -1 });

export const IncomeModel: Model<IncomeDocument> =
  mongoose.models.Income ||
  mongoose.model<IncomeDocument>("Income", incomeSchema);

// ============================================================================
// Expense Model
// ============================================================================

export type ExpenseCategory =
  | "food"
  | "transport"
  | "shopping"
  | "housing"
  | "utilities"
  | "entertainment"
  | "health"
  | "other";

export interface ExpenseDocument extends Document {
  userId: string;
  name: string;
  amount: number;
  category: ExpenseCategory;
  date: Date;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const expenseSchema = new Schema<ExpenseDocument>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      required: true,
      enum: [
        "food",
        "transport",
        "shopping",
        "housing",
        "utilities",
        "entertainment",
        "health",
        "other",
      ],
      default: "other",
    },
    date: { type: Date, required: true },
    note: { type: String, trim: true },
  },
  {
    timestamps: true,
  },
);

// Compound index for efficient user queries
expenseSchema.index({ userId: 1, date: -1 });
expenseSchema.index({ userId: 1, category: 1 });

export const ExpenseModel: Model<ExpenseDocument> =
  mongoose.models.Expense ||
  mongoose.model<ExpenseDocument>("Expense", expenseSchema);

// ============================================================================
// Subscription Model
// ============================================================================

export interface SubscriptionDocument extends Document {
  userId: string;
  name: string;
  amount: number;
  frequency: "monthly" | "yearly";
  nextBillingDate: Date;
  category?: string;
  active: boolean;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<SubscriptionDocument>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    frequency: {
      type: String,
      required: true,
      enum: ["monthly", "yearly"],
      default: "monthly",
    },
    nextBillingDate: { type: Date, required: true },
    category: { type: String, trim: true },
    active: { type: Boolean, default: true },
    note: { type: String, trim: true },
  },
  {
    timestamps: true,
  },
);

// Compound index for efficient user queries
subscriptionSchema.index({ userId: 1, active: 1 });
subscriptionSchema.index({ userId: 1, nextBillingDate: 1 });

export const SubscriptionModel: Model<SubscriptionDocument> =
  mongoose.models.Subscription ||
  mongoose.model<SubscriptionDocument>("Subscription", subscriptionSchema);

// ============================================================================
// User Settings Model
// ============================================================================

export interface UserSettingsDocument extends Document {
  userId: string;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSettingsSchema = new Schema<UserSettingsDocument>(
  {
    userId: { type: String, required: true, unique: true },
    currency: { type: String, default: "USD" },
  },
  {
    timestamps: true,
  },
);

export const UserSettingsModel: Model<UserSettingsDocument> =
  mongoose.models.UserSettings ||
  mongoose.model<UserSettingsDocument>("UserSettings", userSettingsSchema);
