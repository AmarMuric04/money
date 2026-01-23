"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button, useToast } from "@repo/ui";
import { Mail, AlertCircle, ArrowLeft } from "lucide-react";

// Google icon component
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

// Verification code input component
function VerificationCodeInput({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, digit: string) => {
    if (!/^\d*$/.test(digit)) return;

    const newValue = value.split("");
    newValue[index] = digit;
    const newCode = newValue.join("").slice(0, 6);
    onChange(newCode);

    // Move to next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    onChange(pastedData);
    if (pastedData.length === 6) {
      inputRefs.current[5]?.focus();
    }
  };

  return (
    <div className="flex gap-2 justify-center">
      {[0, 1, 2, 3, 4, 5].map((index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index] || ""}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className="w-12 h-14 text-center text-2xl font-semibold border border-border rounded-lg bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none disabled:opacity-50"
        />
      ))}
    </div>
  );
}

interface PendingVerification {
  token: string;
  email: string;
  password: string;
}

export default function RegisterPage() {
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingVerification, setPendingVerification] =
    useState<PendingVerification | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Countdown timer for resend
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(
        () => setResendCountdown(resendCountdown - 1),
        1000,
      );
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to sign up with Google",
      });
      setIsGoogleLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/verify-email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to send verification email");
      }

      setPendingVerification({
        token: result.token,
        email,
        password,
      });

      addToast({
        type: "success",
        title: "Verification email sent!",
        message: "Please check your inbox for the verification code",
      });

      setResendCountdown(60);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!pendingVerification) return;

      if (verificationCode.length !== 6) {
        addToast({
          type: "error",
          title: "Invalid code",
          message: "Please enter the 6-digit verification code",
        });
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/auth/verify-email/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: pendingVerification.token,
            code: verificationCode,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Verification failed");
        }

        // Sign in after successful verification
        const signInResult = await signIn("credentials", {
          email: pendingVerification.email,
          password: pendingVerification.password,
          redirect: false,
        });

        if (signInResult?.error) {
          throw new Error("Account created but login failed. Please sign in.");
        }

        addToast({
          type: "success",
          title: "Account created!",
          message: "Welcome to CashGap",
        });

        window.location.href = "/dashboard";
      } catch (err) {
        setError(err instanceof Error ? err.message : "Verification failed");
        setIsLoading(false);
      }
    },
    [verificationCode, pendingVerification, addToast],
  );

  const handleResendCode = useCallback(async () => {
    if (resendCountdown > 0 || !pendingVerification) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/verify-email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: pendingVerification.email,
          password: pendingVerification.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to resend code");
      }

      setPendingVerification({
        ...pendingVerification,
        token: result.token,
      });

      addToast({
        type: "success",
        title: "Code resent!",
        message: "Please check your inbox",
      });

      setResendCountdown(60);
    } catch (err) {
      addToast({
        type: "error",
        title: "Failed to resend",
        message: err instanceof Error ? err.message : "Please try again",
      });
    } finally {
      setIsLoading(false);
    }
  }, [resendCountdown, pendingVerification, addToast]);

  const handleBackToForm = useCallback(() => {
    setPendingVerification(null);
    setVerificationCode("");
    setError(null);
  }, []);

  // Show verification step if we have pending verification
  if (pendingVerification) {
    return (
      <div className="space-y-6">
        <button
          onClick={handleBackToForm}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm font-medium">Back to registration</span>
        </button>

        <div className="text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-3">
            Check your email
          </h2>
          <p className="text-muted-foreground text-lg">
            We sent a verification code to
          </p>
          <p className="font-semibold text-foreground text-lg mt-1">
            {pendingVerification.email}
          </p>
        </div>

        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3 text-destructive">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleVerifyCode} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-4 text-center">
              Enter verification code
            </label>
            <VerificationCodeInput
              value={verificationCode}
              onChange={setVerificationCode}
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold rounded-xl"
            isLoading={isLoading}
            disabled={verificationCode.length !== 6}
          >
            Verify & Create Account
          </Button>
        </form>

        <div className="text-center">
          <p className="text-muted-foreground">
            Didn&apos;t receive the code?{" "}
            {resendCountdown > 0 ? (
              <span className="text-muted-foreground font-medium">
                Resend in {resendCountdown}s
              </span>
            ) : (
              <button
                onClick={handleResendCode}
                className="text-primary hover:underline font-semibold transition-colors"
                disabled={isLoading}
              >
                Resend code
              </button>
            )}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">
          Create your account
        </h2>
        <p className="text-muted-foreground mt-2">
          Start tracking your finances today
        </p>
      </div>

      {/* Google Sign Up */}
      <Button
        type="button"
        variant="outline"
        className="w-full h-12 rounded-xl gap-3"
        onClick={handleGoogleSignUp}
        isLoading={isGoogleLoading}
      >
        {!isGoogleLoading && <GoogleIcon className="h-5 w-5" />}
        Continue with Google
      </Button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-background text-muted-foreground">
            Or sign up with email
          </span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3 text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Register Form */}
      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-foreground mb-2"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-foreground mb-2"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
            placeholder="At least 8 characters"
          />
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-foreground mb-2"
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
            placeholder="Confirm your password"
          />
        </div>

        <Button
          type="submit"
          className="w-full h-12 rounded-xl"
          isLoading={isLoading}
        >
          Continue
        </Button>
      </form>

      {/* Sign in link */}
      <div className="text-center">
        <span className="text-muted-foreground">Already have an account? </span>
        <Link
          href="/login"
          className="text-primary font-semibold hover:underline"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
