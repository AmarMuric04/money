"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Wallet,
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Settings,
  Plus,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  Button,
  SimpleNavUser,
} from "@repo/ui";

const mainNavigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Income", href: "/income", icon: TrendingUp },
  { name: "Expenses", href: "/expenses", icon: TrendingDown },
  { name: "Subscriptions", href: "/subscriptions", icon: CreditCard },
];

const settingsNavigation = [
  { name: "Settings", href: "/settings", icon: Settings },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const router = useRouter();

  // Prefetch routes on hover for faster navigation
  const handlePrefetch = (href: string) => {
    router.prefetch(href);
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Wallet className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">CashGap</span>
                  <span className="truncate text-xs text-muted-foreground">
                    Finance Tracker
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Add Transaction Button */}
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupContent>
            <Button asChild className="w-full rounded-xl">
              <Link href="/income/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Transaction
              </Link>
            </Button>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Main Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Overview
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavigation.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.name}
                      onMouseEnter={() => handlePrefetch(item.href)}
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsNavigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.name}
                      onMouseEnter={() => handlePrefetch(item.href)}
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SimpleNavUser name="User" subtitle="Free Plan" />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
