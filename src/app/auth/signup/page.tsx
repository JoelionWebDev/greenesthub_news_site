import type { Metadata } from "next";
import SignupForm from "./SignupForm";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Create an account",
  description:
    "Create a free Greennest Hub account to post in the Farmers Forum and list produce in the Marketplace.",
  alternates: { canonical: `${SITE_URL}/auth/signup` },
  robots: { index: false, follow: false },
};

export default function SignupPage() {
  return <SignupForm />;
}
