import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useGameState } from "../hooks/useGameState.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

function ls(key) {
  return JSON.parse(localStorage.getItem(key));
}

function setDate(dateString) {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(dateString));
}

// ── Default values ────────────────────────────────────────────────────────────

describe("useGameState — defaults", () => {
  it("returns zero xp and streak when localStorage is empty", () => {
    const { result } = renderHook(() => useGameState());
    expect(result.current.xp).toBe(0);
    expect(result.current.streak).toBe(0);
  });

  it("returns empty done array and null lastDate", () => {
    const { result } = renderHook(() => useGameState());
    expect(result.current.done).toEqual([]);
    expect(result.current.lastDate).toBeNull();
  });

  it("returns zeroed skill counters", () => {
    const { result } = renderHook(() => useGameState());
    expect(result.current.skills).toEqual({
      observation: 0,
      cardinal: 0,
      mental_map: 0,
      landmark: 0,
      confidence: 0,
    });
  });

  it("returns zero totalDrills", () => {
    const { result } = renderHook(() => useGameState());
    expect(result.current.totalDrills).toBe(0);
  });
});

// ── Hydration from localStorage ───────────────────────────────────────────────

describe("useGameState — hydrates from localStorage", () => {
  it("reads xp from wf_xp", () => {
    localStorage.setItem("wf_xp", "350");
    const { result } = renderHook(() => useGameState());
    expect(result.current.xp).toBe(350);
  });

  it("reads streak from wf_streak", () => {
    localStorage.setItem("wf_streak", "7");
    const { result } = renderHook(() => useGameState());
    expect(result.current.streak).toBe(7);
  });

  it("reads done array from wf_done", () => {
    localStorage.setItem("wf_done", JSON.stringify([1, 3, 5]));
    const { result } = renderHook(() => useGameState());
    expect(result.current.done).toEqual([1, 3, 5]);
  });

  it("reads skills from wf_skills", () => {
    const skills = { observation: 2, cardinal: 1, mental_map: 0, landmark: 3, confidence: 1 };
    localStorage.setItem("wf_skills", JSON.stringify(skills));
    const { result } = renderHook(() => useGameState());
    expect(result.current.skills).toEqual(skills);
  });

  it("falls back to defaults when stored JSON is malformed", () => {
    localStorage.setItem("wf_xp", "bad-json{");
    const { result } = renderHook(() => useGameState());
    expect(result.current.xp).toBe(0);
  });
});

// ── setXp ─────────────────────────────────────────────────────────────────────

describe("useGameState — setXp", () => {
  it("updates React state", () => {
    const { result } = renderHook(() => useGameState());
    act(() => result.current.setXp(100));
    expect(result.current.xp).toBe(100);
  });

  it("persists to localStorage", () => {
    const { result } = renderHook(() => useGameState());
    act(() => result.current.setXp(200));
    expect(ls("wf_xp")).toBe(200);
  });

  it("accepts a function updater", () => {
    localStorage.setItem("wf_xp", "50");
    const { result } = renderHook(() => useGameState());
    act(() => result.current.setXp(prev => prev + 25));
    expect(result.current.xp).toBe(75);
  });
});

// ── setStreak ─────────────────────────────────────────────────────────────────

describe("useGameState — setStreak", () => {
  it("updates state and localStorage", () => {
    const { result } = renderHook(() => useGameState());
    act(() => result.current.setStreak(5));
    expect(result.current.streak).toBe(5);
    expect(ls("wf_streak")).toBe(5);
  });
});

// ── setDone ───────────────────────────────────────────────────────────────────

describe("useGameState — setDone", () => {
  it("accepts a direct array value", () => {
    const { result } = renderHook(() => useGameState());
    act(() => result.current.setDone([2, 4]));
    expect(result.current.done).toEqual([2, 4]);
    expect(ls("wf_done")).toEqual([2, 4]);
  });

  it("accepts a function updater and appends an id", () => {
    localStorage.setItem("wf_done", JSON.stringify([1]));
    const { result } = renderHook(() => useGameState());
    act(() => result.current.setDone(prev => [...prev, 2]));
    expect(result.current.done).toEqual([1, 2]);
  });
});

// ── setSkills ─────────────────────────────────────────────────────────────────

