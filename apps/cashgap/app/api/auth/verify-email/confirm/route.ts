/**
 * Confirm Email Verification API
 * POST /api/auth/verify-email/confirm
 *
 * Verifies the code and completes user registration
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db/connection";
import { EmailVerificationTokenModel } from "@/lib/db/models";
import clientPromise from "@/lib/db/mongodb";

const confirmVerificationSchema = z.object({
  token: z.string().min(1, "Token is required"),
  code: z.string().length(6, "Code must be 6 digits"),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const result = confirmVerificationSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || "Invalid input" },
        { status: 400 },
      );
    }

    const { token, code } = result.data;

    await connectDB();

    // Find the verification token
    const verificationToken = await EmailVerificationTokenModel.findOne({
      token,
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Invalid or expired verification token" },
        { status: 400 },
      );
    }

    // Check if token is expired
    if (verificationToken.expiresAt < new Date()) {
      await EmailVerificationTokenModel.deleteOne({ token });
      return NextResponse.json(
        { error: "Verification token has expired. Please request a new one." },
        { status: 400 },
      );
    }

    // Verify the code
    if (verificationToken.code !== code) {
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 },
      );
    }

    // Check if already verified (prevent double registration)
    if (verificationToken.verified) {
      return NextResponse.json(
        { error: "This email has already been verified" },
        { status: 400 },
      );
    }

    // Check registration data exists
    if (!verificationToken.registrationData) {
      return NextResponse.json(
        { error: "Registration data not found" },
        { status: 400 },
      );
    }

    const { password: hashedPassword, name } =
      verificationToken.registrationData;

    // Double-check user doesn't exist (race condition protection)
    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection("users");

    const existingUser = await usersCollection.findOne({
      email: verificationToken.email,
    });

    if (existingUser) {
      await EmailVerificationTokenModel.deleteOne({ token });
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 },
      );
    }

    // Create user with verified email
    const newUser = await usersCollection.insertOne({
      email: verificationToken.email,
      password: hashedPassword,
      name: name || verificationToken.email.split("@")[0],
      emailVerified: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Mark token as verified and delete it
    await EmailVerificationTokenModel.deleteOne({ token });

    return NextResponse.json(
      {
        success: true,
        userId: newUser.insertedId.toString(),
        message: "Email verified and account created successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Confirm verification error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
