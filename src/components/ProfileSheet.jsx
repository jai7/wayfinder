import { useState } from "react";
import Icon from "./Icon.jsx";
import { AVATAR_COLORS } from "../data/levels.js";
import { initials } from "../utils/levels.js";

export default function ProfileSheet({ profile, stats, onClose, onUpdate, onReset }) {
  const [editing, setEditing]   = useState(false);
  const [name, setName]         = useState(profile.name);
  const [avatarIdx, setIdx]     = useState(profile.avatarIdx);
  const [confirmReset, setConfirm] = useState(false);

  function save() {
    if (!name.trim() || name.trim().length < 2) return;
    onUpdate({ ...profile, name: name.trim(), avatarIdx });
  }

  function cancelEdit() {
    setEditing(false);
    setName(profile.name);
    setIdx(profile.avatarIdx);
  }

  const [avBg, avFg] = AVATAR_COLORS[profile.avatarIdx ?? 0];

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-body" style={{ paddingBottom: 24 }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div className="lbl">OBSERVER RECORD</div>
              <div style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 24, lineHeight: 1, marginTop: 2 }}>
                PROFILE
              </div>
            </div>
            <button className="btn-icon" onClick={onClose} aria-label="Close">
              <Icon name="x" size={18} />
            </button>
          </div>
          <hr style={{ borderTop: '2px solid #1a2622', borderBottom: 'none', marginBottom: 16 }} />

          {!editing ? (
            <>
              {/* Avatar row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', background: '#fff9e2', border: '2px solid #1a2622', marginBottom: 16 }}>
                <div style={{ width: 52, height: 52, background: avBg, border: '2px solid #1a2622', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: 18, fontWeight: 900, color: avFg }}>
                    {initials(profile.name)}
                  </span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 20, lineHeight: 1, letterSpacing: '0.02em' }}>
                    {profile.name.toUpperCase()}
                  </div>
                  <div style={{ fontFamily: "'VT323', monospace", fontSize: 13, color: '#2c4838', letterSpacing: '0.08em', marginTop: 2 }}>
                    SINCE {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()}
                  </div>
                </div>
                <button
                  onClick={() => setEditing(true)}
                  style={{
                    border: '2px solid #1a2622', background: '#fdf6df', padding: '6px 12px',
                    display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer',
                    fontFamily: "'Big Shoulders Display', sans-serif",
                    fontSize: 12, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase',
                  }}
                >
                  <Icon name="edit" size={12} /> EDIT
                </button>
              </div>

              {/* Stats grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, marginBottom: 16 }}>
                {[
                  { label: 'TOTAL XP',     value: `${stats.xp}`,         bar: '#9fd6d8' },
                  { label: 'CHALLENGES',   value: `${stats.done} DONE`,   bar: '#f0a6b5' },
                  { label: 'DAY STREAK',   value: `${stats.streak} DAYS`, bar: '#f4dc7c' },
                  { label: 'DAILY DRILLS', value: `${stats.drills} TOTAL`,bar: '#9cd6a5' },
                ].map(({ label, value, bar }, i) => (
                  <div
                    key={label}
                    style={{
                      padding: '12px 14px',
                      border: '1px solid #1a2622',
                      borderTop: i < 2 ? '2px solid #1a2622' : '1px solid #1a2622',
                      borderLeft: i % 2 === 0 ? '2px solid #1a2622' : '1px solid #1a2622',
                      borderRight: '2px solid #1a2622',
                      borderBottom: i >= 2 ? '2px solid #1a2622' : '1px solid #1a2622',
                      background: '#fff9e2',
                    }}
                  >
                    <div style={{ width: 20, height: 4, background: bar, marginBottom: 6 }} />
                    <div className="lbl" style={{ fontSize: 10, marginBottom: 4 }}>{label}</div>
                    <div style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 22, lineHeight: 1 }}>
                      {value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Storage note */}
              <div style={{ fontFamily: "'VT323', monospace", fontSize: 13, color: 'rgba(44,72,56,.6)', letterSpacing: '0.06em', lineHeight: 1.55, marginBottom: 16, padding: '8px 0', borderTop: '1px dashed rgba(44,72,56,.4)', borderBottom: '1px dashed rgba(44,72,56,.4)' }}>
                ★ ALL JOURNAL &amp; ACTIVITY DATA STORED PRIVATELY IN YOUR BROWSER'S INDEXEDDB — NEVER LEAVES YOUR DEVICE.
              </div>

              {/* Reset */}
              {!confirmReset ? (
                <button
                  onClick={() => setConfirm(true)}
                  style={{
                    width: '100%', padding: '12px',
                    border: '2px solid #e63a2e', background: 'rgba(230,58,46,.08)',
                    color: '#e63a2e', cursor: 'pointer',
                    fontFamily: "'Big Shoulders Display', sans-serif",
                    fontSize: 14, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase',
                  }}
                >
                  Reset All Progress
                </button>
              ) : (
                <div style={{ border: '2px solid #e63a2e', background: 'rgba(230,58,46,.06)', padding: 14 }}>
                  <div style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 16, color: '#e63a2e', marginBottom: 6 }}>
                    ARE YOU SURE?
                  </div>
                  <p style={{ fontFamily: "'VT323', monospace", fontSize: 14, color: '#2c4838', letterSpacing: '0.06em', lineHeight: 1.5, marginBottom: 12 }}>
                    THIS DELETES ALL XP, STREAKS, COMPLETED CHALLENGES, DRILLS, AND JOURNAL ENTRIES. CANNOT BE UNDONE.
                  </p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={onReset} className="btn-primary" style={{ flex: 2, background: '#e63a2e', borderColor: '#e63a2e' }}>YES, RESET</button>
                    <button onClick={() => setConfirm(false)} className="btn-ghost" style={{ flex: 1 }}>CANCEL</button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Edit form */}
              <div className="lbl" style={{ marginBottom: 6 }}>OBSERVER NAME</div>
              <input
                type="text"
                value={name}
                maxLength={40}
                onChange={e => setName(e.target.value)}
                style={{ marginBottom: 16 }}
              />

              <div className="lbl" style={{ marginBottom: 10 }}>MARKER COLOUR</div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
                {AVATAR_COLORS.map(([cb, cf], i) => (
                  <button
                    key={i}
                    style={{
                      width: 48, height: 48,
                      background: cb,
                      border: `2px solid ${avatarIdx === i ? '#e63a2e' : '#1a2622'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer',
                      transform: avatarIdx === i ? 'scale(1.1)' : 'scale(1)',
                      transition: 'transform 0.14s',
                    }}
                    onClick={() => setIdx(i)}
                    aria-label={`Colour ${i + 1}`}
                  >
                    <span style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: 13, fontWeight: 900, color: cf }}>
                      {initials(name) || '?'}
                    </span>
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-primary" style={{ flex: 2 }} onClick={save}>SAVE CHANGES</button>
                <button className="btn-ghost" style={{ flex: 1 }} onClick={cancelEdit}>CANCEL</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
