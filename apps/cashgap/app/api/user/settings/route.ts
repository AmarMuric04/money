/**
 * User Settings API
 * GET /api/user/settings - Get user settings
 * PUT /api/user/settings - Update user settings
 */

import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { UserSettingsModel } from "@/lib/db/models";
import { updateSettingsSchema } from "@/lib/validations";
import {
  successResponse,
  errorResponse,
  parseBody,
  authenticateRequest,
} from "@/lib/api/utils";

/**
 * Get current user's settings
 */
export async function GET(request: NextRequest) {
  try {
    const { auth, error: authError } = await authenticateRequest(request);
    if (authError) return authError;

    await connectDB();

    let settings = await UserSettingsModel.findOne({
      userId: auth.userId,
    }).lean();

    // Create default settings if not exists
    if (!settings) {
      settings = await UserSettingsModel.create({
        userId: auth.userId,
        currency: "USD",
      });
    }

    return successResponse({
      currency: settings.currency,
    });
  } catch (error) {
    console.error("Settings fetch error:", error);
    return errorResponse("INTERNAL_ERROR", "Failed to fetch settings", 500);
  }
}

/**
 * Update user settings
 */
export async function PUT(request: NextRequest) {
  try {
    const { auth, error: authError } = await authenticateRequest(request);
    if (authError) return authError;

    const { data, error: parseError } = await parseBody(
      request,
      updateSettingsSchema,
    );
    if (parseError) return parseError;

    await connectDB();

    const settings = await UserSettingsModel.findOneAndUpdate(
      { userId: auth.userId },
      { $set: data },
      { new: true, upsert: true, runValidators: true },
    ).lean();

    return successResponse({
      currency: settings.currency,
    });
  } catch (error) {
    console.error("Settings update error:", error);
    return errorResponse("INTERNAL_ERROR", "Failed to update settings", 500);
  }
}
