/**
 * Single Subscription API Routes
 * GET /api/subscriptions/[id] - Get single subscription
 * PUT /api/subscriptions/[id] - Update subscription
 * DELETE /api/subscriptions/[id] - Delete subscription
 */

import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { SubscriptionModel } from "@/lib/db/models";
import { updateSubscriptionSchema } from "@/lib/validations";
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
 * Get a single subscription by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { auth, error: authError } = await authenticateRequest(request);
    if (authError) return authError;

    const { id } = await params;
    await connectDB();

    const subscription = await SubscriptionModel.findOne({
      _id: id,
      userId: auth.userId,
    }).lean();

    if (!subscription) {
      return errorResponse("NOT_FOUND", "Subscription not found", 404);
    }

    return successResponse({
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
    });
  } catch (error) {
    console.error("Subscription fetch error:", error);
    return errorResponse("INTERNAL_ERROR", "Failed to fetch subscription", 500);
  }
}

/**
 * Update a subscription
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { auth, error: authError } = await authenticateRequest(request);
    if (authError) return authError;

    const { id } = await params;
    const { data, error: parseError } = await parseBody(
      request,
      updateSubscriptionSchema,
    );
    if (parseError) return parseError;

    await connectDB();

    // Build update object
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.frequency !== undefined) updateData.frequency = data.frequency;
    if (data.nextBillingDate !== undefined)
      updateData.nextBillingDate = new Date(data.nextBillingDate);
    if (data.category !== undefined) updateData.category = data.category;
    if (data.active !== undefined) updateData.active = data.active;
    if (data.note !== undefined) updateData.note = data.note;

    const subscription = await SubscriptionModel.findOneAndUpdate(
      { _id: id, userId: auth.userId },
      { $set: updateData },
      { new: true, runValidators: true },
    ).lean();

    if (!subscription) {
      return errorResponse("NOT_FOUND", "Subscription not found", 404);
    }

    return successResponse({
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
    });
  } catch (error) {
    console.error("Subscription update error:", error);
    return errorResponse(
      "INTERNAL_ERROR",
      "Failed to update subscription",
      500,
    );
  }
}

/**
 * Delete a subscription
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { auth, error: authError } = await authenticateRequest(request);
    if (authError) return authError;

    const { id } = await params;
    await connectDB();

    const subscription = await SubscriptionModel.findOneAndDelete({
      _id: id,
      userId: auth.userId,
    });

    if (!subscription) {
      return errorResponse("NOT_FOUND", "Subscription not found", 404);
    }

    return successResponse({ deleted: true });
  } catch (error) {
    console.error("Subscription delete error:", error);
    return errorResponse(
      "INTERNAL_ERROR",
      "Failed to delete subscription",
      500,
    );
  }
}
