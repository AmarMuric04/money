import { useState, useCallback } from "react";
import type { AuthAdapter, UseAuthOptions } from "./types";

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
        setError(err as Error);
        throw err;
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
        setError(err as Error);
        throw err;
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
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [adapter]);

  return { loading, error, signIn, signOut, signUp };
}
