import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";

// ── Module mocks ──────────────────────────────────────────────────────────────

vi.mock("dexie-react-hooks", () => ({
  // Return the default value synchronously so isLoading is always false
  useLiveQuery: vi.fn((_fn, _deps, defaultVal) => defaultVal),
}));

vi.mock("../db.js", () => ({
  db: {
    journal:  { where: vi.fn(() => ({ equals: vi.fn(() => ({ reverse: vi.fn(() => ({ sortBy: vi.fn() })) })) })) },
    activity: { where: vi.fn(() => ({ equals: vi.fn(() => ({ reverse: vi.fn(() => ({ sortBy: vi.fn() })) })) })) },
  },
  addJournalEntry:   vi.fn().mockResolvedValue(1),
  deleteJournalEntry: vi.fn().mockResolvedValue(undefined),
  logActivity:        vi.fn().mockResolvedValue(2),
  clearProfileData:   vi.fn().mockResolvedValue(undefined),
}));

import { useDB } from "../hooks/useDB.js";
import { addJournalEntry, deleteJournalEntry, logActivity, clearProfileData } from "../db.js";

// ── Fixtures ──────────────────────────────────────────────────────────────────

const CHALLENGE = {
  title:    "Wander Home",
  category: "mental_map",
  icon:     "map",
  xp:       50,
};

const DRILL = {
  title:    "Spin & Point",
  category: "cardinal",
  icon:     "compass",
  xp:       15,
};

// ── Initial state ─────────────────────────────────────────────────────────────

describe("useDB — initial state", () => {
  it("returns empty journal and activity arrays", () => {
    const { result } = renderHook(() => useDB("p1"));
    expect(result.current.journal).toEqual([]);
    expect(result.current.activity).toEqual([]);
  });

  it("isLoading is false when useLiveQuery returns the default []", () => {
    const { result } = renderHook(() => useDB("p1"));
    expect(result.current.isLoading).toBe(false);
  });

  it("returns empty arrays when profileId is null", () => {
    const { result } = renderHook(() => useDB(null));
    expect(result.current.journal).toEqual([]);
    expect(result.current.activity).toEqual([]);
  });
});

// ── addNote ───────────────────────────────────────────────────────────────────

describe("useDB — addNote", () => {
  it("calls addJournalEntry with the correct shape", async () => {
    const { result } = renderHook(() => useDB("p1"));

    await act(() => result.current.addNote({ text: "I spotted a church steeple" }));

    expect(addJournalEntry).toHaveBeenCalledWith({
      profileId: "p1",
      type:      "note",
      ch:        "Observation",
      category:  "Observation",
      icon:      "landmark",
      text:      "I spotted a church steeple",
      xp:        0,
    });
  });

  it("trims whitespace from the text", async () => {
    const { result } = renderHook(() => useDB("p1"));
    await act(() => result.current.addNote({ text: "  padded  " }));

    const arg = addJournalEntry.mock.calls[0][0];
    expect(arg.text).toBe("padded");
  });

  it("does not call addJournalEntry when text is blank", async () => {
    const { result } = renderHook(() => useDB("p1"));
    await act(() => result.current.addNote({ text: "   " }));
    expect(addJournalEntry).not.toHaveBeenCalled();
  });

  it("does not call addJournalEntry when profileId is null", async () => {
    const { result } = renderHook(() => useDB(null));
    await act(() => result.current.addNote({ text: "hello" }));
    expect(addJournalEntry).not.toHaveBeenCalled();
  });
});

// ── addChallengeReflection ────────────────────────────────────────────────────

