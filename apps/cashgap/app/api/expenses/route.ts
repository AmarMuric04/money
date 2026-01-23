/**
 * Expense API Routes
 * GET /api/expenses - List all expenses
 * POST /api/expenses - Create new expense
 */

import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { ExpenseModel } from "@/lib/db/models";
import { createExpenseSchema } from "@/lib/validations";
import {
  successResponse,
  errorResponse,
  parseBody,
  authenticateRequest,
  getPaginationParams,
  paginatedResponse,
} from "@/lib/api/utils";

/**
 * Get all expenses for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const { auth, error: authError } = await authenticateRequest(request);
    if (authError) return authError;

    await connectDB();

    const pagination = getPaginationParams(request);
    const url = new URL(request.url);

    // Build query filters
    const query: Record<string, unknown> = { userId: auth.userId };

    // Optional date range filter
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    if (startDate || endDate) {
      query.date = {};
      if (startDate)
        (query.date as Record<string, Date>).$gte = new Date(startDate);
      if (endDate)
        (query.date as Record<string, Date>).$lte = new Date(endDate);
    }

    // Optional category filter
    const category = url.searchParams.get("category");
    if (category) {
      query.category = category;
    }

    // Get total count and items
    const [total, expenses] = await Promise.all([
      ExpenseModel.countDocuments(query),
      ExpenseModel.find(query)
        .sort({ date: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit)
        .lean(),
    ]);

    // Transform to client format
    const items = expenses.map((expense) => ({
      id: expense._id.toString(),
      name: expense.name,
      amount: expense.amount,
      category: expense.category,
      date: expense.date.toISOString(),
      note: expense.note,
      createdAt: expense.createdAt.toISOString(),
      updatedAt: expense.updatedAt.toISOString(),
    }));

    return paginatedResponse(items, total, pagination);
  } catch (error) {
    console.error("Expense list error:", error);
    return errorResponse("INTERNAL_ERROR", "Failed to fetch expenses", 500);
  }
}

/**
 * Create a new expense
 */
export async function POST(request: NextRequest) {
  try {
    const { auth, error: authError } = await authenticateRequest(request);
    if (authError) return authError;

    const { data, error: parseError } = await parseBody(
      request,
      createExpenseSchema,
    );
    if (parseError) return parseError;

    await connectDB();

    const expense = await ExpenseModel.create({
      userId: auth.userId,
      name: data.name,
      amount: data.amount,
      category: data.category,
      date: new Date(data.date),
      note: data.note,
    });

    return successResponse(
      {
        id: expense._id.toString(),
        name: expense.name,
        amount: expense.amount,
        category: expense.category,
        date: expense.date.toISOString(),
        note: expense.note,
        createdAt: expense.createdAt.toISOString(),
        updatedAt: expense.updatedAt.toISOString(),
      },
      201,
    );
  } catch (error) {
    console.error("Expense create error:", error);
    return errorResponse("INTERNAL_ERROR", "Failed to create expense", 500);
  }
}
