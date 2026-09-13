import type { Metadata } from "next";
import { Geist, Geist_Mono, Montserrat, Playfair_Display } from "next/font/google";

import { APP_DESCRIPTION, APP_NAME } from "@/constants";
import { AppProviders } from "@/providers";

import "./globals.css";

const fontSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const fontMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const fontMontserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const fontSerif = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  icons: {
    icon: [{ url: "/images/tablogo.png", type: "image/png" }],
    shortcut: [{ url: "/images/tablogo.png", type: "image/png" }],
    apple: [{ url: "/images/tablogo.png", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const publishableKey =
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
    process.env.CLERK_PUBLISHABLE_KEY;

  return (
    <html
      lang="en"
      className={`${fontSans.variable} ${fontMono.variable} ${fontMontserrat.variable} ${fontSerif.variable} h-full antialiased`}
    >
      <body
        className="flex min-h-full flex-col font-sans"
        suppressHydrationWarning
      >
        <AppProviders publishableKey={publishableKey}>{children}</AppProviders>
      </body>
    </html>
  );
}
