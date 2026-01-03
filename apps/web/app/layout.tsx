import { ThemeProvider } from "next-themes";
import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import { loadCV } from "@/lib/loadCV";
import { cn } from "@/lib/utils";
import Script from "next/script";

import "./globals.css";

const fontSans = Lexend({
  subsets: ["latin"],
  variable: "--font-sans",
});

// const merriweather = Merriweather({
//   subsets: ["latin"],
//   variable: "--font-serif",
//   display: "swap",
//   weight: ["400", "700"],
//   style: ["normal", "italic"],
// });

export async function generateMetadata(): Promise<Metadata> {
  const cv = await loadCV();
  return {
    title: cv.general.displayName,
    description: cv.general.byline || "",
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(fontSans.variable, "font-sans")}>
        <ThemeProvider attribute="class">{children}</ThemeProvider>
        <Script
          src="https://onedollarchatbot.com/script/g492j4c474wkzzcp5enj0"
          strategy="lazyOnload"
        />
        <script
          defer
          src="https://analytics.quassum.com/script.js"
          data-website-id="5c8cdbba-eb31-4b71-a459-5405bf845521"
        ></script>
      </body>
    </html>
  );
}
