import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

// The calculator page is a client component, so its metadata lives here.
export const metadata: Metadata = {
  title: "Feed Calculator",
  description:
    "How much feed your birds and goats need each day — layers, broilers and goats, in grams and bags.",
  alternates: { canonical: `${SITE_URL}/tools/feed-calculator` },
};

export default function FeedCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
