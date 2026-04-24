"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-md",
          className,
        )}
      />
    );
  }

  const cycle = () => {
    if (theme === "system") setTheme("light");
    else if (theme === "light") setTheme("dark");
    else setTheme("system");
  };

  const icon =
    theme === "system" ? (
      <Monitor size={15} />
    ) : resolvedTheme === "dark" ? (
      <Moon size={15} />
    ) : (
      <Sun size={15} />
    );

  const label =
    theme === "system" ? "System" : theme === "dark" ? "Dark" : "Light";

  return (
    <button
      onClick={cycle}
      title={label}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
        className,
      )}
    >
      {icon}
    </button>
  );
}
