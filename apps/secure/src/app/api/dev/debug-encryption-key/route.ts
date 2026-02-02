/**
 * Debug Encryption Key API (Development Only!)
 * GET /api/dev/debug-encryption-key
 * 
 * Helps diagnose encryption key issues
 */

import { NextRequest } from "next/server";
import { successResponse, errorResponse, authenticateRequest } from "@/lib/api/utils";

export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === "production") {
    return errorResponse(
      "FORBIDDEN",
      "This endpoint is not available in production",
      403,
    );
  }

  try {
    // Authenticate request
    const { auth, error: authError } = await authenticateRequest(request);

    if (authError) {
      return authError;
    }

    // Get user info
    const { UserModel } = await import("@/lib/db/models");
    const { connectDB } = await import("@/lib/db/connection");
    await connectDB();

    const user = await UserModel.findById(auth.userId);

    if (!user) {
      return errorResponse("NOT_FOUND", "User not found", 404);
    }

    return successResponse({
      email: user.email,
      hasSalt: !!user.authSalt,
      saltLength: user.authSalt?.length || 0,
      saltPreview: user.authSalt?.substring(0, 10) + "...",
      createdAt: user.createdAt,
      tip: "If you're seeing decryption errors, you may need to clear sessionStorage and re-login to re-derive the encryption key.",
    });
  } catch (error) {
    console.error("Debug encryption key error:", error);
    return errorResponse("INTERNAL_ERROR", "An unexpected error occurred", 500);
  }
}
