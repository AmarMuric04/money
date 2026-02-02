"use client";

import { useEffect, useCallback } from "react";
import { useVaultStore } from "@/stores";
import { useSession } from "next-auth/react";

/**
 * Hook to monitor and maintain the encryption key
 * Restores it from sessionStorage if it gets lost from the store
 * This prevents decryption failures that occur when the key is lost
 */
export function useEncryptionKeyMonitor() {
  const { status } = useSession();
  const encryptionKey = useVaultStore((state) => state.encryptionKey);
  const setEncryptionKey = useVaultStore((state) => state.setEncryptionKey);

  const restoreKeyFromStorage = useCallback(async () => {
    // Don't attempt restoration if not authenticated
    if (status !== "authenticated") return false;

    // If key already exists, no need to restore
    if (encryptionKey) return true;

    // Try to restore from sessionStorage
    const storedKeyData = sessionStorage.getItem("vault_key");
    if (!storedKeyData) {
      console.warn(
        "[EncryptionKeyMonitor] No encryption key found in sessionStorage",
      );
      return false;
    }

    try {
      const keyData = JSON.parse(storedKeyData);
      const key = await crypto.subtle.importKey(
        "jwk",
        keyData,
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"],
      );

      console.log("[EncryptionKeyMonitor] Successfully restored encryption key");
      setEncryptionKey(key);
      return true;
    } catch (error) {
      console.error(
        "[EncryptionKeyMonitor] Failed to restore encryption key:",
        error,
      );
      sessionStorage.removeItem("vault_key");
      return false;
    }
  }, [status, encryptionKey, setEncryptionKey]);

  // Monitor encryption key and restore if needed
  useEffect(() => {
    if (status !== "authenticated") return;

    // Initial check on mount
    restoreKeyFromStorage();

    // Periodic check every 30 seconds
    const intervalId = setInterval(() => {
      if (!encryptionKey) {
        console.warn(
          "[EncryptionKeyMonitor] Encryption key lost, attempting restore...",
        );
        restoreKeyFromStorage();
      }
    }, 30000);

    return () => clearInterval(intervalId);
  }, [status, encryptionKey, restoreKeyFromStorage]);

  // Also listen for visibility change events to restore key when tab becomes visible
  useEffect(() => {
    if (status !== "authenticated") return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && !encryptionKey) {
        console.log(
          "[EncryptionKeyMonitor] Tab became visible, checking encryption key...",
        );
        restoreKeyFromStorage();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [status, encryptionKey, restoreKeyFromStorage]);

  // Listen for storage events (in case sessionStorage is modified externally)
  useEffect(() => {
    if (status !== "authenticated") return;

    const handleStorageChange = (e: StorageEvent) => {
      // If vault_key was removed from sessionStorage, clear the store
      if (e.key === "vault_key" && e.newValue === null && encryptionKey) {
        console.warn(
          "[EncryptionKeyMonitor] Encryption key removed from sessionStorage, locking vault",
        );
        useVaultStore.getState().lockVault();
      }
      // If vault_key was added/updated and we don't have a key, restore it
      else if (e.key === "vault_key" && e.newValue && !encryptionKey) {
        console.log(
          "[EncryptionKeyMonitor] Encryption key added to sessionStorage, restoring...",
        );
        restoreKeyFromStorage();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [status, encryptionKey, restoreKeyFromStorage]);

  return { restoreKeyFromStorage };
}
