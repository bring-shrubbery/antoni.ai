"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

export const DarkModeToggle = () => {
  const { setTheme, theme } = useTheme();

  const Icon = theme === "dark" ? SunIcon : MoonIcon;

  return (
    <button
      className="group py-1 pl-2 cursor-pointer"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <Icon className="size-6 text-border group-hover:text-muted-foreground transition-colors" />
    </button>
  );
};
