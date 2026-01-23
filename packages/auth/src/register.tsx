"use client";

import * as React from "react";
import { Button, Input, PasswordInput, Checkbox } from "@repo/ui";
import { useAuth } from "./use-auth";

export function RegisterForm({
  onSuccess,
  adapter,
}: {
  onSuccess?: () => void;
  adapter?: any;
}) {
  const { loading, error, signUp } = useAuth({ adapter });
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [agree, setAgree] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signUp({ email, password });
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
      <label className="flex items-center gap-2">
        <Checkbox
          checked={agree}
          onCheckedChange={(checked) => setAgree(checked as boolean)}
        />{" "}
        I agree
      </label>
      <Button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create account"}
      </Button>
      {error && <div className="text-destructive">{error.message}</div>}
    </form>
  );
}
