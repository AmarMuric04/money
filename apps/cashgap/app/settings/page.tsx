"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  User,
  DollarSign,
  Download,
  ChevronRight,
  FileJson,
  FileText,
  AlertTriangle,
  Trash2,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";
import { Button, DashboardWrapper } from "@repo/ui";
import { useFinanceStore } from "@/stores";

export default function SettingsPage() {
  const { incomes, expenses, subscriptions, clearAllData } = useFinanceStore();

  // Export modal state
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<"json" | "csv">("json");
  const [isExporting, setIsExporting] = useState(false);

  // Delete confirmation state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDeleteAllData = useCallback(async () => {
    setIsDeleting(true);
    try {
      clearAllData();
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  }, [clearAllData]);

  const settingsItems = [
    {
      type: "link" as const,
      href: "/settings/currency",
      icon: DollarSign,
      label: "Currency",
      description: "Choose your preferred currency",
    },
    {
      type: "link" as const,
      href: "/settings/profile",
      icon: User,
      label: "Profile",
      description: "Update your name and preferences",
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
      onClick: () => setShowDeleteModal(true),
      icon: Trash2,
      label: "Delete All Data",
      description: "Permanently delete all your financial data",
      variant: "danger" as const,
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
        {showExportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setShowExportModal(false)}
            />
            <div className="relative bg-card border rounded-3xl shadow-lg p-6 w-full max-w-md mx-4 space-y-6">
              <h2 className="text-xl font-semibold">Export Financial Data</h2>

              <p className="text-sm text-muted-foreground">
                Export all your income, expenses, and subscriptions data.
              </p>

              <div className="space-y-3">
                <label className="text-sm font-medium">Export Format</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setExportFormat("json")}
                    className={`flex items-center gap-3 p-4 rounded-xl border transition-colors cursor-pointer ${
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
                    className={`flex items-center gap-3 p-4 rounded-xl border transition-colors cursor-pointer ${
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
                      <p className="text-xs text-muted-foreground">
                        Spreadsheet
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowExportModal(false)}
                  className="flex-1 h-12 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleExport}
                  disabled={isExporting}
                  isLoading={isExporting}
                  className="flex-1 h-12 rounded-xl"
                >
                  Export
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setShowDeleteModal(false)}
            />
            <div className="relative bg-card border rounded-3xl shadow-lg p-6 w-full max-w-md mx-4 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-destructive/10">
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                </div>
                <h2 className="text-xl font-semibold">Delete All Data</h2>
              </div>

              <p className="text-muted-foreground">
                This action cannot be undone. All your income, expenses, and
                subscriptions will be permanently deleted.
              </p>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 h-12 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAllData}
                  disabled={isDeleting}
                  isLoading={isDeleting}
                  className="flex-1 h-12 rounded-xl"
                >
                  Delete All
                </Button>
              </div>
            </div>
          </div>
        )}
      </DashboardWrapper>
    </DashboardLayout>
  );
}
