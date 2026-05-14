import { useState } from "react";

const KEY = "wf_profile";

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function write(value) {
  try {
    localStorage.setItem(KEY, JSON.stringify(value));
  } catch {}
}

/**
 * Provides the current user profile stored in localStorage.
 * Returns null until the user completes onboarding.
 */
export function useProfile() {
  const [profile, setProfileState] = useState(() => read());

  function setProfile(p) {
    write(p);
    setProfileState(p);
  }

  function clearProfile() {
    localStorage.removeItem(KEY);
    setProfileState(null);
  }

  return { profile, setProfile, clearProfile };
}
