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
  const title = cv.general.displayName;
  const description = cv.general.byline || "";

  return {
    metadataBase: new URL("https://antoni.cv"),
    title: {
      default: title,
      template: `%s | ${title}`,
    },
    description,
    openGraph: {
      type: "website",
      locale: "en_US",
      url: "https://antoni.cv",
      siteName: title,
      title,
      description,
      images: [
        {
          url: "/content/media/profilePhoto.jpg",
          width: 400,
          height: 400,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: ["/content/media/profilePhoto.jpg"],
    },
    alternates: {
      canonical: "https://antoni.cv",
    },
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
        {process.env.NODE_ENV === "production" ? (
          <script
            defer
            src="https://analytics.quassum.com/script.js"
            data-website-id="5c8cdbba-eb31-4b71-a459-5405bf845521"
          ></script>
        ) : null}
      </body>
    </html>
  );
}
