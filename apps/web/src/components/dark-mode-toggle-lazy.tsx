import { lazy, Suspense } from "react";

const DarkModeToggle = lazy(() => import("./dark-mode-toggle"));

export const DarkModeToggleLazy = () => (
  <Suspense fallback={<div className="size-6" />}>
    <DarkModeToggle />
  </Suspense>
);
