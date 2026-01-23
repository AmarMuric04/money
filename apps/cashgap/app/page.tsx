"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  TrendingUp,
  Wallet,
  PieChart,
  CreditCard,
  ArrowRight,
  Check,
  BarChart3,
  Shield,
} from "lucide-react";
import { Button } from "@repo/ui";

const features = [
  {
    icon: TrendingUp,
    title: "Income Tracking",
    description:
      "Monitor all your income sources in one place. Never miss a payment again.",
  },
  {
    icon: Wallet,
    title: "Expense Management",
    description:
      "Track and categorize your expenses to understand where your money goes.",
  },
  {
    icon: CreditCard,
    title: "Subscription Tracking",
    description: "Keep tabs on recurring payments and avoid surprise charges.",
  },
  {
    icon: PieChart,
    title: "Visual Analytics",
    description:
      "Beautiful charts and insights to visualize your financial health.",
  },
  {
    icon: BarChart3,
    title: "Budget Planning",
    description: "Set budgets and track your progress towards financial goals.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your financial data is encrypted and protected at all times.",
  },
];

const steps = [
  {
    number: "01",
    title: "Create Your Account",
    description:
      "Sign up for free and verify your email to get started in minutes.",
  },
  {
    number: "02",
    title: "Add Your Finances",
    description:
      "Log your income, expenses, and subscriptions to build your financial picture.",
  },
  {
    number: "03",
    title: "Gain Insights",
    description:
      "Get personalized insights and recommendations to improve your finances.",
  },
];

export default function Home() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated" && session?.user;
  const isLoading = status === "loading";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
                <Wallet className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">CashGap</span>
            </Link>

            <nav className="flex items-center gap-3">
              {isLoading ? (
                <div className="h-10 w-24 animate-pulse rounded-xl bg-muted" />
              ) : isAuthenticated ? (
                <Link href="/dashboard">
                  <Button>
                    Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost">Sign In</Button>
                  </Link>
                  <Link href="/register">
                    <Button>Get Started</Button>
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 sm:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Take Control of Your{" "}
              <span className="text-primary">Finances</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              CashGap helps you track income, manage expenses, and monitor
              subscriptions — all in one beautiful, easy-to-use platform.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              {isLoading ? (
                <div className="h-12 w-48 animate-pulse rounded-xl bg-muted" />
              ) : isAuthenticated ? (
                <Link href="/dashboard">
                  <Button size="lg" className="h-12 px-8 text-base">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/register">
                    <Button size="lg" className="h-12 px-8 text-base">
                      Start Free Today
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button
                      variant="secondary"
                      size="lg"
                      className="h-12 px-8 text-base"
                    >
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {[
              { icon: Shield, text: "Bank-Level Security" },
              { icon: TrendingUp, text: "Real-Time Insights" },
              { icon: Wallet, text: "Free Forever Plan" },
            ].map((badge) => (
              <div
                key={badge.text}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <badge.icon className="h-4 w-4 text-primary" />
                <span>{badge.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 border-t border-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground">
              Everything You Need to Manage Money
            </h2>
            <p className="mt-4 text-muted-foreground">
              Powerful features to help you take control of your finances.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/50"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 border-t border-border bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground">How It Works</h2>
            <p className="mt-4 text-muted-foreground">
              Get started in three simple steps.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.number} className="relative text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground">
                  {step.number}
                </div>
                <h3 className="mt-6 text-lg font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-primary p-8 sm:p-12 text-center">
            <h2 className="text-3xl font-bold text-primary-foreground">
              Start Managing Your Money Today
            </h2>
            <p className="mt-4 text-primary-foreground/80">
              Join thousands of users who trust CashGap with their financial
              management.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="h-12 px-8 text-base"
                  >
                    Open Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/register">
                    <Button
                      size="lg"
                      variant="secondary"
                      className="h-12 px-8 text-base"
                    >
                      Create Free Account
                    </Button>
                  </Link>
                  <div className="flex items-center gap-2 text-primary-foreground/80">
                    <Check className="h-4 w-4" />
                    <span className="text-sm">No credit card required</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Wallet className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">CashGap</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} CashGap. Take control of your
              finances.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
