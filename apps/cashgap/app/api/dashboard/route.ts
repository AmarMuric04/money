/**
 * Dashboard Data API
 * GET /api/dashboard - Get all dashboard data in one request
 */

import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import {
  IncomeModel,
  ExpenseModel,
  SubscriptionModel,
  UserSettingsModel,
} from "@/lib/db/models";
import {
  successResponse,
  errorResponse,
  authenticateRequest,
} from "@/lib/api/utils";

/**
 * Get all dashboard data for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const { auth, error: authError } = await authenticateRequest(request);
    if (authError) return authError;

    await connectDB();

    // Fetch all data in parallel
    const [incomes, expenses, subscriptions, settings] = await Promise.all([
      IncomeModel.find({ userId: auth.userId }).sort({ date: -1 }).lean(),
      ExpenseModel.find({ userId: auth.userId }).sort({ date: -1 }).lean(),
      SubscriptionModel.find({ userId: auth.userId })
        .sort({ nextBillingDate: 1 })
        .lean(),
      UserSettingsModel.findOne({ userId: auth.userId }).lean(),
    ]);

    // Transform data to client format
    const transformedIncomes = incomes.map((income) => ({
      id: income._id.toString(),
      name: income.name,
      amount: income.amount,
      frequency: income.frequency,
      date: income.date.toISOString(),
      category: income.category,
      note: income.note,
      createdAt: income.createdAt.toISOString(),
      updatedAt: income.updatedAt.toISOString(),
    }));

    const transformedExpenses = expenses.map((expense) => ({
      id: expense._id.toString(),
      name: expense.name,
      amount: expense.amount,
      category: expense.category,
      date: expense.date.toISOString(),
      note: expense.note,
      createdAt: expense.createdAt.toISOString(),
      updatedAt: expense.updatedAt.toISOString(),
    }));

    const transformedSubscriptions = subscriptions.map((sub) => ({
      id: sub._id.toString(),
      name: sub.name,
      amount: sub.amount,
      frequency: sub.frequency,
      nextBillingDate: sub.nextBillingDate.toISOString(),
      category: sub.category,
      active: sub.active,
      note: sub.note,
      createdAt: sub.createdAt.toISOString(),
      updatedAt: sub.updatedAt.toISOString(),
    }));

    return successResponse({
      incomes: transformedIncomes,
      expenses: transformedExpenses,
      subscriptions: transformedSubscriptions,
      settings: {
        currency: settings?.currency || "USD",
      },
    });
  } catch (error) {
    console.error("Dashboard data error:", error);
    return errorResponse(
      "INTERNAL_ERROR",
      "Failed to fetch dashboard data",
      500,
    );
  }
}
