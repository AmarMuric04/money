/**
 * User Profile API
 * GET /api/user/profile - Get current user profile
 */

import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  authenticateRequest,
} from "@/lib/api/utils";
import clientPromise from "@/lib/db/mongodb";

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
