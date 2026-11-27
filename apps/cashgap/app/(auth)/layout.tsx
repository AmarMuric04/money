"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  return (
    // Buttons, checkboxes and focus states use ink here, like the home page.
    <div className="flex min-h-screen flex-col overflow-x-clip bg-background text-foreground [--primary-foreground:var(--background)] [--primary:var(--foreground)]">
      <header className="mx-auto flex h-16 w-full max-w-6xl items-center px-4 sm:h-20 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-[19px] font-bold tracking-[-0.03em] text-foreground"
        >
          CashGap
        </Link>
      </header>

      <main className="flex flex-1 justify-center px-4 pb-20 pt-8 sm:px-6 sm:pt-16">
        <div className="w-full max-w-[400px]">{children}</div>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-baseline gap-4">
            <span className="text-[17px] font-bold tracking-[-0.03em] text-foreground">
              CashGap
            </span>
            <span className="text-sm text-muted-foreground">
              A personal finance tracker.
            </span>
          </div>
          <ThemeToggle />
        </div>
      </footer>
    </div>
  );
}
