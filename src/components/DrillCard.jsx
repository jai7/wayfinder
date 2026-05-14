import { useState } from "react";
import Icon from "./Icon.jsx";
import { ICON_COLORS } from "../data/challenges.js";

export default function DrillCard({ drill, doneToday, onComplete }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");

  const [bg, fg] = ICON_COLORS[drill.icon] ?? ["#F5F5F5", "#666"];

  function handleComplete() {
    onComplete(drill, note);
    setOpen(false);
    setNote("");
  }

  return (
    <>
      {/* ── Row ── */}
      <div
        className="row"
        style={{ opacity: doneToday ? 0.42 : 1 }}
        onClick={() => !doneToday && setOpen(true)}
        role="button"
        tabIndex={doneToday ? -1 : 0}
        onKeyDown={e => e.key === "Enter" && !doneToday && setOpen(true)}
      >
        <div className="bubble" style={{ background: bg }}>
          <Icon name={drill.icon} size={20} color={fg} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#1C1C1E", letterSpacing: "-0.01em" }}>
              {drill.title}
            </span>
            {doneToday && (
              <div style={{ width: 17, height: 17, borderRadius: "50%", background: "#34C759", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon name="check" size={10} color="#fff" strokeWidth={3} />
              </div>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: "#8E8E93" }}>{drill.duration}</span>
            <span style={{ color: "#E5E5EA" }}>·</span>
            <span style={{ fontSize: 12, color: "#34C759", fontWeight: 500 }}>+{drill.xp} XP</span>
          </div>
        </div>

        {!doneToday && <Icon name="chevronR" size={16} color="#C7C7CC" />}
      </div>

      {/* ── Bottom sheet ── */}
      {open && (
        <div className="overlay" onClick={() => { setOpen(false); setNote(""); }}>
          <div className="sheet" onClick={e => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="sheet-body">
              {/* Header */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
                <div className="bubble" style={{ background: bg, width: 52, height: 52, borderRadius: 16 }}>
                  <Icon name={drill.icon} size={26} color={fg} />
                </div>
                <button className="btn-icon" onClick={() => { setOpen(false); setNote(""); }} aria-label="Close">
                  <Icon name="x" size={15} color="#3C3C43" />
                </button>
              </div>

              {/* Badges */}
              <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                <span className="chip green">Daily Practice</span>
                <span className="chip grey">Resets tomorrow</span>
              </div>

              <h2 style={{ fontSize: 21, fontWeight: 700, color: "#1C1C1E", letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 12 }}>
                {drill.title}
              </h2>
              <p style={{ fontSize: 15, color: "#3C3C43", lineHeight: 1.65, letterSpacing: "-0.01em", marginBottom: 20 }}>
                {drill.description}
              </p>

              {/* Meta */}
              <div className="meta-row">
                <div className="meta-chip">⏱ {drill.duration}</div>
                <div className="meta-chip green">⚡ +{drill.xp} XP</div>
              </div>

              {/* Reflection */}
              <p style={{ fontSize: 14, fontWeight: 600, color: "#1C1C1E", marginBottom: 4, letterSpacing: "-0.01em" }}>
                Quick reflection
              </p>
              <p style={{ fontSize: 12, color: "#8E8E93", marginBottom: 10 }}>
                Optional — short notes build long-term spatial memory.
              </p>
              <textarea
                rows={2}
                placeholder="How did it go?"
                value={note}
                onChange={e => setNote(e.target.value)}
                style={{ marginBottom: 16 }}
              />

              <button className="btn-primary green" onClick={handleComplete}>
                Complete Drill · +{drill.xp} XP
              </button>
              <div style={{ height: 8 }} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
