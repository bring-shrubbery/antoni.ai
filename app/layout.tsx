import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { loadCV } from "@/lib/loadCV";
import { ThemeProvider } from "next-themes";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

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
        <ThemeProvider attribute="class">{children}</ThemeProvider>
      </body>
    </html>
  );
}
