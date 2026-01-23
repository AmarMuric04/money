/**
 * User Profile API
 * GET /api/user/profile - Get current user profile
 * PUT /api/user/profile - Update current user profile
 * DELETE /api/user/profile - Delete current user account
 */

import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  authenticateRequest,
} from "@/lib/api/utils";
import clientPromise from "@/lib/db/mongodb";
import { ObjectId } from "mongodb";

/**
 * Get current user's profile
 */
export async function GET(request: NextRequest) {
  try {
    const { auth, error: authError } = await authenticateRequest(request);
    if (authError) return authError;

    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ email: auth.email });

    if (!user) {
      return errorResponse("NOT_FOUND", "User not found", 404);
    }

    return successResponse({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      image: user.image,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt?.toISOString(),
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return errorResponse("INTERNAL_ERROR", "Failed to fetch profile", 500);
  }
}

/**
 * Update current user's profile
 */
export async function PUT(request: NextRequest) {
  try {
    const { auth, error: authError } = await authenticateRequest(request);
    if (authError) return authError;

    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return errorResponse("VALIDATION_ERROR", "Name is required", 400);
    }

    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection("users");

    const result = await usersCollection.findOneAndUpdate(
      { email: auth.email },
      { $set: { name: name.trim(), updatedAt: new Date() } },
      { returnDocument: "after" },
    );

    if (!result) {
      return errorResponse("NOT_FOUND", "User not found", 404);
    }

    return successResponse({
      id: result._id.toString(),
      email: result.email,
      name: result.name,
      image: result.image,
      emailVerified: result.emailVerified,
      createdAt: result.createdAt?.toISOString(),
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return errorResponse("INTERNAL_ERROR", "Failed to update profile", 500);
  }
}

/**
 * Delete current user's account and all associated data
 */
export async function DELETE(request: NextRequest) {
  try {
    const { auth, error: authError } = await authenticateRequest(request);
    if (authError) return authError;

    const client = await clientPromise;
    const db = client.db();

    // Delete all user data in parallel
    await Promise.all([
      // Delete all incomes
      db.collection("incomes").deleteMany({ userId: auth.userId }),
      // Delete all expenses
      db.collection("expenses").deleteMany({ userId: auth.userId }),
      // Delete all subscriptions
      db.collection("subscriptions").deleteMany({ userId: auth.userId }),
      // Delete the user
      db.collection("users").deleteOne({ _id: new ObjectId(auth.userId) }),
    ]);

    return successResponse({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Account deletion error:", error);
    return errorResponse("INTERNAL_ERROR", "Failed to delete account", 500);
  }
}
