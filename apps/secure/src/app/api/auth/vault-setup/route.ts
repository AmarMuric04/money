/**
 * Vault Setup API for OAuth users
 * GET  /api/auth/vault-setup - Check if vault password is set up
 * POST /api/auth/vault-setup - Create vault password setup
 * PUT  /api/auth/vault-setup - Verify vault password
 */

import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { UserModel } from "@/lib/db/models";
import { z } from "zod";
import { hashAuthHash, verifyAuthHash } from "@/lib/crypto/server";
import {
  successResponse,
  errorResponse,
  authenticateRequest,
  parseBody,
} from "@/lib/api/utils";

const setupSchema = z.object({
  salt: z.string().min(32),
  authHash: z.string().min(32),
});

const verifySchema = z.object({
  authHash: z.string().min(32),
});

/**
 * Check if vault password is configured for the authenticated user
 */
export async function GET(request: NextRequest) {
  const { auth, error } = await authenticateRequest(request);
  if (error) return error;

  await connectDB();

  const user = await UserModel.findById(auth.userId).select(
    "authSalt authProvider",
  );

  if (!user) {
    return errorResponse("NOT_FOUND", "User not found", 404);
  }

  return successResponse({
    hasVaultSetup: !!user.authSalt,
    isOAuth: user.authProvider !== "credentials",
  });
}

/**
 * Create vault password setup (first time for OAuth users)
 */
export async function POST(request: NextRequest) {
  const { auth, error: authError } = await authenticateRequest(request);
  if (authError) return authError;

  const { data, error: parseError } = await parseBody(request, setupSchema);
  if (parseError) return parseError;

  await connectDB();

  const user = await UserModel.findById(auth.userId).select(
    "authSalt authProvider",
  );

  if (!user) {
    return errorResponse("NOT_FOUND", "User not found", 404);
  }

  if (user.authSalt) {
    return errorResponse(
      "ALREADY_SETUP",
      "Vault password is already configured",
      409,
    );
  }

  const hashedAuthHash = await hashAuthHash(data.authHash);

  await UserModel.updateOne(
    { _id: auth.userId },
    {
      $set: {
        authSalt: data.salt,
        authHash: hashedAuthHash,
      },
    },
  );

  return successResponse({ success: true }, 201);
}

/**
 * Verify vault password (returning OAuth users)
 */
export async function PUT(request: NextRequest) {
  const { auth, error: authError } = await authenticateRequest(request);
  if (authError) return authError;

  const { data, error: parseError } = await parseBody(request, verifySchema);
  if (parseError) return parseError;

  await connectDB();

  const user = await UserModel.findById(auth.userId).select(
    "authHash authSalt",
  );

  if (!user || !user.authHash || !user.authSalt) {
    return errorResponse("NOT_SETUP", "Vault password not configured", 400);
  }

  const isValid = await verifyAuthHash(data.authHash, user.authHash);

  if (!isValid) {
    return errorResponse(
      "INVALID_PASSWORD",
      "Incorrect vault password",
      401,
    );
  }

  return successResponse({ valid: true, salt: user.authSalt });
}
