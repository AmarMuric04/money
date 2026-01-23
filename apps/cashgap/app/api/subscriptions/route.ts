/**
 * Subscription API Routes
 * GET /api/subscriptions - List all subscriptions
 * POST /api/subscriptions - Create new subscription
 */

import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { SubscriptionModel } from "@/lib/db/models";
import { createSubscriptionSchema } from "@/lib/validations";
import {
  successResponse,
  errorResponse,
  parseBody,
  authenticateRequest,
  getPaginationParams,
  paginatedResponse,
} from "@/lib/api/utils";

/**
 * Get all subscriptions for the authenticated user
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

    // Optional active filter
    const active = url.searchParams.get("active");
    if (active !== null) {
      query.active = active === "true";
    }

    // Optional category filter
    const category = url.searchParams.get("category");
    if (category) {
      query.category = category;
    }

    // Get total count and items
    const [total, subscriptions] = await Promise.all([
      SubscriptionModel.countDocuments(query),
      SubscriptionModel.find(query)
        .sort({ nextBillingDate: 1 })
        .skip(pagination.skip)
        .limit(pagination.limit)
        .lean(),
    ]);

    // Transform to client format
    const items = subscriptions.map((sub) => ({
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

    return paginatedResponse(items, total, pagination);
  } catch (error) {
    console.error("Subscription list error:", error);
    return errorResponse(
      "INTERNAL_ERROR",
      "Failed to fetch subscriptions",
      500,
    );
  }
}

/**
 * Create a new subscription
 */
export async function POST(request: NextRequest) {
  try {
    const { auth, error: authError } = await authenticateRequest(request);
    if (authError) return authError;

    const { data, error: parseError } = await parseBody(
      request,
      createSubscriptionSchema,
    );
    if (parseError) return parseError;

    await connectDB();

    const subscription = await SubscriptionModel.create({
      userId: auth.userId,
      name: data.name,
      amount: data.amount,
      frequency: data.frequency,
      nextBillingDate: new Date(data.nextBillingDate),
      category: data.category,
      active: data.active ?? true,
      note: data.note,
    });

    return successResponse(
      {
        id: subscription._id.toString(),
        name: subscription.name,
        amount: subscription.amount,
        frequency: subscription.frequency,
        nextBillingDate: subscription.nextBillingDate.toISOString(),
        category: subscription.category,
        active: subscription.active,
        note: subscription.note,
        createdAt: subscription.createdAt.toISOString(),
        updatedAt: subscription.updatedAt.toISOString(),
      },
      201,
    );
  } catch (error) {
    console.error("Subscription create error:", error);
    return errorResponse(
      "INTERNAL_ERROR",
      "Failed to create subscription",
      500,
    );
  }
}
