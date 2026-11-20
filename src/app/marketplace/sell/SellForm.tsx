"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { isConfigured, supabaseBrowser } from "@/lib/marketplace/supabase";
import { NIGERIAN_STATES } from "@/lib/marketplace/states";
import { PRODUCE_CATEGORIES } from "@/lib/marketplace/types";

/**
 * Farmer onboarding: step 1 create an account (Supabase Auth email signup),
 * step 2 list produce. The listing insert goes through the browser client —
 * RLS enforces owner_id = auth.uid(), so a farmer can only ever create
 * listings under their own account. Photos go through
 * /api/marketplace/upload (login + type/size checked, stored under the
 * farmer's own user-id folder) — or paste an image URL as a fallback.
 */
export default function SellForm() {
  const [userId, setUserId] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  // Step 1 — account
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);

  // Step 2 — listing
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("grains");
  const [priceNaira, setPriceNaira] = useState("");
  const [unit, setUnit] = useState("50kg bag");
  const [quantity, setQuantity] = useState("10");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [farmerName, setFarmerName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [listedId, setListedId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const sb = supabaseBrowser();
      if (!sb) {
        setChecking(false);
        return;
      }
      const { data } = await sb.auth.getSession();
      setUserId(data.session?.user?.id ?? null);
      setChecking(false);
    })();
  }, []);

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");
    setAuthBusy(true);
    const sb = supabaseBrowser();
    if (!sb) {
      setAuthError("Supabase is not connected yet. See supabase/README.md to connect it.");
      setAuthBusy(false);
      return;
    }
    const { data, error: authErr } = await sb.auth.signUp({ email, password });
    if (authErr) {
      setAuthError(authErr.message);
      setAuthBusy(false);
      return;
    }
    // If email confirmation is on, the farmer must confirm first.
    if (data.user && !data.session) {
      setConfirmSent(true);
      setAuthBusy(false);
      return;
    }
    setUserId(data.user?.id ?? null);
    setAuthBusy(false);
  }

  async function uploadImage(token: string): Promise<string | null> {
    if (!file) return imageUrl || null;
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/marketplace/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Upload failed");
    return data.url as string;
  }

  async function submitListing(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const sb = supabaseBrowser();
      if (!sb || !userId) throw new Error("You are not logged in.");
      const { data: sessionData } = await sb.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("Your login session expired — please log in again.");

      const finalImage = await uploadImage(token);
      const priceKobo = Math.round(Number(priceNaira) * 100);
      if (!priceKobo || priceKobo <= 0) throw new Error("Enter a valid price in naira.");
      const qty = Math.max(0, Math.floor(Number(quantity) || 0));

      const { data, error: insertError } = await sb
        .from("produce_listings")
        .insert({
          owner_id: userId,
          title: title.trim(),
          description: description.trim() || null,
          category,
          price_kobo: priceKobo,
          unit: unit.trim(),
          quantity_available: qty,
          state,
          city: city.trim(),
          farmer_name: farmerName.trim(),
          whatsapp_number: whatsapp.trim() || null,
          image_url: finalImage,
        })
        .select("id")
        .single();
      if (insertError) throw new Error(insertError.message);
      setListedId(data.id as string);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not list your produce");
    } finally {
      setSaving(false);
    }
  }

  if (checking) {
    return <p className="empty-state">Checking your account…</p>;
  }

  if (listedId) {
    return (
      <div className="form-success">
        <p>
          🎉 Your produce is live on the marketplace! Buyers can now see it and
          order from you.
        </p>
        <p>
          <Link href={`/marketplace/${listedId}`}>View your listing →</Link>
          {" · "}
          <Link href="/marketplace">Back to the marketplace</Link>
        </p>
      </div>
    );
  }

  // ---- Step 1: create an account ----
  if (!userId) {
    return (
      <div className="admin-form">
        <h2>Step 1 — Create your farmer account</h2>
        <p className="lede">
          Your listings only go live after you create an account. Already have
          one?{" "}
          <Link href="/marketplace/auth/login" className="category-card-link">
            Log in
          </Link>
        </p>
        {!isConfigured && (
          <p className="form-error">
            Demo mode: signup needs Supabase. Follow supabase/README.md to
            connect it — then farmers can create accounts here.
          </p>
        )}
        {confirmSent ? (
          <p className="form-success">
            ✅ We sent a confirmation link to <strong>{email}</strong>. Click
            it, then come back here and log in — your listing form is the next
            step.
          </p>
        ) : (
          <form onSubmit={signUp} className="admin-form" style={{ border: "none", padding: 0, marginTop: 0 }}>
            <label>
              Email
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </label>
            <label>
              Password (at least 6 characters)
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            {authError && <p className="form-error">{authError}</p>}
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={authBusy}>
                {authBusy ? "Creating your account…" : "Create account"}
              </button>
            </div>
          </form>
        )}
      </div>
    );
  }

  // ---- Step 2: list produce ----
  return (
    <form onSubmit={submitListing} className="admin-form">
      <h2>Step 2 — List your produce</h2>
      <label>
        What are you selling?
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Royal Stallion Rice — 50kg bag"
        />
      </label>
      <label>
        Category
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {PRODUCE_CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.emoji} {c.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Price in naira (for ONE unit)
        <input
          required
          type="number"
          min={1}
          step="any"
          value={priceNaira}
          onChange={(e) => setPriceNaira(e.target.value)}
          placeholder="e.g. 48000"
        />
      </label>
      <label>
        Unit — what does the price cover?
        <select value={unit} onChange={(e) => setUnit(e.target.value)}>
          <option value="50kg bag">50kg bag</option>
          <option value="25kg bag">25kg bag</option>
          <option value="kg">per kg</option>
          <option value="tuber">per tuber</option>
          <option value="big basket">big basket</option>
          <option value="small basket">small basket</option>
          <option value="crate">crate</option>
          <option value="piece">per piece</option>
          <option value="bird">per bird</option>
          <option value="litre">per litre</option>
        </select>
      </label>
      <label>
        How many units do you have?
        <input
          type="number"
          min={0}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
      </label>
      <label>
        Your state
        <select required value={state} onChange={(e) => setState(e.target.value)}>
          <option value="">Select your state</option>
          {NIGERIAN_STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      <label>
        Town / city
        <input
          required
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="e.g. Makurdi"
        />
      </label>
      <label>
        Your name (shown to buyers)
        <input
          required
          value={farmerName}
          onChange={(e) => setFarmerName(e.target.value)}
          placeholder="e.g. Mama Nkechi"
        />
      </label>
      <label>
        WhatsApp number (buyers order through it)
        <input
          type="tel"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          placeholder="0803 123 4567"
        />
      </label>
      <label>
        Description (optional)
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Tell buyers about your produce — variety, how fresh it is, delivery or pickup."
        />
      </label>
      <fieldset className="cover-fieldset">
        <legend>Photo of your produce</legend>
        <label>
          Upload a photo (JPEG/PNG/WebP, max 5 MB)
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>
        <p style={{ color: "var(--ink-soft)", fontSize: "0.95rem" }}>
          Or paste an image URL instead — it will be used if no file is chosen.
        </p>
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://…"
        />
      </fieldset>
      {error && <p className="form-error">{error}</p>}
      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Listing your produce…" : "List my produce — go live instantly"}
        </button>
      </div>
      <p style={{ color: "var(--ink-soft)", fontSize: "0.95rem", lineHeight: 1.6 }}>
        Your listing appears on the marketplace the moment you submit it. You
        can delete it any time — log in and ask the Greennest team, or manage
        it from your Supabase dashboard.
      </p>
    </form>
  );
}
