import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useProfile } from "../hooks/useProfile.js";

const KEY = "wf_profile";

describe("useProfile — initial state", () => {
  it("returns null when localStorage has no profile", () => {
    const { result } = renderHook(() => useProfile());
    expect(result.current.profile).toBeNull();
  });

  it("reads an existing profile from localStorage on mount", () => {
    const stored = { id: "abc", name: "Jai", avatarIdx: 2 };
    localStorage.setItem(KEY, JSON.stringify(stored));

    const { result } = renderHook(() => useProfile());
    expect(result.current.profile).toEqual(stored);
  });

  it("returns null if the localStorage value is malformed JSON", () => {
    localStorage.setItem(KEY, "not-json{{{");
    const { result } = renderHook(() => useProfile());
    expect(result.current.profile).toBeNull();
  });
});

describe("useProfile — setProfile", () => {
  it("updates React state with the new profile", () => {
    const { result } = renderHook(() => useProfile());
    const profile = { id: "x1", name: "Rover", avatarIdx: 0 };

    act(() => result.current.setProfile(profile));

    expect(result.current.profile).toEqual(profile);
  });

  it("persists the profile to localStorage", () => {
    const { result } = renderHook(() => useProfile());
    const profile = { id: "x2", name: "Scout", avatarIdx: 1 };

    act(() => result.current.setProfile(profile));

    expect(JSON.parse(localStorage.getItem(KEY))).toEqual(profile);
  });

  it("overwrites a previously stored profile", () => {
    localStorage.setItem(KEY, JSON.stringify({ id: "old", name: "Old", avatarIdx: 0 }));
    const { result } = renderHook(() => useProfile());
    const updated = { id: "new", name: "New", avatarIdx: 3 };

    act(() => result.current.setProfile(updated));

    expect(result.current.profile).toEqual(updated);
    expect(JSON.parse(localStorage.getItem(KEY))).toEqual(updated);
  });
});

describe("useProfile — clearProfile", () => {
  it("sets profile state to null", () => {
    localStorage.setItem(KEY, JSON.stringify({ id: "z1", name: "Z", avatarIdx: 0 }));
    const { result } = renderHook(() => useProfile());

    act(() => result.current.clearProfile());

    expect(result.current.profile).toBeNull();
  });

  it("removes the key from localStorage", () => {
    localStorage.setItem(KEY, JSON.stringify({ id: "z1", name: "Z", avatarIdx: 0 }));
    const { result } = renderHook(() => useProfile());

    act(() => result.current.clearProfile());

    expect(localStorage.getItem(KEY)).toBeNull();
  });

  it("is a no-op when there is no stored profile", () => {
    const { result } = renderHook(() => useProfile());

    expect(() => act(() => result.current.clearProfile())).not.toThrow();
    expect(result.current.profile).toBeNull();
  });
});
