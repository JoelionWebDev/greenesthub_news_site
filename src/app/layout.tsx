import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://greennesthub.com.ng";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Greennest Hub — Farming Knowledge, Tools & Market Prices for Nigerian & African Farmers",
    template: "%s | Greennest Hub",
  },
  description:
    "Greennest Hub is Nigeria and Africa's agricultural platform — learn modern farming, use free farmer tools, check market prices and weather, ask farmers' questions, and read stories about crops and animals. Founded by Igono Joel.",
  openGraph: {
    type: "website",
    siteName: "Greennest Hub",
    url: SITE_URL,
    title: "Greennest Hub — Farming Knowledge, Tools & Market Prices for Nigerian & African Farmers",
    description:
      "Learn modern farming, use free farmer tools, check market prices and weather, and ask questions — for village and city farmers and agriculture students.",
    images: [{ url: "/images/hero-farm.jpg", width: 1920, height: 1280, alt: "A Nigerian farmer standing in a maize field at sunrise" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Greennest Hub — Farming Knowledge, Tools & Market Prices for Nigerian & African Farmers",
    description:
      "Learn modern farming, use free farmer tools, check market prices and weather, and ask questions — for village and city farmers and agriculture students.",
    images: ["/images/hero-farm.jpg"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
