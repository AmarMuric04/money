"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex gap-1 rounded-lg border border-border p-1 bg-muted/50">
        <div className="w-9 h-9" />
        <div className="w-9 h-9" />
        <div className="w-9 h-9" />
      </div>
    );
  }

  const themes = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
    { value: "system", icon: Monitor, label: "System" },
  ];

  return (
    <div className="flex gap-1 rounded-lg border border-border p-1 bg-muted/50">
      {themes.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`flex items-center justify-center w-9 h-9 rounded-md transition-colors ${
            theme === value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
          }`}
          title={label}
          aria-label={`Switch to ${label.toLowerCase()} theme`}
        >
          <Icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  );
}
