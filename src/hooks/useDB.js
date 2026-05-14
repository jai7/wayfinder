import { useLiveQuery } from "dexie-react-hooks";
import {
  db,
  addJournalEntry,
  deleteJournalEntry,
  logActivity,
  clearProfileData,
} from "../db.js";

/**
 * Provides reactive journal + activity data for a profile using
 * Dexie's useLiveQuery — re-renders automatically on any DB change.
 *
 * @param {string|null} profileId
 */
export function useDB(profileId) {
  // Live queries — re-render whenever data changes in IndexedDB
  const journal = useLiveQuery(
    () => profileId
      ? db.journal.where("profileId").equals(profileId).reverse().sortBy("createdAt")
      : Promise.resolve([]),
    [profileId],
    [] // default while loading
  );

  const activity = useLiveQuery(
    () => profileId
      ? db.activity.where("profileId").equals(profileId).reverse().sortBy("createdAt")
      : Promise.resolve([]),
    [profileId],
    []
  );

  const isLoading = journal === undefined || activity === undefined;

  async function addNote({ text }) {
    if (!profileId || !text.trim()) return;
    await addJournalEntry({
      profileId,
      type:     "note",
      ch:       "Observation",
      category: "Observation",
      icon:     "landmark",
      text:     text.trim(),
      xp:       0,
    });
  }

  async function addChallengeReflection({ challenge, text }) {
    if (!profileId || !text.trim()) return;
    await addJournalEntry({
      profileId,
      type:     "challenge",
      ch:       challenge.title,
      category: challenge.category,
      icon:     challenge.icon,
      text:     text.trim(),
      xp:       challenge.xp,
    });
  }

  async function addDrillReflection({ drill, text }) {
    if (!profileId || !text.trim()) return;
    await addJournalEntry({
      profileId,
      type:     "drill",
      ch:       drill.title,
      category: drill.category,
      icon:     drill.icon,
      text:     text.trim(),
      xp:       drill.xp,
    });
  }

  async function logChallengeActivity({ challenge }) {
    if (!profileId) return;
    await logActivity({
      profileId,
      type:     "challenge",
      title:    challenge.title,
      category: challenge.category,
      icon:     challenge.icon,
      xp:       challenge.xp,
    });
  }

  async function logDrillActivity({ drill }) {
    if (!profileId) return;
    await logActivity({
      profileId,
      type:  "drill",
      title: drill.title,
      category: drill.category,
      icon:  drill.icon,
      xp:    drill.xp,
    });
  }

  async function removeJournalEntry(id) {
    await deleteJournalEntry(id);
  }

  async function clearAll() {
    if (!profileId) return;
    await clearProfileData(profileId);
  }

  return {
    journal:  journal ?? [],
    activity: activity ?? [],
    isLoading,
    addNote,
    addChallengeReflection,
    addDrillReflection,
    logChallengeActivity,
    logDrillActivity,
    removeJournalEntry,
    clearAll,
  };
}
