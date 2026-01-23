/**
 * Send Email Verification API
 * POST /api/auth/verify-email/send
 *
 * Sends a verification code to the user's email before registration
 */

import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectDB } from "@/lib/db/connection";
import { EmailVerificationTokenModel } from "@/lib/db/models";
import clientPromise from "@/lib/db/mongodb";
import { sendVerificationEmail } from "@/lib/email";

const sendVerificationSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().optional(),
});

// Generate a 6-digit verification code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const result = sendVerificationSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || "Invalid input" },
        { status: 400 },
      );
    }

    const { email, password, name } = result.data;
    const normalizedEmail = email.toLowerCase();

    // Check if user already exists using the same MongoDB client
    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection("users");

    const existingUser = await usersCollection.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 },
      );
    }

    // Connect to mongoose for the verification token
    await connectDB();

    // Delete any existing verification tokens for this email
    await EmailVerificationTokenModel.deleteMany({ email: normalizedEmail });

    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification token and code
    const token = uuidv4();
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store verification token with registration data
    await EmailVerificationTokenModel.create({
      email: normalizedEmail,
      token,
      code,
      expiresAt,
      verified: false,
      registrationData: {
        password: hashedPassword,
        name,
      },
    });

    // Send verification email
    const emailResult = await sendVerificationEmail({
      email: normalizedEmail,
      code,
      name,
    });

    if (!emailResult.success) {
      // Clean up token if email failed
      await EmailVerificationTokenModel.deleteOne({ token });
      return NextResponse.json(
        { error: "Failed to send verification email. Please try again." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      message: "Verification email sent",
      token, // Return token so client can track the verification
    });
  } catch (error) {
    console.error("Send verification error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
