import type { Metadata } from "next";
import { Suspense } from "react";
import { Analytics } from "@vercel/analytics/next";
import { Geist } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import FloatingButtons from "@/components/FloatingButtons";
import VisitLogger from "@/components/VisitLogger";
import { SITE_URL } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Greennest Hub — Farming Knowledge, Tools & Market Prices",
    template: "%s | Greennest Hub",
  },
  description:
    "Greennest Hub brings farming knowledge, free farmer tools, market prices and weather to rural and urban farmers in Nigeria and Africa.",
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
    <html lang="en" className={`${geistSans.variable}`}>
      <head>
        {/* Google Tag Manager (GTM-K5VQQXF3) — added 2026-11-23 at Joel's request */}
        <script async src="https://www.googletagmanager.com/gtm.js?id=GTM-K5VQQXF3"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());`,
          }}
        />
      </head>
      <body>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
        <FloatingButtons />
        {/* VisitLogger reads usePathname(), a runtime hook — it must sit
            inside Suspense so static pages can still prerender. */}
        <Suspense>
          <VisitLogger />
        </Suspense>
        <Analytics />
      </body>
    </html>
  );
}
