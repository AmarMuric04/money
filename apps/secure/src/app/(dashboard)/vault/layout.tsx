"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useVaultStore } from "@/stores";
import { useEncryptionKeyMonitor } from "@/hooks";
import { AppSidebar } from "@/components/app-sidebar";
import { DashboardLayout } from "@repo/ui";

export default function VaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isInitialized, setIsInitialized] = useState(false);

  const { encryptionKey, setEncryptionKey } = useVaultStore();

  // Monitor and maintain encryption key
  useEncryptionKeyMonitor();

  // Initialize encryption key
  useEffect(() => {
    const initializeVaultKey = async () => {
      if (status === "authenticated" && !encryptionKey) {
        // Check if we have a stored key in sessionStorage
        const storedKeyData = sessionStorage.getItem("vault_key");

        if (storedKeyData) {
          try {
            const keyData = JSON.parse(storedKeyData);
            const key = await crypto.subtle.importKey(
              "jwk",
              keyData,
              { name: "AES-GCM", length: 256 },
              true,
              ["encrypt", "decrypt"],
            );
            setEncryptionKey(key);
            setIsInitialized(true);
            return;
          } catch (error) {
            console.error("[VaultLayout] Failed to import key:", error);
            sessionStorage.removeItem("vault_key");
          }
        }

        // No stored key found
        // For OAuth users: generate a new random key (they don't have password-derived keys)
        // For credential users: auto-logout and redirect to login to derive key from password
        const isOAuthUser = session?.user?.provider === "google";

        if (isOAuthUser) {
          // OAuth users can use a new random key - their passwords will be fresh
          const newKey = await crypto.subtle.generateKey(
            { name: "AES-GCM", length: 256 },
            true,
            ["encrypt", "decrypt"],
          );
          setEncryptionKey(newKey); // This will auto-persist to sessionStorage
          setIsInitialized(true);
        } else {
          // Credential users: encryption key is lost, must re-login to derive it
          console.warn(
            "[VaultLayout] Encryption key missing for credential user - forcing re-login",
          );
          await signOut({ redirect: false });
          router.push("/login?reason=session_expired");
          return;
        }
      } else if (status === "authenticated" && encryptionKey) {
        setIsInitialized(true);
      }
    };

    initializeVaultKey();
  }, [status, session, encryptionKey, setEncryptionKey, router]);

  // Periodically check and restore encryption key from sessionStorage
  // This handles edge cases where the Zustand state is cleared but sessionStorage persists
  useEffect(() => {
    if (status !== "authenticated" || !isInitialized) return;

    const checkEncryptionKey = async () => {
      // If key is missing from store but exists in sessionStorage, restore it
      if (!encryptionKey) {
        const storedKeyData = sessionStorage.getItem("vault_key");
        if (storedKeyData) {
          try {
            const keyData = JSON.parse(storedKeyData);
            const key = await crypto.subtle.importKey(
              "jwk",
              keyData,
              { name: "AES-GCM", length: 256 },
              true,
              ["encrypt", "decrypt"],
            );
            console.log(
              "[VaultLayout] Restored encryption key from sessionStorage",
            );
            setEncryptionKey(key);
          } catch (error) {
            console.error(
              "[VaultLayout] Failed to restore key from sessionStorage:",
              error,
            );
            sessionStorage.removeItem("vault_key");
            // Force re-login for credential users
            if (session?.user?.provider !== "google") {
              await signOut({ redirect: false });
              router.push("/login?reason=session_expired");
            }
          }
        }
      }
    };

    // Check every 30 seconds
    const intervalId = setInterval(checkEncryptionKey, 30000);
    return () => clearInterval(intervalId);
  }, [status, isInitialized, encryptionKey, setEncryptionKey, router, session]);

  // Redirect to login if not authenticated
  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  // Show loading while initializing
  if (status === "loading" || (status === "authenticated" && !isInitialized)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6 animate-in fade-in duration-500">
          {/* Animated lock icon */}
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl animate-pulse" />
            <div className="relative h-20 w-20 rounded-2xl bg-linear-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
              <svg
                className="h-10 w-10 text-primary-foreground animate-pulse"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
          </div>

          {/* Loading text */}
          <div className="flex flex-col items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">
              Unlocking vault
            </h2>
            <p className="text-sm text-muted-foreground">
              Initializing encryption keys...
            </p>
          </div>

          {/* Loading dots */}
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-2 w-2 rounded-full bg-primary animate-bounce"
                style={{
                  animationDelay: `${i * 0.15}s`,
                  animationDuration: "0.6s",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return <DashboardLayout sidebar={<AppSidebar />}>{children}</DashboardLayout>;
}
