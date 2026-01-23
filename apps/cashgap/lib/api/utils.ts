/**
 * API Utilities and Middleware
 * Common functions for API route handlers
 */

import { NextRequest, NextResponse } from "next/server";
import { ZodError, ZodSchema } from "zod";
import { auth } from "@/auth";

// ============================================================================
// Types
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface AuthenticatedRequest {
  userId: string;
  email: string;
}

// ============================================================================
// Response Helpers
// ============================================================================

export function successResponse<T>(
  data: T,
  status: number = 200,
): NextResponse {
  return NextResponse.json({ success: true, data } satisfies ApiResponse<T>, {
    status,
  });
}

export function errorResponse(
  code: string,
  message: string,
  status: number = 400,
  details?: unknown,
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: { code, message, details },
    } satisfies ApiResponse,
    { status },
  );
}

// ============================================================================
// Request Parsing
// ============================================================================

export async function parseBody<T>(
  request: NextRequest,
  schema: ZodSchema<T>,
): Promise<{ data: T; error: null } | { data: null; error: NextResponse }> {
  try {
    const body = await request.json();
    const data = schema.parse(body);
    return { data, error: null };
  } catch (err) {
    if (err instanceof ZodError) {
      const zodErr = err as ZodError;
      return {
        data: null,
        error: errorResponse(
          "VALIDATION_ERROR",
          "Invalid request data",
          400,
          zodErr.issues.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        ),
      };
    }
    return {
      data: null,
      error: errorResponse("PARSE_ERROR", "Invalid JSON body", 400),
    };
  }
}

// ============================================================================
// Authentication Middleware
// ============================================================================

export async function authenticateRequest(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _request: NextRequest,
): Promise<
  | { auth: AuthenticatedRequest; error: null }
  | { auth: null; error: NextResponse }
> {
  // Use NextAuth's auth() function to get the session
  const session = await auth();

  if (!session?.user?.id || !session?.user?.email) {
    return {
      auth: null,
      error: errorResponse("UNAUTHORIZED", "Not authenticated", 401),
    };
  }

  return {
    auth: {
      userId: session.user.id,
      email: session.user.email,
    },
    error: null,
  };
}

// ============================================================================
// Pagination Helpers
// ============================================================================

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export function getPaginationParams(request: NextRequest): PaginationParams {
  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
  const limit = Math.min(
    100,
    Math.max(1, parseInt(url.searchParams.get("limit") || "50", 10)),
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function paginatedResponse<T>(
  items: T[],
  total: number,
  pagination: PaginationParams,
): NextResponse {
  return successResponse({
    items,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: Math.ceil(total / pagination.limit),
    },
  } satisfies PaginatedResponse<T>);
}
