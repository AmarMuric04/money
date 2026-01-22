"use client";

import { useEffect, useState } from "react";

/**
 * Hook to detect when the client has hydrated
 * Useful for showing skeleton states while Zustand store rehydrates from localStorage
 */
export function useHydration() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated;
}
