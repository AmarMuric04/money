/**
 * Single Income API Routes
 * GET /api/income/[id] - Get single income
 * PUT /api/income/[id] - Update income
 * DELETE /api/income/[id] - Delete income
 */

import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { IncomeModel } from "@/lib/db/models";
import { updateIncomeSchema } from "@/lib/validations";
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
 * Get a single income by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { auth, error: authError } = await authenticateRequest(request);
    if (authError) return authError;

    const { id } = await params;
    await connectDB();

    const income = await IncomeModel.findOne({
      _id: id,
      userId: auth.userId,
    }).lean();

    if (!income) {
      return errorResponse("NOT_FOUND", "Income not found", 404);
    }

    return successResponse({
      id: income._id.toString(),
      name: income.name,
      amount: income.amount,
      frequency: income.frequency,
      date: income.date.toISOString(),
      category: income.category,
      note: income.note,
      createdAt: income.createdAt.toISOString(),
      updatedAt: income.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("Income fetch error:", error);
    return errorResponse("INTERNAL_ERROR", "Failed to fetch income", 500);
  }
}

/**
 * Update an income
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { auth, error: authError } = await authenticateRequest(request);
    if (authError) return authError;

    const { id } = await params;
    const { data, error: parseError } = await parseBody(
      request,
      updateIncomeSchema,
    );
    if (parseError) return parseError;

    await connectDB();

    // Build update object
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.frequency !== undefined) updateData.frequency = data.frequency;
    if (data.date !== undefined) updateData.date = new Date(data.date);
    if (data.category !== undefined) updateData.category = data.category;
    if (data.note !== undefined) updateData.note = data.note;

    const income = await IncomeModel.findOneAndUpdate(
      { _id: id, userId: auth.userId },
      { $set: updateData },
      { new: true, runValidators: true },
    ).lean();

    if (!income) {
      return errorResponse("NOT_FOUND", "Income not found", 404);
    }

    return successResponse({
      id: income._id.toString(),
      name: income.name,
      amount: income.amount,
      frequency: income.frequency,
      date: income.date.toISOString(),
      category: income.category,
      note: income.note,
      createdAt: income.createdAt.toISOString(),
      updatedAt: income.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("Income update error:", error);
    return errorResponse("INTERNAL_ERROR", "Failed to update income", 500);
  }
}

/**
 * Delete an income
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { auth, error: authError } = await authenticateRequest(request);
    if (authError) return authError;

    const { id } = await params;
    await connectDB();

    const income = await IncomeModel.findOneAndDelete({
      _id: id,
      userId: auth.userId,
    });

    if (!income) {
      return errorResponse("NOT_FOUND", "Income not found", 404);
    }

    return successResponse({ deleted: true });
  } catch (error) {
    console.error("Income delete error:", error);
    return errorResponse("INTERNAL_ERROR", "Failed to delete income", 500);
  }
}
