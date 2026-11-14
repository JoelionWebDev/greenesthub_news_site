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

const SITE_URL = "https://greenesthub.com.ng";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Greenest Hub — Wild & Domestic Animal Stories for Kids",
    template: "%s | Greenest Hub",
  },
  description:
    "Greenest Hub is a fun animal blog for children and animal lovers — wild animals, domestic animals, and the wonderful ways animals and humans help each other.",
  openGraph: {
    type: "website",
    siteName: "Greenest Hub",
    url: SITE_URL,
    title: "Greenest Hub — Where Every Animal Has a Story",
    description:
      "Wild animals, domestic animals, and animals & humans — fun, true animal stories for curious kids.",
    images: [{ url: "/images/hero-lion.jpg", width: 1920, height: 1280, alt: "A lion on a green savanna at sunrise" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Greenest Hub — Where Every Animal Has a Story",
    description:
      "Wild animals, domestic animals, and animals & humans — fun, true animal stories for curious kids.",
    images: ["/images/hero-lion.jpg"],
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
