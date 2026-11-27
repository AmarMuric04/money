"use client";

import * as React from "react";
import { Button, cn, Input, PasswordInput, Checkbox } from "@repo/ui";
import { useAuth } from "./use-auth";

export function RegisterForm({
  onSuccess,
  adapter,
  classNames,
}: {
  onSuccess?: () => void;
  adapter?: any;
  /** Optional style overrides; `error` replaces the default error box classes. */
  classNames?: { error?: string; submit?: string; link?: string };
}) {
  const { loading, error, signUp } = useAuth({ adapter });
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [agree, setAgree] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    if (!email || !password) {
      return; // Let HTML5 validation handle it
    }

    try {
      await signUp({ email, password });
    } catch {
      return; // useAuth already stored the error, which is shown above the form
    }
    onSuccess?.();
  };

  return (
    <div className="space-y-4">
      {error && (
        <div
          role="alert"
          className={
            classNames?.error ??
            "p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3 text-red-600 dark:text-red-400"
          }
        >
          <svg
            className="h-5 w-5 shrink-0 mt-0.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span className="text-sm flex-1">{error.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <PasswordInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          minLength={8}
        />
        <label className="flex items-start gap-2 text-sm">
          <Checkbox
            checked={agree}
            onCheckedChange={(checked) => setAgree(checked as boolean)}
            className="mt-0.5"
          />
          <span className="text-muted-foreground">
            I agree to the{" "}
            <a href="/terms" className={cn("text-primary hover:underline", classNames?.link)}>
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className={cn("text-primary hover:underline", classNames?.link)}>
              Privacy Policy
            </a>
          </span>
        </label>
        <Button
          type="submit"
          disabled={loading || !agree}
          isLoading={loading}
          className={cn("w-full h-12 rounded-xl", classNames?.submit)}
        >
          Create account
        </Button>
      </form>
    </div>
  );
}
