"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Button } from "./Button";
import { FiSun, FiMoon } from "react-icons/fi";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <Button variant="ghost" size="icon" disabled className="w-10 h-10 rounded-full" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      className="w-10 h-10 rounded-full text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <FiSun className="h-5 w-5 animate-in fade-in zoom-in duration-300" />
      ) : (
        <FiMoon className="h-5 w-5 animate-in fade-in zoom-in duration-300" />
      )}
    </Button>
  );
}
