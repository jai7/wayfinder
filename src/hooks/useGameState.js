import { useState } from "react";
import { todayKey } from "../utils/dates.js";

// ── Tiny localStorage helper ───────────────────────────────────────────────────
function ls(key, init) {
  function read() {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : init;
    } catch {
      return init;
    }
  }
  function write(v) {
    try { localStorage.setItem(key, JSON.stringify(v)); } catch {}
  }
  return { read, write };
}

/**
 * All game state that lives in localStorage (fast, synchronous reads).
 *
 * Separated from IDB data (journal/activity) which is async.
 */
export function useGameState() {
  const stores = {
    xp:          ls("wf_xp",          0),
    streak:      ls("wf_streak",      0),
    lastDate:    ls("wf_lastdate",    null),
    done:        ls("wf_done",        []),        // completed challenge IDs (permanent)
    skills:      ls("wf_skills",      { observation:0, cardinal:0, mental_map:0, landmark:0, confidence:0 }),
    drillsToday: ls("wf_drills_today",{ date:"", ids:[] }), // resets each day
    totalDrills: ls("wf_total_drills",0),
  };

  const [xp,          setXpRaw]     = useState(() => stores.xp.read());
  const [streak,      setStreakRaw]  = useState(() => stores.streak.read());
  const [lastDate,    setLastDateRaw]= useState(() => stores.lastDate.read());
  const [done,        setDoneRaw]    = useState(() => stores.done.read());
  const [skills,      setSkillsRaw]  = useState(() => stores.skills.read());
  const [drillsToday, setDTRaw]      = useState(() => {
    const saved = stores.drillsToday.read();
    return saved.date === todayKey() ? saved : { date: todayKey(), ids: [] };
  });
  const [totalDrills, setTDRaw]      = useState(() => stores.totalDrills.read());

  function make(setter, store) {
    return val => {
      const next = typeof val === "function" ? val(setter === setXpRaw ? xp : undefined) : val;
      setter(next);
      store.write(next);
    };
  }

  // Typed setters that write-through to localStorage
  const setXp      = v => { const n = typeof v === "function" ? v(xp)          : v; setXpRaw(n);      stores.xp.write(n); };
  const setStreak  = v => { const n = typeof v === "function" ? v(streak)       : v; setStreakRaw(n);  stores.streak.write(n); };
  const setLastDate= v => { setLastDateRaw(v); stores.lastDate.write(v); };
  const setDone    = v => { const n = typeof v === "function" ? v(done)         : v; setDoneRaw(n);    stores.done.write(n); };
  const setSkills  = v => { const n = typeof v === "function" ? v(skills)       : v; setSkillsRaw(n);  stores.skills.write(n); };
  const setDrillsToday = v => { const n = typeof v === "function" ? v(drillsToday) : v; setDTRaw(n); stores.drillsToday.write(n); };
  const setTotalDrills = v => { const n = typeof v === "function" ? v(totalDrills) : v; setTDRaw(n); stores.totalDrills.write(n); };

  /** Called after completing any challenge or drill to advance streak. */
  function bumpStreak() {
    const today = new Date().toDateString();
    if (lastDate !== today) {
      setStreak(s => s + 1);
      setLastDate(today);
    }
  }

  /** Full reset — wipes all game state from localStorage. */
  function resetGameState() {
    setXp(0); setStreak(0); setLastDate(null);
    setDone([]); setSkills({ observation:0, cardinal:0, mental_map:0, landmark:0, confidence:0 });
    setDrillsToday({ date: todayKey(), ids: [] });
    setTotalDrills(0);
  }

  // Check for broken streak on mount (done in App via useEffect)
  function checkStreak() {
    const today = new Date().toDateString();
    if (lastDate && lastDate !== today) {
      const yest = new Date();
      yest.setDate(yest.getDate() - 1);
      if (lastDate !== yest.toDateString()) {
        setStreak(0);
        stores.streak.write(0);
      }
    }
  }

  return {
    xp, setXp,
    streak, setStreak,
    lastDate,
    done, setDone,
    skills, setSkills,
    drillsToday, setDrillsToday,
    totalDrills, setTotalDrills,
    bumpStreak,
    resetGameState,
    checkStreak,
  };
}