describe("useGameState — setSkills", () => {
  it("merges skill updates and persists them", () => {
    const { result } = renderHook(() => useGameState());
    const updated = { observation: 1, cardinal: 0, mental_map: 2, landmark: 0, confidence: 1 };
    act(() => result.current.setSkills(updated));
    expect(result.current.skills).toEqual(updated);
    expect(ls("wf_skills")).toEqual(updated);
  });
});

// ── bumpStreak ────────────────────────────────────────────────────────────────

describe("useGameState — bumpStreak", () => {
  it("increments streak and records today when lastDate is null", () => {
    setDate("2024-06-15");
    const { result } = renderHook(() => useGameState());

    act(() => result.current.bumpStreak());

    expect(result.current.streak).toBe(1);
    expect(result.current.lastDate).toBe(new Date("2024-06-15").toDateString());
  });

  it("does not increment streak when called again on the same day", () => {
    setDate("2024-06-15");
    const today = new Date("2024-06-15").toDateString();
    localStorage.setItem("wf_streak", "3");
    localStorage.setItem("wf_lastdate", JSON.stringify(today));

    const { result } = renderHook(() => useGameState());
    act(() => result.current.bumpStreak());

    expect(result.current.streak).toBe(3);
  });

  it("increments streak when lastDate was a previous day", () => {
    setDate("2024-06-16");
    const yesterday = new Date("2024-06-15").toDateString();
    localStorage.setItem("wf_streak", "2");
    localStorage.setItem("wf_lastdate", JSON.stringify(yesterday));

    const { result } = renderHook(() => useGameState());
    act(() => result.current.bumpStreak());

    expect(result.current.streak).toBe(3);
  });
});

// ── checkStreak ───────────────────────────────────────────────────────────────

describe("useGameState — checkStreak", () => {
  it("resets streak to 0 when last activity was 2+ days ago", () => {
    setDate("2024-06-18");
    const twoDaysAgo = new Date("2024-06-16").toDateString();
    localStorage.setItem("wf_streak", "5");
    localStorage.setItem("wf_lastdate", JSON.stringify(twoDaysAgo));

    const { result } = renderHook(() => useGameState());
    act(() => result.current.checkStreak());

    expect(result.current.streak).toBe(0);
  });

  it("keeps streak when last activity was yesterday", () => {
    setDate("2024-06-18");
    const yesterday = new Date("2024-06-17").toDateString();
    localStorage.setItem("wf_streak", "4");
    localStorage.setItem("wf_lastdate", JSON.stringify(yesterday));

    const { result } = renderHook(() => useGameState());
    act(() => result.current.checkStreak());

    expect(result.current.streak).toBe(4);
  });

  it("does nothing when lastDate is null", () => {
    const { result } = renderHook(() => useGameState());
    act(() => result.current.checkStreak());
    expect(result.current.streak).toBe(0);
  });
});

// ── resetGameState ────────────────────────────────────────────────────────────

describe("useGameState — resetGameState", () => {
  it("zeroes all counters in React state", () => {
    localStorage.setItem("wf_xp", "500");
    localStorage.setItem("wf_streak", "10");
    localStorage.setItem("wf_done", JSON.stringify([1, 2, 3]));
    localStorage.setItem("wf_total_drills", "20");

    const { result } = renderHook(() => useGameState());
    act(() => result.current.resetGameState());

    expect(result.current.xp).toBe(0);
    expect(result.current.streak).toBe(0);
    expect(result.current.done).toEqual([]);
    expect(result.current.totalDrills).toBe(0);
  });

  it("resets skills to all-zero in localStorage", () => {
    const skills = { observation: 5, cardinal: 3, mental_map: 2, landmark: 4, confidence: 1 };
    localStorage.setItem("wf_skills", JSON.stringify(skills));

    const { result } = renderHook(() => useGameState());
    act(() => result.current.resetGameState());

    expect(ls("wf_skills")).toEqual({
      observation: 0, cardinal: 0, mental_map: 0, landmark: 0, confidence: 0,
    });
  });

  it("clears xp and streak from localStorage", () => {
    localStorage.setItem("wf_xp", "300");
    localStorage.setItem("wf_streak", "8");

    const { result } = renderHook(() => useGameState());
    act(() => result.current.resetGameState());

    expect(ls("wf_xp")).toBe(0);
    expect(ls("wf_streak")).toBe(0);
  });
});
