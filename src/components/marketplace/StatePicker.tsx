"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { NIGERIAN_STATES } from "@/lib/marketplace/states";

const STORAGE_KEY = "greennest-market-state";

/**
 * "Produce near you" picker. Choosing a state navigates to
 * ?state=<state> (the server then lists that state's produce first) and
 * remembers the choice in localStorage so the picker is pre-filled next
 * time. Choosing "All states" clears it.
 */
export default function StatePicker({ current }: { current: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(current);

  // Pre-fill from the last visit when the URL has no state yet.
  useEffect(() => {
    if (!current) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && NIGERIAN_STATES.includes(saved)) setValue(saved);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onChange(next: string) {
    setValue(next);
    const params = new URLSearchParams(searchParams.toString());
    if (next) {
      params.set("state", next);
      localStorage.setItem(STORAGE_KEY, next);
    } else {
      params.delete("state");
      localStorage.removeItem(STORAGE_KEY);
    }
    params.delete("page");
    const query = params.toString();
    router.push(query ? `/marketplace?${query}` : "/marketplace");
  }

  return (
    <label className="state-picker">
      <span>📍 Produce near you — your state</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} aria-label="Your state">
        <option value="">All states</option>
        {NIGERIAN_STATES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </label>
  );
}
