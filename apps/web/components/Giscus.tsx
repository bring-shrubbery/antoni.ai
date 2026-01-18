"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import GiscusComponent from "@giscus/react";

export function Giscus() {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const currentTheme = theme === "system" ? systemTheme : theme;
  const giscusTheme = currentTheme === "dark" ? "dark" : "light";

  return (
    <GiscusComponent
      repo="bring-shrubbery/antoni.ai"
      repoId="R_kgDOOApXUw"
      category="Announcements"
      categoryId="DIC_kwDOOApXU84C0ygE"
      mapping="pathname"
      strict="0"
      reactionsEnabled="1"
      emitMetadata="0"
      inputPosition="bottom"
      theme={giscusTheme}
      lang="en"
      loading="lazy"
    />
  );
}
