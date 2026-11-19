import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

// The calculator page is a client component, so its metadata lives here.
export const metadata: Metadata = {
  title: "Profit Calculator",
  description:
    "Will your harvest make money? Work out your farming profit before you plant — costs, yield and selling price.",
  alternates: { canonical: `${SITE_URL}/tools/profit-calculator` },
};

export default function ProfitCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
