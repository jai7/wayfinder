import Dexie from "dexie";

// ── Schema ────────────────────────────────────────────────────────────────────
export const db = new Dexie("wayfinder_db");

db.version(1).stores({
  // journal: reflections from challenges/drills + free observations
  journal:  "++id, profileId, createdAt, type",
  // activity: every challenge/drill completion event (feed)
  activity: "++id, profileId, createdAt, type",
});

// ── Journal ───────────────────────────────────────────────────────────────────

/**
 * Add a journal entry (reflection or free note).
 * @param {object} entry - { profileId, type, ch, category, icon, text, xp }
 */
export async function addJournalEntry(entry) {
  const ts = Date.now();
  return db.journal.add({
    ...entry,
    createdAt: ts,
    date: new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    time: new Date(ts).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
  });
}

/**
 * Get all journal entries for a profile, newest first.
 */
export async function getJournalEntries(profileId) {
  return db.journal
    .where("profileId").equals(profileId)
    .reverse()
    .sortBy("createdAt");
}

/**
 * Delete a single journal entry by id.
 */
export async function deleteJournalEntry(id) {
  return db.journal.delete(id);
}

// ── Activity feed ─────────────────────────────────────────────────────────────

/**
 * Log a completion event to the activity feed.
 * @param {object} event - { profileId, type, title, category, icon, xp }
 */
export async function logActivity(event) {
  const ts = Date.now();
  return db.activity.add({
    ...event,
    createdAt: ts,
    date: new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    time: new Date(ts).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
  });
}

/**
 * Get all activity entries for a profile, newest first.
 */
export async function getActivity(profileId) {
  return db.activity
    .where("profileId").equals(profileId)
    .reverse()
    .sortBy("createdAt");
}

// ── Reset ─────────────────────────────────────────────────────────────────────

/**
 * Delete all journal + activity records for a profile.
 */
export async function clearProfileData(profileId) {
  await db.journal.where("profileId").equals(profileId).delete();
  await db.activity.where("profileId").equals(profileId).delete();
}
