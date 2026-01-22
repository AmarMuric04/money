"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { DashboardLayout as BaseDashboardLayout } from "@repo/ui";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BaseDashboardLayout sidebar={<AppSidebar />}>
      {children}
    </BaseDashboardLayout>
  );
}
