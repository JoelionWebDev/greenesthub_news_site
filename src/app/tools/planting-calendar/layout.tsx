import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

// The calculator page is a client component, so its metadata lives here.
export const metadata: Metadata = {
  title: "Planting Calendar",
  description:
    "When to plant each crop in Nigeria, North and South — maize, cassava, yam, rice and more, month by month.",
  alternates: { canonical: `${SITE_URL}/tools/planting-calendar` },
};

export default function PlantingCalendarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
