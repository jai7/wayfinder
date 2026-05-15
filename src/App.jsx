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
  { id: "challenges", label: "Drills",   icon: "zap"      },
  { id: "skills",     label: "Skills",   icon: "barChart"  },
  { id: "history",    label: "History",  icon: "activity"  },
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
  const xpNeeded = nextLvl ? nextLvl.min - level.min : 1;
  const prog     = Math.min(100, Math.round((xpIn / xpNeeded) * 100));
  const [avBg, avFg] = AVATAR_COLORS[profile.avatarIdx ?? 0];

  // ── DESKTOP LAYOUT ──────────────────────────────────────────────────────────
  if (isDesktop) {
    return (
      <div className="desktop-shell pop-paper">

        {banner !== null && (
          <div className="xp-banner" role="status">+{banner} XP EARNED ✦</div>
        )}

        {/* ── Sidebar ── */}
        <aside className="sidebar">
          <div className="sidebar-inner">

            {/* Wordmark */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontFamily: "'VT323', monospace", fontSize: 12, letterSpacing: '0.15em', color: 'rgba(253,246,223,.45)', marginBottom: 4 }}>
                VOL. I · 1986 EDITION
              </div>
              <div style={{
                fontFamily: "'Bungee', sans-serif",
                fontSize: 28,
                color: '#fdf6df',
                textShadow: '2px 2px 0 rgba(80,180,210,.5)',
                lineHeight: 1,
              }}>
                WAYFINDER
              </div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, color: 'rgba(253,246,223,.45)', marginTop: 4, lineHeight: 1.4 }}>
                pocket atlas of personal orientation
              </div>
            </div>

            {/* Profile row */}
            <button
              onClick={() => setShowProfile(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                background: 'rgba(253,246,223,.08)', border: '1px solid rgba(253,246,223,.2)',
                cursor: 'pointer', padding: '10px 12px', marginBottom: 20,
              }}
            >
              <div style={{
                width: 34, height: 34, background: avBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: avFg, fontFamily: "'Big Shoulders Display', sans-serif" }}>
                  {initials(profile.name)}
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#fdf6df', fontFamily: "'Big Shoulders Display', sans-serif", letterSpacing: '0.05em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {profile.name.toUpperCase()}
                </div>
                <div style={{ fontFamily: "'VT323', monospace", fontSize: 13, color: 'rgba(253,246,223,.5)', letterSpacing: '0.08em' }}>
                  {level.name.toUpperCase()} · {gameState.xp} XP
                </div>
              </div>
              <Icon name="chevronR" size={14} color="rgba(253,246,223,.4)" />
            </button>

            {/* XP bar */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontFamily: "'VT323', monospace", fontSize: 13, color: 'rgba(253,246,223,.55)', letterSpacing: '0.1em' }}>
                  {level.name.toUpperCase()}
                </span>
                {nextLvl && (
                  <span style={{ fontFamily: "'VT323', monospace", fontSize: 13, color: 'rgba(253,246,223,.35)', letterSpacing: '0.08em' }}>
                    → {nextLvl.name.toUpperCase()}
                  </span>
                )}
              </div>
              <div style={{ height: 8, background: 'rgba(253,246,223,.15)', border: '1px solid rgba(253,246,223,.25)' }}>
                <div style={{ height: '100%', width: `${prog}%`, background: '#e63a2e', transition: 'width 0.6s' }} />
              </div>
              <div style={{ fontFamily: "'VT323', monospace", fontSize: 12, color: 'rgba(253,246,223,.4)', letterSpacing: '0.08em', marginTop: 4 }}>
                {xpIn} / {xpNeeded} XP
              </div>
            </div>

            {/* Streak */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28,
              background: 'rgba(230,58,46,.15)', border: '1px solid rgba(230,58,46,.3)',
              padding: '8px 12px',
            }}>
              <span style={{ fontSize: 16 }}>🔥</span>
              <span style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: 18, fontWeight: 900, color: '#e63a2e' }}>
                {gameState.streak}
              </span>
              <span style={{ fontFamily: "'VT323', monospace", fontSize: 14, color: 'rgba(253,246,223,.5)', letterSpacing: '0.1em' }}>
                DAY STREAK
              </span>
            </div>

            {/* Nav */}
            <nav className="sidebar-nav">
              {TABS.map(({ id, label, icon }) => (
                <button
                  key={id}
                  className={`sidebar-nav-btn${tab === id ? " active" : ""}`}
                  onClick={() => setTab(id)}
                >
                  <Icon name={icon} size={16} color={tab === id ? "#e63a2e" : "rgba(253,246,223,.4)"} strokeWidth={tab === id ? 2.2 : 1.75} />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {/* Footer */}
          <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(253,246,223,.15)' }}>
            <div style={{ fontFamily: "'VT323', monospace", fontSize: 12, color: 'rgba(253,246,223,.3)', letterSpacing: '0.1em', lineHeight: 1.6 }}>
              ★ TRUE NORTH BY THE SHADOW AT NOON<br />
              R.S. WAYFINDER & CO. · CHICAGO · 1986
            </div>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="main-content">
          {tab === "challenges" && <ChallengesScreen gameState={enrichedGameState} db={db} profile={profile} />}
          {tab === "skills"     && <SkillsScreen     gameState={enrichedGameState} />}
          {tab === "history"    && <HistoryScreen     db={db} />}
        </main>

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
    <div className="pop-paper" style={{ minHeight: '100vh' }}>
      {banner !== null && (
        <div className="xp-banner" role="status">+{banner} XP EARNED ✦</div>
      )}

      <div className="app-wrap">
        {/* Sticky mobile header */}
        <header className="header">
          <div className="header-inner">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              {/* Left: wordmark + greeting */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'VT323', monospace", fontSize: 11, letterSpacing: '0.15em', color: 'rgba(26,38,34,.5)' }}>
                  {getGreeting().toUpperCase()},
                </div>
                <div style={{
                  fontFamily: "'Big Shoulders Display', sans-serif",
                  fontSize: 22, fontWeight: 900, lineHeight: 1,
                  color: '#1a2622', letterSpacing: '-0.01em',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {profile.name.toUpperCase()}
                </div>
              </div>

              {/* Right: streak + XP + avatar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, marginLeft: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(230,58,46,.12)', border: '1.5px solid rgba(230,58,46,.35)', padding: '4px 8px' }}>
                  <span style={{ fontSize: 12 }}>🔥</span>
                  <span style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: 14, fontWeight: 900, color: '#e63a2e' }}>{gameState.streak}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(26,38,34,.07)', border: '1.5px solid rgba(26,38,34,.2)', padding: '4px 8px' }}>
                  <span style={{ fontFamily: "'VT323', monospace", fontSize: 14, color: '#1a2622', letterSpacing: '0.08em' }}>{gameState.xp} XP</span>
                </div>
                <button
                  onClick={() => setShowProfile(true)}
                  style={{ width: 36, height: 36, background: avBg, border: '2px solid #1a2622', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                  aria-label="Open profile"
                >
                  <span style={{ fontSize: 12, fontWeight: 700, color: avFg, fontFamily: "'Big Shoulders Display', sans-serif" }}>
                    {initials(profile.name)}
                  </span>
                </button>
              </div>
            </div>

            {/* Tab strip */}
            <nav className="header-tabs" aria-label="Main navigation">
              {TABS.map(({ id, label, icon }) => (
                <button
                  key={id}
                  className={`header-tab${tab === id ? " active" : ""}`}
                  onClick={() => setTab(id)}
                  aria-current={tab === id ? "page" : undefined}
                >
                  <Icon name={icon} size={13} color={tab === id ? "#e63a2e" : "rgba(44,72,56,.5)"} />
                  {label}
                </button>
              ))}
            </nav>
          </div>
        </header>

        {/* Screens */}
        {tab === "challenges" && <ChallengesScreen gameState={enrichedGameState} db={db} profile={profile} />}
        {tab === "skills"     && <SkillsScreen     gameState={enrichedGameState} />}
        {tab === "history"    && <HistoryScreen     db={db} />}
      </div>

      {/* Bottom tab bar */}
      <nav className="tab-bar" aria-label="Tab bar">
        {TABS.map(({ id, label, icon }) => (
          <button
            key={id}
            className={`tab-btn${tab === id ? " active" : ""}`}
            onClick={() => setTab(id)}
            aria-label={label}
            aria-current={tab === id ? "page" : undefined}
          >
            <Icon name={icon} size={20} color={tab === id ? "#e63a2e" : "rgba(44,72,56,.6)"} strokeWidth={tab === id ? 2.2 : 1.75} />
            <span className="tab-label">{label}</span>
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
