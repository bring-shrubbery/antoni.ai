import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { loadCV } from "@/lib/loadCV";
import { ThemeProvider } from "next-themes";
import { cn } from "@/lib/utils";
import PlausibleProvider from "next-plausible";
import Script from "next/script";

const inter = Inter({
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
      <body className={cn(inter.variable, "font-sans")}>
        <PlausibleProvider domain="antoni.cv">
          <ThemeProvider attribute="class">{children}</ThemeProvider>
        </PlausibleProvider>
        <Script
          src="https://onedollarchatbot.com/script/g492j4c474wkzzcp5enj0"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
