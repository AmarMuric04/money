"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@repo/ui";
import { deriveKeys } from "@/lib/crypto/client";
import { useVaultStore } from "@/stores";
import { AlertCircle, Lock, Eye, EyeOff } from "lucide-react";

type Mode = "loading" | "setup" | "unlock";

export function VaultPasswordPrompt({
  onUnlock,
}: {
  onUnlock: () => void;
}) {
  const { data: session } = useSession();
  const { setEncryptionKey } = useVaultStore();

  const [mode, setMode] = useState<Mode>("loading");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if vault is already set up
  useEffect(() => {
    async function checkVaultStatus() {
      try {
        const res = await fetch("/api/auth/vault-setup", {
          credentials: "include",
        });
        if (!res.ok) {
          setMode("setup");
          return;
        }
        const json = await res.json();
        setMode(json.data?.hasVaultSetup ? "unlock" : "setup");
      } catch {
        setMode("setup");
      }
    }
    checkVaultStatus();
  }, []);

  const storeKey = useCallback(
    async (encryptionKey: CryptoKey) => {
      setEncryptionKey(encryptionKey);
      const exportedKey = await crypto.subtle.exportKey("jwk", encryptionKey);
      sessionStorage.setItem("vault_key", JSON.stringify(exportedKey));
    },
    [setEncryptionKey],
  );

  const handleSetup = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      if (password.length < 8) {
        setError("Vault password must be at least 8 characters.");
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      setIsSubmitting(true);

      try {
        // Generate a random salt
        const saltBytes = crypto.getRandomValues(new Uint8Array(32));
        const salt = Array.from(saltBytes)
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");

        // Derive keys from vault password
        const { authHash, encryptionKey } = await deriveKeys(password, salt);

        // Save salt + hashed authHash on the server
        const res = await fetch("/api/auth/vault-setup", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ salt, authHash }),
        });

        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          throw new Error(json.error?.message || "Failed to set up vault password.");
        }

        // Store the encryption key
        await storeKey(encryptionKey);
        onUnlock();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred.",
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [password, confirmPassword, storeKey, onUnlock],
  );

  const handleUnlock = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      if (!password) {
        setError("Please enter your vault password.");
        return;
      }

      setIsSubmitting(true);

      try {
        const email = session?.user?.email;
        if (!email) {
          throw new Error("Session expired. Please refresh the page.");
        }

        // Fetch salt
        const saltRes = await fetch("/api/auth/salt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        if (!saltRes.ok) {
          throw new Error("Failed to retrieve vault data.");
        }

        const saltJson = await saltRes.json();
        const salt = saltJson.data?.salt;

        if (!salt) {
          throw new Error("Failed to retrieve vault data.");
        }

        // Derive keys
        const { authHash, encryptionKey } = await deriveKeys(password, salt);

        // Verify password server-side
        const verifyRes = await fetch("/api/auth/vault-setup", {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ authHash }),
        });

        if (!verifyRes.ok) {
          const json = await verifyRes.json().catch(() => ({}));
          if (verifyRes.status === 401) {
            throw new Error("Incorrect vault password. Please try again.");
          }
          throw new Error(json.error?.message || "Verification failed.");
        }

        // Password is correct - store the encryption key
        await storeKey(encryptionKey);
        onUnlock();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred.",
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [password, session, storeKey, onUnlock],
  );

  if (mode === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500">
          <div className="h-16 w-16 rounded-2xl bg-linear-to-br from-primary to-primary/80 flex items-center justify-center">
            <Lock className="h-8 w-8 text-primary-foreground animate-pulse" />
          </div>
          <p className="text-sm text-muted-foreground">Loading vault...</p>
        </div>
      </div>
    );
  }

  const isSetup = mode === "setup";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-2">
            {isSetup ? "Set up vault password" : "Unlock your vault"}
          </h2>
          <p className="text-muted-foreground">
            {isSetup
              ? "Create a vault password to encrypt your passwords. This is separate from your Google sign-in."
              : "Enter your vault password to decrypt your passwords."}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3 text-destructive">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={isSetup ? handleSetup : handleUnlock}
          className="space-y-4"
        >
          <div>
            <label
              htmlFor="vault-password"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              {isSetup ? "Vault password" : "Vault password"}
            </label>
            <div className="relative">
              <input
                id="vault-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isSetup ? "Create a strong password" : "Enter your vault password"}
                disabled={isSubmitting}
                autoFocus
                className="w-full h-12 px-4 pr-12 border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {isSetup && (
            <div>
              <label
                htmlFor="vault-password-confirm"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Confirm vault password
              </label>
              <input
                id="vault-password-confirm"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                disabled={isSubmitting}
                className="w-full h-12 px-4 border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none disabled:opacity-50"
              />
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold rounded-xl"
            isLoading={isSubmitting}
            disabled={
              isSubmitting ||
              !password ||
              (isSetup && !confirmPassword)
            }
          >
            {isSetup ? "Set vault password" : "Unlock"}
          </Button>
        </form>

        {isSetup && (
          <p className="text-xs text-muted-foreground text-center">
            This password encrypts your vault locally. If you forget it, stored
            passwords cannot be recovered.
          </p>
        )}
      </div>
    </div>
  );
}
