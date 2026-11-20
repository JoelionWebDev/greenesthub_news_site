"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { NIGERIAN_STATES } from "@/lib/marketplace/states";
import { formatNaira } from "@/lib/marketplace/format";
import { isConfigured, supabaseBrowser } from "@/lib/marketplace/supabase";
import { DEMO_LISTINGS } from "@/lib/marketplace/demo-data";

/**
 * Buyer checkout form. Collects buyer details only — the price and total
 * are NEVER sent from here. /api/marketplace/checkout looks the listing up
 * in the database and computes the total server-side.
 */
export default function CheckoutForm({
  listingId,
  paystackEnabled,
}: {
  listingId: string;
  paystackEnabled: boolean;
}) {
  const [listingTitle, setListingTitle] = useState("");
  const [unit, setUnit] = useState("");
  const [priceKobo, setPriceKobo] = useState<number | null>(null);
  const [available, setAvailable] = useState(0);
  const [qty, setQty] = useState(1);
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerState, setBuyerState] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [loadingListing, setLoadingListing] = useState(true);

  useEffect(() => {
    (async () => {
      if (!listingId) {
        setLoadingListing(false);
        return;
      }
      // In demo mode there is no database to read prices from.
      if (!isConfigured) {
        const found = DEMO_LISTINGS.find((l) => l.id === listingId);
        if (found) {
          setListingTitle(found.title);
          setUnit(found.unit);
          setPriceKobo(found.price_kobo);
          setAvailable(found.quantity_available);
        }
        setLoadingListing(false);
        return;
      }
      const sb = supabaseBrowser();
      const { data } = await sb!
        .from("produce_listings")
        .select("id,title,unit,price_kobo,quantity_available")
        .eq("id", listingId)
        .maybeSingle();
      if (data) {
        setListingTitle(data.title as string);
        setUnit(data.unit as string);
        setPriceKobo(data.price_kobo as number);
        setAvailable(data.quantity_available as number);
      }
      setLoadingListing(false);
    })();
  }, [listingId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/marketplace/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          qty,
          buyerName,
          buyerPhone,
          buyerEmail,
          buyerState,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Checkout failed");
      window.location.href = data.authorization_url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setBusy(false);
    }
  }

  // Card payment is off until the owner's CAC registration is ready —
  // buyers pay the farmer directly on WhatsApp (bank transfer or cash).
  if (!paystackEnabled) {
    return (
      <div className="wrap">
        <section className="section">
          <div className="form-success">
            <h2>Pay the farmer directly on WhatsApp</h2>
            <p>
              Online card payment is not available yet. Order this produce on
              WhatsApp from the listing page and arrange payment directly with
              the farmer — bank transfer or cash.
            </p>
            <p>
              <Link
                href={listingId ? `/marketplace/${listingId}` : "/marketplace"}
                className="category-card-link"
              >
                ← Back to the listing
              </Link>
            </p>
          </div>
        </section>
      </div>
    );
  }

  if (!isConfigured) {
    return (
      <div className="wrap">
        <section className="section">
          <div className="form-success">
            <h2>Checkout is not available in demo mode</h2>
            <p>
              Connect Supabase and add your Paystack keys (see
              supabase/README.md) to enable real checkout. In the meantime you
              can order this produce on WhatsApp from the listing page.
            </p>
            <p>
              <Link href="/marketplace" className="category-card-link">
                ← Back to the marketplace
              </Link>
            </p>
          </div>
        </section>
      </div>
    );
  }

  if (loadingListing) {
    return (
      <div className="wrap">
        <section className="section">
          <p className="empty-state">Loading produce…</p>
        </section>
      </div>
    );
  }

  if (!listingId || priceKobo === null) {
    return (
      <div className="wrap">
        <section className="section">
          <div className="form-success">
            <h2>Produce not found</h2>
            <p>
              <Link href="/marketplace" className="category-card-link">
                ← Back to the marketplace
              </Link>
            </p>
          </div>
        </section>
      </div>
    );
  }

  const maxQty = Math.max(1, Math.min(99, available));

  return (
    <div className="wrap">
      <section className="section" aria-labelledby="checkout-heading">
        <div className="section-head">
          <h1 id="checkout-heading">Checkout</h1>
          <p>Pay securely with Paystack — your money goes to the farmer&apos;s market.</p>
        </div>

        <div className="calc-result">
          <h2>{listingTitle}</h2>
          <p className="result-line">
            <span>
              {formatNaira(priceKobo)} per {unit} × {qty}
            </span>
            <strong>{formatNaira(priceKobo * qty)}</strong>
          </p>
          <p className="calc-note">
            Price is confirmed by the server at payment time — what you see
            here is only a preview.
          </p>
        </div>

        <form onSubmit={submit} className="calc-form">
          <label>
            Your name
            <input required value={buyerName} onChange={(e) => setBuyerName(e.target.value)} />
          </label>
          <label>
            Phone (WhatsApp)
            <input
              required
              type="tel"
              value={buyerPhone}
              onChange={(e) => setBuyerPhone(e.target.value)}
              placeholder="0803 123 4567"
            />
          </label>
          <label>
            Email (for your Paystack receipt)
            <input
              required
              type="email"
              value={buyerEmail}
              onChange={(e) => setBuyerEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </label>
          <label>
            Your state
            <select required value={buyerState} onChange={(e) => setBuyerState(e.target.value)}>
              <option value="">Select your state</option>
              {NIGERIAN_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label>
            Quantity ({available} available)
            <input
              type="number"
              min={1}
              max={maxQty}
              value={qty}
              onChange={(e) => setQty(Math.max(1, Math.min(maxQty, Number(e.target.value) || 1)))}
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? "Redirecting to Paystack…" : `Pay ${formatNaira(priceKobo * qty)} with Paystack`}
            </button>
          </div>
          <p className="calc-note">
            You pay securely on Paystack. We never see or store your card number.
          </p>
        </form>
      </section>
    </div>
  );
}
