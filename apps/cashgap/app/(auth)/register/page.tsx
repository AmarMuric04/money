"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button, useToast } from "@repo/ui";
import { RegisterForm } from "@repo/auth";
import { ArrowLeft } from "lucide-react";
import {
  authFormClassNames,
  authGoogleButton,
  authHeading,
  authLead,
  authTextLink,
} from "../auth-styles";

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
    <div className="flex gap-2">
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
          aria-label={`Digit ${index + 1}`}
          className="h-14 w-0 min-w-0 flex-1 rounded-xl border border-input bg-background text-center text-2xl font-semibold tabular-nums text-foreground outline-none focus:border-foreground focus:ring-2 focus:ring-foreground/15 disabled:opacity-50 dark:bg-input/30"
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
  const [pendingVerification, setPendingVerification] =
    useState<PendingVerification | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);

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

  const adapter = {
    signUp: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
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
          title: "Code sent",
          message: `Check ${email} for a 6-digit code`,
        });

        setResendCountdown(60);
      } catch (err) {
        throw err instanceof Error ? err : new Error("Registration failed");
      } finally {
        setIsLoading(false);
      }
    },
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
          title: "Account created",
          message: "Taking you to your dashboard",
        });

        window.location.href = "/dashboard";
      } catch (err) {
        addToast({
          type: "error",
          title: "Verification failed",
          message: err instanceof Error ? err.message : "Verification failed",
        });
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
        title: "New code sent",
        message: "Check your inbox",
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
  }, []);

  // Show verification step if we have pending verification
  if (pendingVerification) {
    return (
      <div>
        <button
          onClick={handleBackToForm}
          className="flex items-center gap-2 text-[15px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <h1 className={`mt-8 ${authHeading}`}>Check your email</h1>
        <p className={authLead}>
          We sent a 6-digit code to{" "}
          <span className="break-all font-semibold text-foreground">
            {pendingVerification.email}
          </span>
          . It works for 15 minutes.
        </p>

        <form onSubmit={handleVerifyCode} className="mt-10 space-y-6">
          <div>
            <p className="mb-3 text-[15px] font-semibold text-foreground">
              Verification code
            </p>
            <VerificationCodeInput
              value={verificationCode}
              onChange={setVerificationCode}
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            className="h-12 w-full rounded-full text-[15px] font-semibold"
            isLoading={isLoading}
            disabled={verificationCode.length !== 6}
          >
            Verify and create account
          </Button>
        </form>

        <p className="mt-8 text-[15px] text-muted-foreground">
          Didn&apos;t get it?{" "}
          {resendCountdown > 0 ? (
            <span className="tabular-nums">
              Send a new code in {resendCountdown}s
            </span>
          ) : (
            <button
              onClick={handleResendCode}
              className={authTextLink}
              disabled={isLoading}
            >
              Send a new code
            </button>
          )}
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className={authHeading}>Create your account</h1>
      <p className={authLead}>
        Sign up with Google, or with an email and a password of at least 8
        characters.
      </p>

      <Button
        type="button"
        variant="outline"
        className={`mt-10 ${authGoogleButton}`}
        onClick={handleGoogleSignUp}
        isLoading={isGoogleLoading}
      >
        {!isGoogleLoading && <GoogleIcon className="h-5 w-5" />}
        Continue with Google
      </Button>

      <div className="my-6 flex items-center gap-4 text-sm text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        or with email
        <span className="h-px flex-1 bg-border" />
      </div>

      <RegisterForm adapter={adapter} classNames={authFormClassNames} />

      <p className="mt-8 text-[15px] text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className={authTextLink}>
          Log in
        </Link>
      </p>
    </div>
  );
}