describe("useDB — addChallengeReflection", () => {
  it("calls addJournalEntry with type='challenge' and challenge fields", async () => {
    const { result } = renderHook(() => useDB("p1"));

    await act(() =>
      result.current.addChallengeReflection({ challenge: CHALLENGE, text: "Great walk" })
    );

    expect(addJournalEntry).toHaveBeenCalledWith({
      profileId: "p1",
      type:      "challenge",
      ch:        CHALLENGE.title,
      category:  CHALLENGE.category,
      icon:      CHALLENGE.icon,
      text:      "Great walk",
      xp:        CHALLENGE.xp,
    });
  });

  it("does nothing when text is empty", async () => {
    const { result } = renderHook(() => useDB("p1"));
    await act(() =>
      result.current.addChallengeReflection({ challenge: CHALLENGE, text: "" })
    );
    expect(addJournalEntry).not.toHaveBeenCalled();
  });

  it("does nothing when profileId is null", async () => {
    const { result } = renderHook(() => useDB(null));
    await act(() =>
      result.current.addChallengeReflection({ challenge: CHALLENGE, text: "text" })
    );
    expect(addJournalEntry).not.toHaveBeenCalled();
  });
});

// ── addDrillReflection ────────────────────────────────────────────────────────

describe("useDB — addDrillReflection", () => {
  it("calls addJournalEntry with type='drill' and drill fields", async () => {
    const { result } = renderHook(() => useDB("p1"));

    await act(() =>
      result.current.addDrillReflection({ drill: DRILL, text: "Nailed the cardinal points" })
    );

    expect(addJournalEntry).toHaveBeenCalledWith({
      profileId: "p1",
      type:      "drill",
      ch:        DRILL.title,
      category:  DRILL.category,
      icon:      DRILL.icon,
      text:      "Nailed the cardinal points",
      xp:        DRILL.xp,
    });
  });

  it("does nothing when text is empty", async () => {
    const { result } = renderHook(() => useDB("p1"));
    await act(() =>
      result.current.addDrillReflection({ drill: DRILL, text: "  " })
    );
    expect(addJournalEntry).not.toHaveBeenCalled();
  });
});

// ── logChallengeActivity ──────────────────────────────────────────────────────

describe("useDB — logChallengeActivity", () => {
  it("calls logActivity with type='challenge' and challenge fields", async () => {
    const { result } = renderHook(() => useDB("p1"));

    await act(() => result.current.logChallengeActivity({ challenge: CHALLENGE }));

    expect(logActivity).toHaveBeenCalledWith({
      profileId: "p1",
      type:      "challenge",
      title:     CHALLENGE.title,
      category:  CHALLENGE.category,
      icon:      CHALLENGE.icon,
      xp:        CHALLENGE.xp,
    });
  });

  it("does nothing when profileId is null", async () => {
    const { result } = renderHook(() => useDB(null));
    await act(() => result.current.logChallengeActivity({ challenge: CHALLENGE }));
    expect(logActivity).not.toHaveBeenCalled();
  });
});

// ── logDrillActivity ──────────────────────────────────────────────────────────

describe("useDB — logDrillActivity", () => {
  it("calls logActivity with type='drill' and drill fields", async () => {
    const { result } = renderHook(() => useDB("p1"));

    await act(() => result.current.logDrillActivity({ drill: DRILL }));

    expect(logActivity).toHaveBeenCalledWith({
      profileId: "p1",
      type:      "drill",
      title:     DRILL.title,
      category:  DRILL.category,
      icon:      DRILL.icon,
      xp:        DRILL.xp,
    });
  });
});

// ── removeJournalEntry ────────────────────────────────────────────────────────

describe("useDB — removeJournalEntry", () => {
  it("calls deleteJournalEntry with the given id", async () => {
    const { result } = renderHook(() => useDB("p1"));

    await act(() => result.current.removeJournalEntry(42));

    expect(deleteJournalEntry).toHaveBeenCalledWith(42);
  });
});

// ── clearAll ──────────────────────────────────────────────────────────────────

describe("useDB — clearAll", () => {
  it("calls clearProfileData with the profileId", async () => {
    const { result } = renderHook(() => useDB("p1"));

    await act(() => result.current.clearAll());

    expect(clearProfileData).toHaveBeenCalledWith("p1");
  });

  it("does nothing when profileId is null", async () => {
    const { result } = renderHook(() => useDB(null));
    await act(() => result.current.clearAll());
    expect(clearProfileData).not.toHaveBeenCalled();
  });
});
