"use client";

import * as React from "react";
import { Button, Input, PasswordInput } from "@repo/ui";
import { useAuth } from "./use-auth";

export function LoginForm({
  onSuccess,
  adapter,
}: {
  onSuccess?: () => void;
  adapter?: any;
}) {
  const { loading, error, signIn } = useAuth({ adapter });
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn({ email, password });
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <PasswordInput
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <Button type="submit" disabled={loading}>
        {loading ? "Signing in..." : "Sign in"}
      </Button>
      {error && <div className="text-destructive">{error.message}</div>}
    </form>
  );
}
