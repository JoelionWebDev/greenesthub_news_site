// Paystack helpers. All calls are server-side only — the secret key never
// reaches the browser. Card numbers are never collected or stored anywhere
// in this app; Paystack handles payment details on its own checkout page.
//
// NOTE: payments go to the platform's Paystack account and the owner settles
// farmers manually. (The Joetech Shops storefront splits to a seller
// subaccount when one is set; farmer subaccounts are a later step here.)

// LOCAL PAYMENTS FOR NOW (Nov 2026): online card payment is OFF until the
// owner's CAC registration is ready. While PAYSTACK_SECRET_KEY is unset,
// the marketplace sells by WhatsApp only — buyers pay the farmer directly
// (bank transfer or cash). To switch Paystack back on, just add the
// Paystack keys to the Vercel env vars; no code change is needed.
export function isPaystackConfigured(): boolean {
  return Boolean(process.env.PAYSTACK_SECRET_KEY);
}

const PAYSTACK_BASE = "https://api.paystack.co";

export type InitResult = {
  authorization_url: string;
  access_code: string;
  reference: string;
};

export async function initializeTransaction(args: {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
}): Promise<InitResult> {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) throw new Error("PAYSTACK_SECRET_KEY is not set");

  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: args.email,
      amount: args.amountKobo,
      reference: args.reference,
      callback_url: args.callbackUrl,
    }),
  });
  const data = (await res.json()) as {
    status: boolean;
    message: string;
    data?: InitResult;
  };
  if (!res.ok || !data.status || !data.data) {
    throw new Error(`Paystack initialise failed: ${data.message}`);
  }
  return data.data;
}

export type VerifyResult = {
  status: string;
  reference: string;
  amount: number;
  customer: { email: string };
};

export async function verifyTransaction(reference: string): Promise<VerifyResult> {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) throw new Error("PAYSTACK_SECRET_KEY is not set");
  const res = await fetch(
    `${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${secret}` } },
  );
  const data = (await res.json()) as {
    status: boolean;
    message: string;
    data?: VerifyResult;
  };
  if (!res.ok || !data.status || !data.data) {
    throw new Error(`Paystack verify failed: ${data.message}`);
  }
  return data.data;
}
