"use client";

import { useId, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const pill =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full px-6 text-[15px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";
const pillInk = `${pill} bg-foreground text-background hover:bg-foreground/85`;
const textLink =
  "text-[15px] font-semibold text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground";

const tracked = [
  {
    label: "Income",
    title: "Every source, however often it lands",
    body: "Log salary, side work or a one-off payment. Each entry is marked as once, monthly or yearly.",
  },
  {
    label: "Expenses",
    title: "Sorted as you add them",
    body: "Eight categories, from housing and food to health and entertainment. The dashboard ranks where most of it goes.",
  },
  {
    label: "Subscriptions",
    title: "Recurring charges, in one list",
    body: "Monthly and yearly plans are converted to a monthly total. Pause one without deleting it, and see what renews in the next seven days.",
  },
];

function parseAmount(value: string) {
  const n = Number(value.replace(/,/g, ""));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

const amountFormat = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function AmountField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const id = useId();
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border py-4">
      <label htmlFor={id} className="text-[15px] text-muted-foreground">
        {label}
      </label>
      <input
        id={id}
        inputMode="decimal"
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^\d.,]/g, ""))}
        className="w-36 bg-transparent text-right text-2xl font-semibold tabular-nums tracking-tight text-foreground outline-none placeholder:text-muted-foreground/50 focus:underline focus:decoration-foreground/30 focus:underline-offset-8"
        placeholder="0"
      />
    </div>
  );
}

function GapCalculator() {
  const [income, setIncome] = useState("3,200");
  const [expenses, setExpenses] = useState("1,850");
  const [subscriptions, setSubscriptions] = useState("64");

  const left =
    parseAmount(income) - parseAmount(expenses) - parseAmount(subscriptions);
  const negative = left < 0;

  return (
    <div className="rounded-[28px] border border-border bg-card p-6 sm:p-8">
      <div className="flex items-baseline justify-between">
        <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          One month
        </p>
        <p className="text-[13px] text-muted-foreground">
          Example numbers. Change them.
        </p>
      </div>

      <div className="mt-2">
        <AmountField label="Money in" value={income} onChange={setIncome} />
        <AmountField
          label="Spent"
          value={expenses}
          onChange={setExpenses}
        />
        <AmountField
          label="Subscriptions"
          value={subscriptions}
          onChange={setSubscriptions}
        />
      </div>

      <div className="mt-6 flex items-end justify-between gap-4">
        <p className="pb-1.5 text-[15px] font-semibold text-foreground">
          {negative ? "Short by" : "Left over"}
        </p>
        <p
          aria-live="polite"
          className={`text-right text-5xl font-bold tabular-nums tracking-[-0.04em] sm:text-6xl ${
            negative ? "text-destructive" : "text-foreground"
          }`}
        >
          {amountFormat.format(Math.abs(left))}
        </p>
      </div>
      <p className="mt-4 text-[13px] leading-relaxed text-muted-foreground">
        The same sum your dashboard runs: income minus expenses minus active
        subscriptions. Nothing here is saved.
      </p>
    </div>
  );
}

export default function Home() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated" && !!session?.user;
  const isLoading = status === "loading";

  return (
    <div className="min-h-screen overflow-x-clip bg-background text-foreground">
      <header className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:h-20 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-[19px] font-bold tracking-[-0.03em] text-foreground"
        >
          CashGap
        </Link>
        <nav className="flex items-center gap-5 sm:gap-7">
          {isLoading ? (
            <div className="h-11 w-32 animate-pulse rounded-full bg-muted" />
          ) : isAuthenticated ? (
            <Link href="/dashboard" className={pillInk}>
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-[15px] font-semibold text-foreground hover:text-foreground/70"
              >
                Log in
              </Link>
              <Link href="/register" className={`${pillInk} px-5`}>
                Sign up
              </Link>
            </>
          )}
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl gap-12 px-4 pb-20 pt-10 sm:px-6 sm:pt-16 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16 lg:px-8 lg:pb-28 lg:pt-20">
          <div>
            <h1 className="text-[44px] font-bold leading-[0.98] tracking-[-0.045em] text-foreground sm:text-6xl lg:text-[76px]">
              Know what&rsquo;s left after the bills.
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
              CashGap keeps your income, spending and subscriptions in one
              place, and shows the one number that matters: the gap between
              what comes in and what goes out.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
              {isLoading ? (
                <div className="h-11 w-44 animate-pulse rounded-full bg-muted" />
              ) : isAuthenticated ? (
                <Link href="/dashboard" className={pillInk}>
                  Open your dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <>
                  <Link href="/register" className={pillInk}>
                    Create an account
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link href="/login" className={textLink}>
                    I already have one
                  </Link>
                </>
              )}
            </div>
          </div>

          <GapCalculator />
        </section>

        {/* What you track */}
        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8 lg:pb-28">
          <h2 className="max-w-xl text-3xl font-bold leading-[1.05] tracking-[-0.035em] text-foreground sm:text-[44px]">
            Three lists. One balance.
          </h2>
          <div className="mt-10 grid gap-x-10 sm:grid-cols-3 lg:mt-14">
            {tracked.map((item) => (
              <div
                key={item.label}
                className="border-t border-foreground py-6 sm:pb-0"
              >
                <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  {item.label}
                </p>
                <h3 className="mt-3 text-xl font-semibold leading-snug tracking-[-0.02em] text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* The sum */}
        <section className="bg-muted">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
            <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              How the balance is worked out
            </p>
            <p className="mt-6 text-[34px] font-bold leading-[1.08] tracking-[-0.04em] text-foreground sm:text-5xl lg:text-[64px]">
              Income
              <span className="text-muted-foreground"> − </span>
              expenses
              <span className="text-muted-foreground"> − </span>
              subscriptions
              <span className="text-muted-foreground"> = </span>
              <span className="whitespace-nowrap">your gap.</span>
            </p>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground">
              No forecasts and no scores. The dashboard adds up what you
              entered, lists your five latest transactions and shows which
              categories take the most.
            </p>
          </div>
        </section>

        {/* Close */}
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="flex flex-col gap-8 border-t border-border pt-10 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-3xl font-bold leading-[1.05] tracking-[-0.035em] text-foreground sm:text-[44px]">
                {isAuthenticated
                  ? "Your numbers are waiting."
                  : "Start with this month."}
              </h2>
              <p className="mt-4 max-w-md text-lg leading-relaxed text-muted-foreground">
                {isAuthenticated
                  ? "Pick up where you left off."
                  : "Sign up with Google, or with an email and password."}
              </p>
            </div>
            {isAuthenticated ? (
              <Link href="/dashboard" className={`${pillInk} self-start`}>
                Open your dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link
                href="/register"
                className={`${pillInk} self-start md:self-auto`}
              >
                Create an account
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </section>
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
