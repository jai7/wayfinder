import { useState } from "react";
import Icon from "./Icon.jsx";
import Dots from "./Dots.jsx";
import { ICON_COLORS } from "../data/challenges.js";

export default function ChallengeSheet({ challenge, onComplete, onClose }) {
  const [reflection, setReflection] = useState("");
  const [bg, fg] = ICON_COLORS[challenge.icon] ?? ["#F5F5F5", "#666"];

  function handleComplete() {
    onComplete(challenge, reflection);
    setReflection("");
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-body">

          {/* Icon + close */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
            <div className="bubble" style={{ background: bg, width: 52, height: 52, borderRadius: 16 }}>
              <Icon name={challenge.icon} size={26} color={fg} />
            </div>
            <button className="btn-icon" onClick={onClose} aria-label="Close">
              <Icon name="x" size={15} color="#3C3C43" />
            </button>
          </div>

          {/* Badges */}
          <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
            <span className="chip blue">Curriculum</span>
            <span className="chip grey">Permanent</span>
          </div>

          {/* Category + title */}
          <p style={{ fontSize: 11, fontWeight: 600, color: "#8E8E93", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
            {challenge.category}
          </p>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1C1C1E", letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 12 }}>
            {challenge.title}
          </h2>
          <p style={{ fontSize: 15, color: "#3C3C43", lineHeight: 1.65, letterSpacing: "-0.01em", marginBottom: 20 }}>
            {challenge.description}
          </p>

          {/* Meta chips */}
          <div className="meta-row">
            <div className="meta-chip">⏱ {challenge.duration}</div>
            <div className="meta-chip blue">⚡ +{challenge.xp} XP</div>
            <div className="meta-chip" style={{ gap: 6 }}>
              <span style={{ fontSize: 12, color: "#8E8E93" }}>Difficulty</span>
              <Dots n={challenge.difficulty} />
            </div>
          </div>

          {/* Tip */}
          <div className="tip-box">
            <p className="tip-label">Tip</p>
            <p className="tip-text">{challenge.tip}</p>
          </div>

          {/* Reflection */}
          <p style={{ fontSize: 14, fontWeight: 600, color: "#1C1C1E", marginBottom: 4, letterSpacing: "-0.01em" }}>
            {challenge.prompt}
          </p>
          <p style={{ fontSize: 12, color: "#8E8E93", marginBottom: 10 }}>
            Optional — your reflection is saved to Notes in History.
          </p>
          <textarea
            rows={3}
            placeholder="Write your reflection…"
            value={reflection}
            onChange={e => setReflection(e.target.value)}
            style={{ marginBottom: 16 }}
          />

          <button className="btn-primary" onClick={handleComplete}>
            Mark as Complete · +{challenge.xp} XP
          </button>
          <div style={{ height: 8 }} />
        </div>
      </div>
    </div>
  );
}
