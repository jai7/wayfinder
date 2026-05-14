import { useState } from "react";
import Icon from "../components/Icon.jsx";
import Dots from "../components/Dots.jsx";
import DrillCard from "../components/DrillCard.jsx";
import ChallengeSheet from "../components/ChallengeSheet.jsx";
import { CHALLENGES, ICON_COLORS } from "../data/challenges.js";
import { getDailyDrills } from "../data/drills.js";
import { todayKey } from "../utils/dates.js";

export default function ChallengesScreen({ gameState, db }) {
  const [filter, setFilter]   = useState("all");
  const [active, setActive]   = useState(null);
  const dailyDrills           = getDailyDrills();
  const drillsDoneIds         = gameState.drillsToday.date === todayKey()
    ? gameState.drillsToday.ids : [];
  const drillsDoneCount       = drillsDoneIds.length;
  const allDrillsDone         = drillsDoneCount >= dailyDrills.length;
  const filtered              = filter === "all"
    ? CHALLENGES : CHALLENGES.filter(c => c.mode === filter);

  async function handleCompleteChallenge(challenge, reflection) {
    gameState.completeChallenge(challenge);
    await Promise.all([
      db.logChallengeActivity({ challenge }),
      reflection.trim() ? db.addChallengeReflection({ challenge, text: reflection }) : Promise.resolve(),
    ]);
  }

  async function handleCompleteDrill(drill, note) {
    gameState.completeDrill(drill);
    await Promise.all([
      db.logDrillActivity({ drill }),
      note.trim() ? db.addDrillReflection({ drill, text: note }) : Promise.resolve(),
    ]);
  }

  return (
    <div className="page-body">

      {/* ── Stats row ── */}
      <div className="card stat-row" style={{ marginBottom: 14 }}>
        <div className="stat-cell">
          <span className="stat-value">{gameState.done.length}</span>
          <span className="stat-label">Done</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-cell">
          <span className="stat-value">{CHALLENGES.length - gameState.done.length}</span>
          <span className="stat-label">Left</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-cell">
          <span className="stat-value">{gameState.streak}</span>
          <span className="stat-label">Streak</span>
        </div>
      </div>

      {/* ── Daily Practice heading ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: "#1C1C1E", letterSpacing: "-0.01em" }}>Daily Practice</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", gap: 4 }}>
            {dailyDrills.map(d => (
              <div key={d.id} style={{ width: 8, height: 8, borderRadius: "50%", background: drillsDoneIds.includes(d.id) ? "#34C759" : "#E5E5EA", transition: "background 0.3s" }} />
            ))}
          </div>
          <span style={{ fontSize: 12, color: "#8E8E93" }}>{drillsDoneCount}/{dailyDrills.length} today</span>
        </div>
      </div>

      {/* Drills done banner or drill cards */}
      {allDrillsDone ? (
        <div style={{ background: "#E8F9EE", border: "1px solid #D1F5DC", borderRadius: 16, padding: "16px 18px", marginBottom: 14, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 13, background: "#34C759", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon name="check" size={20} color="#fff" strokeWidth={2.5} />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#1A7A3A", letterSpacing: "-0.01em" }}>All drills done for today!</p>
            <p style={{ fontSize: 13, color: "#4CAF50", marginTop: 2 }}>New drills reset tomorrow. Keep the streak going.</p>
          </div>
        </div>
      ) : (
        <div className="card" style={{ marginBottom: 14 }}>
          <div style={{ padding: "10px 16px 0", display: "flex", alignItems: "center", gap: 6 }}>
            <Icon name="repeat" size={13} color="#34C759" />
            <span style={{ fontSize: 11, fontWeight: 600, color: "#34C759", textTransform: "uppercase", letterSpacing: "0.06em" }}>Resets daily</span>
          </div>
          {dailyDrills.map(drill => (
            <DrillCard
              key={drill.id}
              drill={drill}
              doneToday={drillsDoneIds.includes(drill.id)}
              onComplete={handleCompleteDrill}
            />
          ))}
        </div>
      )}

      {/* ── Curriculum heading ── */}
      <div style={{ marginBottom: 4 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: "#1C1C1E", letterSpacing: "-0.01em" }}>Skill Curriculum</h2>
        <p style={{ fontSize: 13, color: "#8E8E93", marginTop: 3, letterSpacing: "-0.01em" }}>Complete once — permanently unlocked.</p>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "10px 0 4px", marginBottom: 10, scrollbarWidth: "none" }}>
        {[["all","All"],["home","🏘 Home"],["explorer","✈️ Explorer"],["gym","🧠 Gym"]].map(([id, label]) => (
          <button key={id} className={`filter-pill${filter === id ? " active" : ""}`} onClick={() => setFilter(id)}>
            {label}
          </button>
        ))}
      </div>

      {/* Challenge list */}
      <div className="card">
        {filtered.map(ch => {
          const isDone  = gameState.done.includes(ch.id);
          const [bg, fg]= ICON_COLORS[ch.icon] ?? ["#F5F5F5","#666"];
          return (
            <div
              key={ch.id}
              className="row"
              style={{ opacity: isDone ? 0.42 : 1 }}
              onClick={() => !isDone && setActive(ch)}
              role="button"
              tabIndex={isDone ? -1 : 0}
              onKeyDown={e => e.key === "Enter" && !isDone && setActive(ch)}
            >
              <div className="bubble" style={{ background: bg }}>
                <Icon name={ch.icon} size={22} color={fg} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: "#1C1C1E", letterSpacing: "-0.01em" }}>{ch.title}</span>
                  {isDone && (
                    <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#34C759", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon name="check" size={11} color="#fff" strokeWidth={3} />
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 12, color: "#8E8E93" }}>{ch.duration}</span>
                  <span style={{ color: "#E5E5EA" }}>·</span>
                  <span style={{ fontSize: 12, color: "#007AFF", fontWeight: 500 }}>+{ch.xp} XP</span>
                  <span style={{ color: "#E5E5EA" }}>·</span>
                  <Dots n={ch.difficulty} />
                </div>
              </div>
              {!isDone && <Icon name="chevronR" size={16} color="#C7C7CC" />}
            </div>
          );
        })}
      </div>

      {/* Challenge detail sheet */}
      {active && (
        <ChallengeSheet
          challenge={active}
          onComplete={(ch, reflection) => { handleCompleteChallenge(ch, reflection); setActive(null); }}
          onClose={() => setActive(null)}
        />
      )}
    </div>
  );
}
