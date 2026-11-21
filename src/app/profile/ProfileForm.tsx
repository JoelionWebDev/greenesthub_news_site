'use client';

import { useActionState } from "react";
import { updateProfileAction, type AuthState } from "../auth/actions";
import type { Profile } from "@/lib/supabase/server";

const initialState: AuthState = { ok: false };

/** Edit display name, bio and location. */
export default function ProfileForm({ profile }: { profile: Profile }) {
  const [state, formAction] = useActionState(updateProfileAction, initialState);

  return (
    <form action={formAction} className="calc-form">
      <h3>Edit your profile</h3>
      {state.error && <p className="form-error">{state.error}</p>}
      {state.ok && state.message && (
        <p className="form-success" role="status">
          {state.message}
        </p>
      )}
      <label>
        Your name
        <input type="text" name="displayName" defaultValue={profile.display_name} required />
      </label>
      <label>
        About you (bio)
        <textarea
          name="bio"
          rows={3}
          defaultValue={profile.bio}
          placeholder="e.g. Cassava and maize farmer in Enugu, 5 years experience."
        />
      </label>
      <label>
        Where do you farm? (state or town)
        <input type="text" name="location" defaultValue={profile.location} />
      </label>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          Save my profile
        </button>
      </div>
    </form>
  );
}
