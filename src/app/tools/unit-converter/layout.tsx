import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

// The converter page is a client component, so its metadata lives here.
export const metadata: Metadata = {
  title: "Unit Converter",
  description:
    "Convert farm units — hectares, acres, plots, bags and kilos — for Nigerian farmers, free and instant.",
  alternates: { canonical: `${SITE_URL}/tools/unit-converter` },
};

export default function UnitConverterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
