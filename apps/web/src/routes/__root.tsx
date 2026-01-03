/// <reference types="vite/client" />
import {
  HeadContent,
  Scripts,
  createRootRoute,
  Outlet,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { useLocalStorage } from "usehooks-ts";
import { useEffect } from "react";

import globalCSS from "../globals.css?url";

function RootComponent() {
  const [theme, setTheme] = useLocalStorage<"light" | "dark">("theme", "dark");

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  return (
    <html lang="en" className={theme}>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Antoni </title>

        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Lexend:wght@100..900&display=swap"
          rel="stylesheet"
        />

        {/* Umami Analytics */}
        <script
          defer
          src="https://analytics.quassum.com/script.js"
          data-website-id="5c8cdbba-eb31-4b71-a459-5405bf845521"
        ></script>

        <HeadContent />
      </head>
      <body className="font-sans antialiased">
        <Outlet />

        {import.meta.env.DEV && (
          <TanStackRouterDevtools position="bottom-left" />
        )}
        <Scripts />
      </body>
    </html>
  );
}

export const Route = createRootRoute({
  head: () => ({
    links: [{ rel: "stylesheet", href: globalCSS }],
  }),
  component: RootComponent,
});
