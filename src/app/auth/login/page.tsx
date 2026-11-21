import { Suspense } from "react";
import type { Metadata } from "next";
import LoginForm from "./LoginForm";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in to Greennest Hub to post in the Farmers Forum and list produce in the Marketplace — with a password or a magic link.",
  alternates: { canonical: `${SITE_URL}/auth/login` },
  robots: { index: false, follow: false },
};

const CALLBACK_ERRORS: Record<string, string> = {
  link: "That sign-in link did not work — it may have expired or been used already. Ask for a new one below.",
  "not-configured":
    "Sign-in is not switched on yet — the site owner still needs to connect Supabase.",
};

// The error message comes from the URL (?error=…), so it reads at
// request time and streams in behind the boundary below.
async function LoginWithError({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const callbackError = params.error ? CALLBACK_ERRORS[params.error] : undefined;
  return <LoginForm callbackError={callbackError} />;
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <Suspense fallback={<LoginForm />}>
      <LoginWithError searchParams={searchParams} />
    </Suspense>
  );
}
