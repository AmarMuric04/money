"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  count?: number;
  countLabel?: string;
  className?: string;
  children?: React.ReactNode;
}

export function SectionHeader({
  icon,
  title,
  count,
  countLabel,
  className,
  children,
}: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      </div>
      <div className="flex-1 h-px bg-border" />
      {count !== undefined && (
        <span className="text-sm text-muted-foreground font-medium">
          {count} {countLabel || (count === 1 ? "item" : "items")}
        </span>
      )}
      {children}
    </div>
  );
}
