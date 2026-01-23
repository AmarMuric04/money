import { useState, useCallback } from "react";
import type { AuthAdapter, UseAuthOptions } from "./types";

/**
 * Enhanced error message helper
 */
function getEnhancedErrorMessage(err: unknown): string {
  if (!(err instanceof Error)) {
    return "An unexpected error occurred";
  }

  const message = err.message.toLowerCase();

  // Filter out technical/internal errors that users shouldn't see
  if (message.includes("csrf") || message.includes("missingcsrf")) {
    return "Session expired. Please refresh the page and try again.";
  }

  if (message.includes("callback") && message.includes("error")) {
    return "Authentication failed. Please try again.";
  }

  if (message.includes("configuration") || message.includes("config")) {
    return "Service temporarily unavailable. Please try again later.";
  }

  // Network errors
  if (message.includes("failed to fetch") || message.includes("network")) {
    return "Unable to connect. Please check your internet connection and try again.";
  }

  // Timeout errors
  if (message.includes("timeout") || message.includes("aborted")) {
    return "Request timed out. Please try again.";
  }

  // CORS errors
  if (message.includes("cors")) {
    return "Connection blocked. Please contact support.";
  }

  // Return original message if it's already user-friendly
  return err.message;
}

export function useAuth({ adapter }: UseAuthOptions = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const signIn = useCallback(
    async (data: Record<string, any>) => {
      setLoading(true);
      setError(null);
      try {
        if (adapter?.signIn) await adapter.signIn(data);
      } catch (err) {
        const enhancedError = new Error(getEnhancedErrorMessage(err));
        setError(enhancedError);
        throw enhancedError;
      } finally {
        setLoading(false);
      }
    },
    [adapter],
  );

  const signUp = useCallback(
    async (data: Record<string, any>) => {
      setLoading(true);
      setError(null);
      try {
        if (adapter?.signUp) await adapter.signUp(data);
      } catch (err) {
        const enhancedError = new Error(getEnhancedErrorMessage(err));
        setError(enhancedError);
        throw enhancedError;
      } finally {
        setLoading(false);
      }
    },
    [adapter],
  );

  const signOut = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (adapter?.signOut) await adapter.signOut();
    } catch (err) {
      const enhancedError = new Error(getEnhancedErrorMessage(err));
      setError(enhancedError);
      throw enhancedError;
    } finally {
      setLoading(false);
    }
  }, [adapter]);

  return { loading, error, signIn, signOut, signUp };
}
