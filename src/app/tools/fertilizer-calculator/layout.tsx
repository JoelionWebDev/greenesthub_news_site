import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

// The calculator page is a client component, so its metadata lives here.
export const metadata: Metadata = {
  title: "Fertilizer Calculator",
  description:
    "How many bags of fertilizer your land needs — calculate NPK and urea for maize, rice, cassava and more, for Nigerian farms.",
  alternates: { canonical: `${SITE_URL}/tools/fertilizer-calculator` },
};

export default function FertilizerCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
