"use client";

import { useCallback, useState } from "react";
import { signIn } from "next-auth/react";

interface PendingVerification {
  token: string;
  email: string;
  password: string;
}

interface UseAuthFlowReturn {
  isLoading: boolean;
  error: string | null;
  pendingVerification: { token: string; email: string } | null;
  startRegistration: (
    email: string,
    password: string,
    name?: string,
  ) => Promise<{ success: boolean; token?: string }>;
  completeRegistration: (code: string) => Promise<boolean>;
  clearPendingVerification: () => void;
}

export function useAuthFlow(): UseAuthFlowReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingVerification, setPendingVerification] =
    useState<PendingVerification | null>(null);

  /**
   * Start registration flow - sends verification email
   */
  const startRegistration = useCallback(
    async (
      email: string,
      password: string,
      name?: string,
    ): Promise<{ success: boolean; token?: string }> => {
      setIsLoading(true);
      setError(null);

      try {
        // Send verification email with registration data
        const response = await fetch("/api/auth/verify-email/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            name,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          setError(result.error || "Failed to send verification email");
          setIsLoading(false);
          return { success: false };
        }

        // Store pending verification data
        setPendingVerification({
          token: result.token,
          email,
          password,
        });

        setIsLoading(false);
        return { success: true, token: result.token };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An error occurred";
        setError(message);
        setIsLoading(false);
        return { success: false };
      }
    },
    [],
  );

  /**
   * Complete registration - verify code and create account
   */
  const completeRegistration = useCallback(
    async (code: string): Promise<boolean> => {
      if (!pendingVerification) {
        setError("No pending verification. Please start registration again.");
        return false;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Verify the code and complete registration
        const response = await fetch("/api/auth/verify-email/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: pendingVerification.token,
            code,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          setError(result.error || "Verification failed");
          setIsLoading(false);
          return false;
        }

        // Sign in with NextAuth to create a proper session
        const signInResult = await signIn("credentials", {
          email: pendingVerification.email,
          password: pendingVerification.password,
          redirect: false,
        });

        if (signInResult?.error) {
          console.error(
            "NextAuth sign-in after registration failed:",
            signInResult.error,
          );
          // Registration succeeded but session creation failed
          // User will need to log in manually
          setError("Account created. Please log in.");
          setIsLoading(false);
          return false;
        }

        // Keep loading state active to prevent UI flash before redirect
        return true;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An error occurred";
        setError(message);
        setIsLoading(false);
        return false;
      }
    },
    [pendingVerification],
  );

  /**
   * Clear pending verification state
   */
  const clearPendingVerification = useCallback(() => {
    setPendingVerification(null);
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    pendingVerification: pendingVerification
      ? { token: pendingVerification.token, email: pendingVerification.email }
      : null,
    startRegistration,
    completeRegistration,
    clearPendingVerification,
  };
}
