import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

// The ask form is a client component, so its metadata lives here.
export const metadata: Metadata = {
  title: "Ask a Question",
  description:
    "Ask a farming question or share a strange experience from your farm — farmers and the Greennest Hub team answer. Your question helps other farmers too.",
  alternates: { canonical: `${SITE_URL}/community/ask` },
};

export default function AskLayout({ children }: { children: React.ReactNode }) {
  return children;
}
