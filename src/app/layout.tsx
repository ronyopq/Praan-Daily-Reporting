import type { Metadata } from "next";
import { Manrope, Noto_Serif_Bengali } from "next/font/google";

import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";

import { Providers } from "@/components/providers";
import { APP_NAME } from "@/lib/constants";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const notoSerifBengali = Noto_Serif_Bengali({
  variable: "--font-bengali",
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: APP_NAME,
  description:
    "Production-ready planning, daily reporting, follow-up, calendar, print, and approval workflow platform for PRAAN teams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`app-body ${manrope.variable} ${notoSerifBengali.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
