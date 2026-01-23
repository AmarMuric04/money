/**
 * Income API Routes
 * GET /api/income - List all incomes
 * POST /api/income - Create new income
 */

import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { IncomeModel } from "@/lib/db/models";
import { createIncomeSchema } from "@/lib/validations";
import {
  successResponse,
  errorResponse,
  parseBody,
  authenticateRequest,
  getPaginationParams,
  paginatedResponse,
} from "@/lib/api/utils";

/**
 * Get all incomes for the authenticated user
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
    const [total, incomes] = await Promise.all([
      IncomeModel.countDocuments(query),
      IncomeModel.find(query)
        .sort({ date: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit)
        .lean(),
    ]);

    // Transform to client format
    const items = incomes.map((income) => ({
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

    return paginatedResponse(items, total, pagination);
  } catch (error) {
    console.error("Income list error:", error);
    return errorResponse("INTERNAL_ERROR", "Failed to fetch incomes", 500);
  }
}

/**
 * Create a new income
 */
export async function POST(request: NextRequest) {
  try {
    const { auth, error: authError } = await authenticateRequest(request);
    if (authError) return authError;

    const { data, error: parseError } = await parseBody(
      request,
      createIncomeSchema,
    );
    if (parseError) return parseError;

    await connectDB();

    const income = await IncomeModel.create({
      userId: auth.userId,
      name: data.name,
      amount: data.amount,
      frequency: data.frequency,
      date: new Date(data.date),
      category: data.category,
      note: data.note,
    });

    return successResponse(
      {
        id: income._id.toString(),
        name: income.name,
        amount: income.amount,
        frequency: income.frequency,
        date: income.date.toISOString(),
        category: income.category,
        note: income.note,
        createdAt: income.createdAt.toISOString(),
        updatedAt: income.updatedAt.toISOString(),
      },
      201,
    );
  } catch (error) {
    console.error("Income create error:", error);
    return errorResponse("INTERNAL_ERROR", "Failed to create income", 500);
  }
}
