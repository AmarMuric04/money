"use client";

import { useState, useCallback } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft, Trash2, AlertTriangle, UserX } from "lucide-react";
import { Button, Input, Modal, DashboardWrapper } from "@repo/ui";
import DashboardLayout from "@/components/dashboard-layout";
import { useFinanceStore } from "@/stores";

export default function AccountSettingsPage() {
  const { clearAllData } = useFinanceStore();

  // Delete account modal state
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [deleteAccountConfirmation, setDeleteAccountConfirmation] =
    useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Delete all data modal state
  const [showDeleteDataModal, setShowDeleteDataModal] = useState(false);
  const [deleteDataConfirmation, setDeleteDataConfirmation] = useState("");
  const [isDeletingData, setIsDeletingData] = useState(false);

  const handleDeleteAccount = useCallback(async () => {
    if (deleteAccountConfirmation !== "DELETE") return;

    setIsDeletingAccount(true);
    try {
      const response = await fetch("/api/user/profile", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete account");
      }

      await signOut({ callbackUrl: "/" });
    } catch (error) {
      console.error("Delete account failed:", error);
      alert("Failed to delete account. Please try again.");
    } finally {
      setIsDeletingAccount(false);
    }
  }, [deleteAccountConfirmation]);

  const handleDeleteAllData = useCallback(() => {
    if (deleteDataConfirmation !== "DELETE") return;

    setIsDeletingData(true);
    try {
      clearAllData();
      setShowDeleteDataModal(false);
      setDeleteDataConfirmation("");
    } finally {
      setIsDeletingData(false);
    }
  }, [deleteDataConfirmation, clearAllData]);

  return (
    <DashboardLayout>
      <DashboardWrapper>
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-start gap-4">
            <Link href="/settings">
              <Button variant="ghost" className="p-2 rounded-2xl mt-1">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Account
              </h1>
              <p className="text-muted-foreground text-lg">
                Manage your account settings
              </p>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <h2 className="text-lg font-semibold text-destructive">
                Danger Zone
              </h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Actions in this section are irreversible. Please proceed with
              caution.
            </p>

            {/* Delete All Financial Data */}
            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
                  <Trash2 className="h-6 w-6 text-destructive" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">
                    Delete All Financial Data
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Permanently delete all your income, expenses, and
                    subscriptions. Your account will remain active but all
                    financial data will be removed. This action cannot be
                    undone.
                  </p>
                </div>
              </div>

              <Button
                variant="destructive"
                onClick={() => setShowDeleteDataModal(true)}
                className="w-full sm:w-auto"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete All Data
              </Button>
            </div>

            {/* Delete Account */}
            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
                  <UserX className="h-6 w-6 text-destructive" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">
                    Delete Account
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Permanently delete your account and all associated data.
                    This includes all your income, expenses, subscriptions, and
                    settings. This action cannot be undone.
                  </p>
                </div>
              </div>

              <Button
                variant="destructive"
                onClick={() => setShowDeleteAccountModal(true)}
                className="w-full sm:w-auto"
              >
                <UserX className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </div>
        </div>

        {/* Delete All Data Modal */}
        <Modal
          isOpen={showDeleteDataModal}
          onClose={() => {
            setShowDeleteDataModal(false);
            setDeleteDataConfirmation("");
          }}
          title="Delete All Financial Data"
        >
          <div className="space-y-6">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-destructive">
                  This action cannot be undone
                </p>
                <p className="text-muted-foreground">
                  All your income, expenses, and subscriptions will be
                  permanently deleted. Your account will remain active.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Type <span className="font-mono text-destructive">DELETE</span>{" "}
                to confirm
              </label>
              <Input
                value={deleteDataConfirmation}
                onChange={(e) => setDeleteDataConfirmation(e.target.value)}
                placeholder="DELETE"
                className="font-mono"
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowDeleteDataModal(false);
                  setDeleteDataConfirmation("");
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAllData}
                isLoading={isDeletingData}
                disabled={deleteDataConfirmation !== "DELETE"}
                className="flex-1"
              >
                Delete All Data
              </Button>
            </div>
          </div>
        </Modal>

        {/* Delete Account Modal */}
        <Modal
          isOpen={showDeleteAccountModal}
          onClose={() => {
            setShowDeleteAccountModal(false);
            setDeleteAccountConfirmation("");
          }}
          title="Delete Account"
        >
          <div className="space-y-6">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-destructive">
                  This action cannot be undone
                </p>
                <p className="text-muted-foreground">
                  All your data, including income, expenses, subscriptions, and
                  account settings will be permanently deleted.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Type <span className="font-mono text-destructive">DELETE</span>{" "}
                to confirm
              </label>
              <Input
                value={deleteAccountConfirmation}
                onChange={(e) => setDeleteAccountConfirmation(e.target.value)}
                placeholder="DELETE"
                className="font-mono"
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowDeleteAccountModal(false);
                  setDeleteAccountConfirmation("");
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                isLoading={isDeletingAccount}
                disabled={deleteAccountConfirmation !== "DELETE"}
                className="flex-1"
              >
                Delete Account
              </Button>
            </div>
          </div>
        </Modal>
      </DashboardWrapper>
    </DashboardLayout>
  );
}
