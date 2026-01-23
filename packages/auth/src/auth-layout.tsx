import * as React from "react";
import { DashboardWrapper } from "@repo/ui";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <DashboardWrapper>
        <div className="max-w-md w-full">{children}</div>
      </DashboardWrapper>
    </div>
  );
}
