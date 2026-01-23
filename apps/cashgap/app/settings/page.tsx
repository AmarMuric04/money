"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  User,
  Download,
  ChevronRight,
  FileJson,
  FileText,
  LogOut,
  Settings2,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";
import { Button, DashboardWrapper, Modal } from "@repo/ui";
import { useFinanceStore } from "@/stores";

export default function SettingsPage() {
  const { incomes, expenses, subscriptions } = useFinanceStore();

  // Export modal state
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<"json" | "csv">("json");
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = useCallback(async () => {
    const totalItems = incomes.length + expenses.length + subscriptions.length;
    if (totalItems === 0) {
      alert("No data to export.");
      return;
    }

    setIsExporting(true);
    try {
      const exportData = {
        incomes,
        expenses,
        subscriptions,
        exportedAt: new Date().toISOString(),
      };

      let content: string;
      let mimeType: string;
      let filename: string;

      if (exportFormat === "json") {
        content = JSON.stringify(exportData, null, 2);
        mimeType = "application/json";
        filename = `cashgap-export-${new Date().toISOString().split("T")[0]}.json`;
      } else {
        // CSV format - flatten all data
        const allTransactions = [
          ...incomes.map((i) => ({
            type: "income",
            name: i.name,
            amount: i.amount,
            category: i.category || "",
            frequency: i.frequency,
            date: i.date,
          })),
          ...expenses.map((e) => ({
            type: "expense",
            name: e.name,
            amount: e.amount,
            category: e.category,
            frequency: "once",
            date: e.date,
          })),
          ...subscriptions.map((s) => ({
            type: "subscription",
            name: s.name,
            amount: s.amount,
            category: s.category || "",
            frequency: s.frequency,
            date: s.nextBillingDate,
          })),
        ];

        const headers = [
          "Type",
          "Name",
          "Amount",
          "Category",
          "Frequency",
          "Date",
        ];
        const rows = allTransactions.map((t) => [
          t.type,
          t.name,
          String(t.amount),
          t.category,
          t.frequency,
          t.date,
        ]);

        const escapeCsv = (value: string) => {
          if (
            value.includes(",") ||
            value.includes('"') ||
            value.includes("\n")
          ) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        };

        content = [
          headers.join(","),
          ...rows.map((row) => row.map(escapeCsv).join(",")),
        ].join("\n");
        mimeType = "text/csv";
        filename = `cashgap-export-${new Date().toISOString().split("T")[0]}.csv`;
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setShowExportModal(false);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export data. Please try again.");
    } finally {
      setIsExporting(false);
    }
  }, [incomes, expenses, subscriptions, exportFormat]);

  const handleSignOut = useCallback(async () => {
    await signOut({ callbackUrl: "/login" });
  }, []);

  const settingsItems = [
    {
      type: "link" as const,
      href: "/settings/profile",
      icon: User,
      label: "Profile",
      description: "Update your name and profile information",
    },
    {
      type: "link" as const,
      href: "/settings/account",
      icon: Settings2,
      label: "Account",
      description: "Manage your account and danger zone",
    },
    {
      type: "action" as const,
      onClick: () => setShowExportModal(true),
      icon: Download,
      label: "Export Data",
      description: "Download your financial data as JSON or CSV",
    },
    {
      type: "action" as const,
      onClick: handleSignOut,
      icon: LogOut,
      label: "Sign Out",
      description: "Sign out of your account",
    },
  ];

  return (
    <DashboardLayout>
      <DashboardWrapper>
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Settings
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage your account and preferences
            </p>
          </div>

          <div className="space-y-2">
            {settingsItems.map((item) => {
              const Icon = item.icon;
              const isDanger = "variant" in item && item.variant === "danger";

              if (item.type === "link") {
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center justify-between p-4 rounded-2xl border border-border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-xl bg-muted">
                        <Icon className="w-5 h-5 text-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {item.label}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </Link>
                );
              }

              return (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-colors text-left cursor-pointer ${
                    isDanger
                      ? "border-destructive/50 bg-destructive/5 hover:bg-destructive/10"
                      : "border-border bg-card hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-2 rounded-xl ${isDanger ? "bg-destructive/10" : "bg-muted"}`}
                    >
                      <Icon
                        className={`w-5 h-5 ${isDanger ? "text-destructive" : "text-foreground"}`}
                      />
                    </div>
                    <div>
                      <p
                        className={`font-medium ${isDanger ? "text-destructive" : "text-foreground"}`}
                      >
                        {item.label}
                      </p>
                      <p
                        className={`text-sm ${isDanger ? "text-destructive/70" : "text-muted-foreground"}`}
                      >
                        {item.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Export Modal */}
        <Modal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          title="Export Financial Data"
        >
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Export all your income, expenses, and subscriptions data.
            </p>

            <div className="space-y-3">
              <label className="text-sm font-medium">Export Format</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setExportFormat("json")}
                  className={`flex items-center gap-3 p-4 rounded-lg border transition-colors ${
                    exportFormat === "json"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50"
                  }`}
                >
                  <FileJson
                    className={`w-5 h-5 ${exportFormat === "json" ? "text-primary" : "text-muted-foreground"}`}
                  />
                  <div className="text-left">
                    <p className="font-medium">JSON</p>
                    <p className="text-xs text-muted-foreground">
                      Structured data
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => setExportFormat("csv")}
                  className={`flex items-center gap-3 p-4 rounded-lg border transition-colors ${
                    exportFormat === "csv"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50"
                  }`}
                >
                  <FileText
                    className={`w-5 h-5 ${exportFormat === "csv" ? "text-primary" : "text-muted-foreground"}`}
                  />
                  <div className="text-left">
                    <p className="font-medium">CSV</p>
                    <p className="text-xs text-muted-foreground">Spreadsheet</p>
                  </div>
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowExportModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleExport}
                isLoading={isExporting}
                className="flex-1"
              >
                Export
              </Button>
            </div>
          </div>
        </Modal>
      </DashboardWrapper>
    </DashboardLayout>
  );
}
