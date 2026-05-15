import { useState } from "react";
import Icon from "./Icon.jsx";

export default function ChallengeSheet({ challenge, onComplete, onClose }) {
  const [reflection, setReflection] = useState("");

  function handleComplete() {
    onComplete(challenge, reflection);
    setReflection("");
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-body" style={{ paddingBottom: 24 }}>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <div className="lbl">CURRICULUM CITY · {challenge.mode.toUpperCase()}</div>
              <div style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 24, lineHeight: 1, marginTop: 4 }}>
                {challenge.title.toUpperCase()}
              </div>
            </div>
            <button className="btn-icon" onClick={onClose} aria-label="Close">
              <Icon name="x" size={18} />
            </button>
          </div>

          {/* Category */}
          <div className="lbl" style={{ marginBottom: 10 }}>{challenge.category}</div>

          {/* Meta chips */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            <span className="wf-chip wf-chip-cream">⏱ {challenge.duration}</span>
            <span className="wf-chip wf-chip-ink">+{challenge.xp} XP</span>
            <span className="wf-chip wf-chip-cream">
              {'●'.repeat(challenge.difficulty)}{'○'.repeat(3 - challenge.difficulty)}
            </span>
          </div>

          {/* Description */}
          <p style={{ fontSize: 15, color: '#2c4838', lineHeight: 1.65, marginBottom: 16 }}>
            {challenge.description}
          </p>

          {/* Tip */}
          {challenge.tip && (
            <div style={{
              background: '#fff9e2', border: '2px solid #1a2622',
              padding: '10px 14px', marginBottom: 16,
            }}>
              <div className="lbl" style={{ marginBottom: 4 }}>✦ TIP</div>
              <p style={{ fontSize: 14, color: '#2c4838', lineHeight: 1.55 }}>{challenge.tip}</p>
            </div>
          )}

          {/* Reflection prompt */}
          <label style={{
            fontFamily: "'Big Shoulders Display', sans-serif",
            fontSize: 12, fontWeight: 800, letterSpacing: '0.15em',
            textTransform: 'uppercase', display: 'block', marginBottom: 6,
            color: 'rgba(26,38,34,.65)',
          }}>
            {challenge.prompt || 'How did it go?'}
          </label>
          <p style={{ fontFamily: "'VT323', monospace", fontSize: 13, color: 'rgba(44,72,56,.6)', letterSpacing: '0.04em', marginBottom: 8 }}>
            Optional — saved to your journal in History.
          </p>
          <textarea
            rows={3}
            placeholder="Write your reflection…"
            value={reflection}
            onChange={e => setReflection(e.target.value)}
          />

          <button className="btn-primary" style={{ marginTop: 16 }} onClick={handleComplete}>
            Mark as Complete · +{challenge.xp} XP
          </button>
        </div>
      </div>
    </div>
  );
}
