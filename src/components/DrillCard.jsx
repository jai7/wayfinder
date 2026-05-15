import { useState } from "react";
import Icon from "./Icon.jsx";

const DRILL_SYMBOLS = ['§', '◎', '▤', '✦', '◉', '↺', 'Π'];

export default function DrillCard({ drill, index = 1, doneToday, onComplete }) {
  const [open, setOpen]   = useState(false);
  const [notes, setNotes] = useState("");
  const sym = DRILL_SYMBOLS[(index - 1) % DRILL_SYMBOLS.length];

  function handleComplete() {
    onComplete(drill, notes);
    setNotes("");
    setOpen(false);
  }

  return (
    <>
      {/* Ledger row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '28px 38px 1fr 70px 90px',
          alignItems: 'center',
          gap: 12,
          padding: '11px 0',
          borderBottom: '1px dashed rgba(44,72,56,.7)',
          opacity: doneToday ? 0.45 : 1,
          cursor: doneToday ? 'default' : 'pointer',
        }}
        onClick={() => !doneToday && setOpen(true)}
        role="button"
        tabIndex={doneToday ? -1 : 0}
        onKeyDown={e => e.key === 'Enter' && !doneToday && setOpen(true)}
        aria-label={`${drill.title} drill`}
      >
        {/* Index number */}
        <div style={{ fontFamily: "'VT323', monospace", fontSize: 16, letterSpacing: '0.06em', color: '#2c4838' }}>
          {String(index).padStart(2, '0')}.
        </div>

        {/* Symbol pin */}
        <div className="pin" style={{ width: 36, height: 36, fontSize: 17 }}>
          {doneToday ? '✓' : sym}
        </div>

        {/* Name + description */}
        <div>
          <div style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 18, lineHeight: 1 }}>
            {drill.title.toUpperCase()}
          </div>
          <div style={{ fontFamily: "'VT323', monospace", fontSize: 13, color: '#2c4838', marginTop: 2, letterSpacing: '0.04em' }}>
            {drill.description}
          </div>
        </div>

        {/* Duration */}
        <div style={{ fontFamily: "'VT323', monospace", fontSize: 14, color: '#2c4838', letterSpacing: '0.06em' }}>
          {drill.duration}
        </div>

        {/* XP chip */}
        <div style={{ textAlign: 'right' }}>
          <span className={`wf-chip ${doneToday ? 'wf-chip-cream' : 'wf-chip-ink'}`}>
            +{drill.xp} XP
          </span>
        </div>
      </div>

      {/* Detail bottom sheet */}
      {open && (
        <div className="overlay" onClick={() => setOpen(false)}>
          <div className="sheet" onClick={e => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="sheet-body" style={{ paddingBottom: 24 }}>

              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <div className="lbl">DRILL HEIGHTS · DAILY PRACTICE</div>
                  <div style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 24, lineHeight: 1, marginTop: 4 }}>
                    {drill.title.toUpperCase()}
                  </div>
                </div>
                <button className="btn-icon" onClick={() => setOpen(false)} aria-label="Close">
                  <Icon name="x" size={18} />
                </button>
              </div>

              {/* Meta chips */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                <span className="wf-chip wf-chip-cream">⏱ {drill.duration}</span>
                <span className="wf-chip wf-chip-cream">{drill.category.toUpperCase()}</span>
                <span className="wf-chip wf-chip-ink">+{drill.xp} XP</span>
              </div>

              {/* Description */}
              <p style={{ fontSize: 15, color: '#2c4838', lineHeight: 1.6, marginBottom: 16 }}>
                {drill.description}
              </p>

              {/* Reflection */}
              <label style={{
                fontFamily: "'Big Shoulders Display', sans-serif",
                fontSize: 12, fontWeight: 800, letterSpacing: '0.15em',
                textTransform: 'uppercase', display: 'block', marginBottom: 8,
                color: 'rgba(26,38,34,.65)',
              }}>
                Quick Reflection (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="What did you notice? Any surprises?"
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />

              <button className="btn-primary" style={{ marginTop: 16 }} onClick={handleComplete}>
                Complete Drill · +{drill.xp} XP
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
