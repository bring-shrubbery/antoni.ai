"use client";

import dynamic from "next/dynamic";

export const DarkModeToggleLazy = dynamic(() => import("./dark-mode-toggle"), {
  ssr: false,
});
