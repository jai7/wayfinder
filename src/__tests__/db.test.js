import { describe, it, expect, beforeEach, vi } from "vitest";

// ── Hoisted mocks (must be before any import that triggers db.js) ─────────────

const mocks = vi.hoisted(() => {
  function makeChain() {
    const sortBy = vi.fn().mockResolvedValue([]);
    const chainDel = vi.fn().mockResolvedValue(undefined);
    const reverse = vi.fn(() => ({ sortBy }));
    const equals = vi.fn(() => ({ reverse, delete: chainDel }));
    const where = vi.fn(() => ({ equals }));
    const add = vi.fn().mockResolvedValue(1);
    return { add, where, _sortBy: sortBy, _chainDel: chainDel, _reverse: reverse, _equals: equals };
  }

  return {
    journal: makeChain(),
    activity: makeChain(),
  };
});

vi.mock("dexie", () => ({
  default: class MockDexie {
    constructor() {
      this.journal = mocks.journal;
      this.activity = mocks.activity;
    }
    version() {
      return { stores: vi.fn() };
    }
  },
}));

// Import after mocks are wired up
import {
  addJournalEntry,
  getJournalEntries,
  deleteJournalEntry,
  logActivity,
  getActivity,
  clearProfileData,
} from "../db.js";

// ── addJournalEntry ───────────────────────────────────────────────────────────

describe("addJournalEntry", () => {
  it("calls db.journal.add with the entry fields and a createdAt timestamp", async () => {
    const entry = { profileId: "p1", type: "note", text: "saw the tower", xp: 0 };
    await addJournalEntry(entry);

    expect(mocks.journal.add).toHaveBeenCalledOnce();
    const arg = mocks.journal.add.mock.calls[0][0];
    expect(arg).toMatchObject(entry);
    expect(typeof arg.createdAt).toBe("number");
    expect(arg.createdAt).toBeGreaterThan(0);
  });

  it("sets createdAt close to Date.now()", async () => {
    const before = Date.now();
    await addJournalEntry({ profileId: "p1", type: "note", text: "hi", xp: 0 });
    const after = Date.now();

    const { createdAt } = mocks.journal.add.mock.calls[0][0];
    expect(createdAt).toBeGreaterThanOrEqual(before);
    expect(createdAt).toBeLessThanOrEqual(after);
  });

  it("returns the id resolved by Dexie", async () => {
    mocks.journal.add.mockResolvedValueOnce(42);
    const id = await addJournalEntry({ profileId: "p1", type: "note", text: "x", xp: 0 });
    expect(id).toBe(42);
  });
});

// ── getJournalEntries ─────────────────────────────────────────────────────────

describe("getJournalEntries", () => {
  it("queries by profileId, reverses, and sorts by createdAt", async () => {
    const entries = [{ id: 2, createdAt: 2000 }, { id: 1, createdAt: 1000 }];
    mocks.journal._sortBy.mockResolvedValueOnce(entries);

    const result = await getJournalEntries("p1");

    expect(mocks.journal.where).toHaveBeenCalledWith("profileId");
    expect(mocks.journal._equals).toHaveBeenCalledWith("p1");
    expect(mocks.journal._reverse).toHaveBeenCalled();
    expect(mocks.journal._sortBy).toHaveBeenCalledWith("createdAt");
    expect(result).toBe(entries);
  });
});

// ── deleteJournalEntry ────────────────────────────────────────────────────────

describe("deleteJournalEntry", () => {
  it("calls db.journal.delete with the given id", async () => {
    // delete is on the db.journal table directly
    const directDelete = vi.fn().mockResolvedValue(undefined);
    mocks.journal.delete = directDelete;

    await deleteJournalEntry(7);

    expect(directDelete).toHaveBeenCalledWith(7);
  });
});

// ── logActivity ───────────────────────────────────────────────────────────────

describe("logActivity", () => {
  it("calls db.activity.add with event fields and a createdAt timestamp", async () => {
    const event = { profileId: "p1", type: "challenge", title: "Wander Home", xp: 50 };
    await logActivity(event);

    expect(mocks.activity.add).toHaveBeenCalledOnce();
    const arg = mocks.activity.add.mock.calls[0][0];
    expect(arg).toMatchObject(event);
    expect(typeof arg.createdAt).toBe("number");
  });

  it("returns the id resolved by Dexie", async () => {
    mocks.activity.add.mockResolvedValueOnce(99);
    const id = await logActivity({ profileId: "p1", type: "drill", title: "Spin", xp: 10 });
    expect(id).toBe(99);
  });
});

// ── getActivity ───────────────────────────────────────────────────────────────

describe("getActivity", () => {
  it("queries by profileId, reverses, and sorts by createdAt", async () => {
    const events = [{ id: 3, createdAt: 3000 }];
    mocks.activity._sortBy.mockResolvedValueOnce(events);

    const result = await getActivity("p2");

    expect(mocks.activity.where).toHaveBeenCalledWith("profileId");
    expect(mocks.activity._equals).toHaveBeenCalledWith("p2");
    expect(mocks.activity._reverse).toHaveBeenCalled();
    expect(mocks.activity._sortBy).toHaveBeenCalledWith("createdAt");
    expect(result).toBe(events);
  });
});

// ── clearProfileData ──────────────────────────────────────────────────────────

describe("clearProfileData", () => {
  it("deletes journal and activity records for the given profileId", async () => {
    await clearProfileData("p1");

    // journal chain: where("profileId").equals("p1").delete()
    expect(mocks.journal.where).toHaveBeenCalledWith("profileId");
    expect(mocks.journal._equals).toHaveBeenCalledWith("p1");
    expect(mocks.journal._chainDel).toHaveBeenCalled();

    // activity chain: where("profileId").equals("p1").delete()
    expect(mocks.activity.where).toHaveBeenCalledWith("profileId");
    expect(mocks.activity._equals).toHaveBeenCalledWith("p1");
    expect(mocks.activity._chainDel).toHaveBeenCalled();
  });
});
