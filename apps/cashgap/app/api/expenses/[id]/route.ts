/**
 * Single Expense API Routes
 * GET /api/expenses/[id] - Get single expense
 * PUT /api/expenses/[id] - Update expense
 * DELETE /api/expenses/[id] - Delete expense
 */

import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { ExpenseModel } from "@/lib/db/models";
import { updateExpenseSchema } from "@/lib/validations";
import {
  successResponse,
  errorResponse,
  parseBody,
  authenticateRequest,
} from "@/lib/api/utils";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * Get a single expense by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { auth, error: authError } = await authenticateRequest(request);
    if (authError) return authError;

    const { id } = await params;
    await connectDB();

    const expense = await ExpenseModel.findOne({
      _id: id,
      userId: auth.userId,
    }).lean();

    if (!expense) {
      return errorResponse("NOT_FOUND", "Expense not found", 404);
    }

    return successResponse({
      id: expense._id.toString(),
      name: expense.name,
      amount: expense.amount,
      category: expense.category,
      date: expense.date.toISOString(),
      note: expense.note,
      createdAt: expense.createdAt.toISOString(),
      updatedAt: expense.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("Expense fetch error:", error);
    return errorResponse("INTERNAL_ERROR", "Failed to fetch expense", 500);
  }
}

/**
 * Update an expense
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { auth, error: authError } = await authenticateRequest(request);
    if (authError) return authError;

    const { id } = await params;
    const { data, error: parseError } = await parseBody(
      request,
      updateExpenseSchema,
    );
    if (parseError) return parseError;

    await connectDB();

    // Build update object
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.date !== undefined) updateData.date = new Date(data.date);
    if (data.note !== undefined) updateData.note = data.note;

    const expense = await ExpenseModel.findOneAndUpdate(
      { _id: id, userId: auth.userId },
      { $set: updateData },
      { new: true, runValidators: true },
    ).lean();

    if (!expense) {
      return errorResponse("NOT_FOUND", "Expense not found", 404);
    }

    return successResponse({
      id: expense._id.toString(),
      name: expense.name,
      amount: expense.amount,
      category: expense.category,
      date: expense.date.toISOString(),
      note: expense.note,
      createdAt: expense.createdAt.toISOString(),
      updatedAt: expense.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("Expense update error:", error);
    return errorResponse("INTERNAL_ERROR", "Failed to update expense", 500);
  }
}

/**
 * Delete an expense
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { auth, error: authError } = await authenticateRequest(request);
    if (authError) return authError;

    const { id } = await params;
    await connectDB();

    const expense = await ExpenseModel.findOneAndDelete({
      _id: id,
      userId: auth.userId,
    });

    if (!expense) {
      return errorResponse("NOT_FOUND", "Expense not found", 404);
    }

    return successResponse({ deleted: true });
  } catch (error) {
    console.error("Expense delete error:", error);
    return errorResponse("INTERNAL_ERROR", "Failed to delete expense", 500);
  }
}
