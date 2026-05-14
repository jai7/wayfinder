import { useState, useEffect, useRef } from "react";
import { useProfile }    from "./hooks/useProfile.js";
import { useGameState }  from "./hooks/useGameState.js";
import { useDB }         from "./hooks/useDB.js";
import Onboarding        from "./components/Onboarding.jsx";
import ProfileSheet      from "./components/ProfileSheet.jsx";
import Icon              from "./components/Icon.jsx";
import ChallengesScreen  from "./screens/Challenges.jsx";
import SkillsScreen      from "./screens/Skills.jsx";
import HistoryScreen     from "./screens/History.jsx";
import { AVATAR_COLORS, SKILL_MAP } from "./data/levels.js";
import { getLevel, getNextLevel, initials } from "./utils/levels.js";
import { getGreeting, todayKey } from "./utils/dates.js";

// Detects desktop breakpoint reactively
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 768 : false
  );
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const handler = e => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isDesktop;
}

const TABS = [
  { id: "challenges", label: "Challenges", icon: "zap"      },
  { id: "skills",     label: "Skills",     icon: "barChart"  },
  { id: "history",    label: "History",    icon: "activity"  },
];

export default function App() {
  const { profile, setProfile }  = useProfile();
  const gameState                = useGameState();
  const db                       = useDB(profile?.id ?? null);
  const isDesktop                = useIsDesktop();

  const [tab, setTab]                 = useState("challenges");
  const [showProfile, setShowProfile] = useState(false);
  const [banner, setBanner]           = useState(null);
  const bannerTimer                   = useRef(null);

  // Streak integrity + daily drill reset on mount
  useEffect(() => {
    gameState.checkStreak();
    if (gameState.drillsToday.date !== todayKey()) {
      gameState.setDrillsToday({ date: todayKey(), ids: [] });
    }
  }, []);

  function flashBanner(amount) {
    setBanner(amount);
    clearTimeout(bannerTimer.current);
    bannerTimer.current = setTimeout(() => setBanner(null), 2400);
  }

  // Game actions passed down to screens
  const enrichedGameState = {
    ...gameState,
    completeChallenge(challenge) {
      if (gameState.done.includes(challenge.id)) return;
      gameState.setXp(x => x + challenge.xp);
      gameState.setDone(d => [...d, challenge.id]);
      const sk = SKILL_MAP[challenge.category];
      if (sk) gameState.setSkills(s => ({ ...s, [sk]: (s[sk] ?? 0) + 1 }));
      gameState.bumpStreak();
      flashBanner(challenge.xp);
    },
    completeDrill(drill) {
      gameState.setXp(x => x + drill.xp);
      gameState.setTotalDrills(n => n + 1);
      gameState.setDrillsToday(d => ({ date: d.date, ids: [...d.ids, drill.id] }));
      const sk = SKILL_MAP[drill.category];
      if (sk) gameState.setSkills(s => ({ ...s, [sk]: (s[sk] ?? 0) + 1 }));
      gameState.bumpStreak();
      flashBanner(drill.xp);
    },
  };

  async function handleReset() {
    gameState.resetGameState();
    await db.clearAll();
    setShowProfile(false);
  }

  if (!profile) return <Onboarding onComplete={p => setProfile(p)} />;

  const level    = getLevel(gameState.xp);
  const nextLvl  = getNextLevel(gameState.xp);
  const xpIn     = gameState.xp - level.min;
  const xpNeeded = nextLvl.min - level.min;
  const prog     = Math.min(100, Math.round((xpIn / xpNeeded) * 100));
  const [avBg, avFg] = AVATAR_COLORS[profile.avatarIdx ?? 0];

  // ── Shared header content (used in both mobile header and desktop sidebar)
  const HeaderContent = (
    <>
      {/* Level bar */}
      <div style={{ background: "#F9F9F9", borderRadius: 14, padding: "14px 16px", marginBottom: isDesktop ? 0 : 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 20 }}>{level.emoji}</span>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#1C1C1E", letterSpacing: "-0.01em" }}>{level.name}</p>
              <p style={{ fontSize: 12, color: "#8E8E93", marginTop: 1 }}>→ {nextLvl.name} {nextLvl.emoji}</p>
            </div>
          </div>
          <span style={{ fontSize: 12, color: "#8E8E93" }}>{xpIn} / {xpNeeded} XP</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${prog}%` }} />
        </div>
      </div>
    </>
  );

  // ── DESKTOP LAYOUT ──────────────────────────────────────────────────────────
  if (isDesktop) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", background: "#F2F2F7" }}>

        {/* XP banner */}
        {banner !== null && <div className="xp-banner" role="status">+{banner} XP earned 🎯</div>}

        {/* ── Sidebar ── */}
        <aside style={{
          width: 280, flexShrink: 0, position: "fixed", top: 0, left: 0, bottom: 0,
          background: "#fff", borderRight: "1px solid #F2F2F7",
          display: "flex", flexDirection: "column", padding: "40px 0 0", zIndex: 80, overflowY: "auto",
        }}>
          <div style={{ padding: "0 20px", flex: 1 }}>

            {/* App name */}
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: "#8E8E93", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                🧭 Wayfinder
              </p>
              <p style={{ fontSize: 13, color: "#8E8E93", letterSpacing: "-0.01em", marginBottom: 2 }}>{getGreeting()},</p>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1C1C1E", letterSpacing: "-0.03em", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {profile.name} 👋
              </h1>
            </div>

            {/* Streak + XP chips */}
            <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
              <div style={{ background: "#FFF3E0", borderRadius: 10, padding: "7px 12px", display: "flex", alignItems: "center", gap: 5 }}>
                <Icon name="flame" size={14} color="#FF9500" />
                <span style={{ fontSize: 13, fontWeight: 600, color: "#FF9500" }}>{gameState.streak}</span>
                <span style={{ fontSize: 12, color: "#FF9500" }}>streak</span>
              </div>
              <div style={{ background: "#E8F4FF", borderRadius: 10, padding: "7px 12px", display: "flex", alignItems: "center", gap: 5 }}>
                <Icon name="zap" size={14} color="#007AFF" />
                <span style={{ fontSize: 13, fontWeight: 600, color: "#007AFF" }}>{gameState.xp}</span>
                <span style={{ fontSize: 12, color: "#007AFF" }}>XP</span>
              </div>
            </div>

            {/* Level bar */}
            <div style={{ background: "#F9F9F9", borderRadius: 14, padding: "14px 16px", marginBottom: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{level.emoji}</span>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#1C1C1E", letterSpacing: "-0.01em" }}>{level.name}</p>
                    <p style={{ fontSize: 11, color: "#8E8E93", marginTop: 1 }}>→ {nextLvl.name}</p>
                  </div>
                </div>
                <span style={{ fontSize: 11, color: "#8E8E93" }}>{xpIn}/{xpNeeded}</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${prog}%` }} />
              </div>
            </div>

            {/* Nav links */}
            <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {TABS.map(({ id, label, icon }) => (
                <button key={id} onClick={() => setTab(id)} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "11px 14px",
                  borderRadius: 12, border: "none", cursor: "pointer", textAlign: "left", width: "100%",
                  fontSize: 15, fontWeight: tab === id ? 600 : 500, letterSpacing: "-0.01em",
                  background: tab === id ? "#E8F4FF" : "none",
                  color: tab === id ? "#007AFF" : "#3C3C43",
                  transition: "background 0.12s, color 0.12s",
                }}>
                  <Icon name={icon} size={18} color={tab === id ? "#007AFF" : "#8E8E93"} strokeWidth={tab === id ? 2.2 : 1.75} />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {/* Profile button at bottom of sidebar */}
          <div style={{ padding: "20px", borderTop: "1px solid #F2F2F7" }}>
            <button onClick={() => setShowProfile(true)} style={{
              display: "flex", alignItems: "center", gap: 12, width: "100%",
              background: "none", border: "none", cursor: "pointer", padding: "8px 6px", borderRadius: 12,
              transition: "background 0.12s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "#F2F2F7"}
              onMouseLeave={e => e.currentTarget.style.background = "none"}
            >
              <div style={{ width: 36, height: 36, borderRadius: 11, background: avBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: avFg }}>{initials(profile.name)}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#1C1C1E", letterSpacing: "-0.01em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{profile.name}</p>
                <p style={{ fontSize: 12, color: "#8E8E93" }}>View profile</p>
              </div>
              <Icon name="chevronR" size={14} color="#C7C7CC" />
            </button>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main style={{ marginLeft: 280, flex: 1, minHeight: "100vh" }}>
          {tab === "challenges" && <ChallengesScreen gameState={enrichedGameState} db={db} />}
          {tab === "skills"     && <SkillsScreen     gameState={enrichedGameState} />}
          {tab === "history"    && <HistoryScreen     db={db} />}
        </main>

        {/* Profile sheet */}
        {showProfile && (
          <ProfileSheet
            profile={profile}
            stats={{ xp: gameState.xp, done: gameState.done.length, streak: gameState.streak, drills: gameState.totalDrills }}
            onClose={() => setShowProfile(false)}
            onUpdate={p => { setProfile(p); setShowProfile(false); }}
            onReset={handleReset}
          />
        )}
      </div>
    );
  }

  // ── MOBILE LAYOUT ───────────────────────────────────────────────────────────
  return (
    <div>
      {banner !== null && <div className="xp-banner" role="status">+{banner} XP earned 🎯</div>}

      <div className="app-wrap">
        {/* Sticky mobile header */}
        <header className="header">
          <div className="header-inner">
            {/* Greeting + chips + avatar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, color: "#8E8E93", letterSpacing: "-0.01em", marginBottom: 2 }}>{getGreeting()},</p>
                <h1 style={{ fontSize: 26, fontWeight: 700, color: "#1C1C1E", letterSpacing: "-0.03em", lineHeight: 1.1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {profile.name} 👋
                </h1>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, marginLeft: 12 }}>
                <div style={{ background: "#FFF3E0", borderRadius: 10, padding: "7px 10px", display: "flex", alignItems: "center", gap: 4 }}>
                  <Icon name="flame" size={14} color="#FF9500" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#FF9500" }}>{gameState.streak}</span>
                </div>
                <div style={{ background: "#E8F4FF", borderRadius: 10, padding: "7px 10px", display: "flex", alignItems: "center", gap: 4 }}>
                  <Icon name="zap" size={14} color="#007AFF" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#007AFF" }}>{gameState.xp}</span>
                </div>
                <button onClick={() => setShowProfile(true)} aria-label="Open profile"
                  style={{ width: 40, height: 40, borderRadius: 13, background: avBg, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: avFg, letterSpacing: "-0.01em" }}>{initials(profile.name)}</span>
                </button>
              </div>
            </div>

            {/* Level bar */}
            <div style={{ background: "#F9F9F9", borderRadius: 14, padding: "14px 16px", marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 20 }}>{level.emoji}</span>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#1C1C1E", letterSpacing: "-0.01em" }}>{level.name}</p>
                    <p style={{ fontSize: 12, color: "#8E8E93", marginTop: 1 }}>→ {nextLvl.name} {nextLvl.emoji}</p>
                  </div>
                </div>
                <span style={{ fontSize: 12, color: "#8E8E93" }}>{xpIn} / {xpNeeded} XP</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${prog}%` }} />
              </div>
            </div>

            {/* Tab strip */}
            <nav className="header-tabs" aria-label="Main navigation">
              {TABS.map(({ id, label, icon }) => (
                <button key={id} className={`header-tab${tab === id ? " active" : ""}`} onClick={() => setTab(id)} aria-current={tab === id ? "page" : undefined}>
                  <Icon name={icon} size={14} color={tab === id ? "#007AFF" : "#AEAEB2"} />
                  {label}
                </button>
              ))}
            </nav>
          </div>
        </header>

        {/* Screens */}
        {tab === "challenges" && <ChallengesScreen gameState={enrichedGameState} db={db} />}
        {tab === "skills"     && <SkillsScreen     gameState={enrichedGameState} />}
        {tab === "history"    && <HistoryScreen     db={db} />}
      </div>

      {/* Bottom tab bar */}
      <nav className="tab-bar" aria-label="Tab bar">
        {TABS.map(({ id, label, icon }) => (
          <button key={id} className="tab-btn" onClick={() => setTab(id)} aria-label={label} aria-current={tab === id ? "page" : undefined}>
            <Icon name={icon} size={22} color={tab === id ? "#007AFF" : "#8E8E93"} strokeWidth={tab === id ? 2.2 : 1.75} />
            <span className="tab-label" style={{ color: tab === id ? "#007AFF" : "#8E8E93" }}>{label}</span>
          </button>
        ))}
      </nav>

      {showProfile && (
        <ProfileSheet
          profile={profile}
          stats={{ xp: gameState.xp, done: gameState.done.length, streak: gameState.streak, drills: gameState.totalDrills }}
          onClose={() => setShowProfile(false)}
          onUpdate={p => { setProfile(p); setShowProfile(false); }}
          onReset={handleReset}
        />
      )}
    </div>
  );
}
