import { useState, useEffect, useRef } from "react";
import Icon from "./Icon.jsx";
import { AVATAR_COLORS } from "../data/levels.js";
import { initials } from "../utils/levels.js";

export default function Onboarding({ onComplete }) {
  const [step, setStep]     = useState(0);
  const [name, setName]     = useState("");
  const [avatarIdx, setIdx] = useState(0);
  const [err, setErr]       = useState("");
  const inputRef            = useRef(null);

  useEffect(() => {
    if (step === 1) {
      const t = setTimeout(() => inputRef.current?.focus(), 300);
      return () => clearTimeout(t);
    }
  }, [step]);

  function submitName() {
    const t = name.trim();
    if (!t || t.length < 2) { setErr("MUST BE AT LEAST 2 CHARACTERS"); return; }
    setErr("");
    setStep(2);
  }

  function finish() {
    onComplete({
      id:        `p_${Date.now()}`,
      name:      name.trim(),
      avatarIdx,
      createdAt: Date.now(),
    });
  }

  const [bg, fg] = AVATAR_COLORS[avatarIdx];

  return (
    <div className="ob-wrap pop-paper">
      <div className="ob-inner">

        {/* ── Welcome ── */}
        {step === 0 && (
          <div style={{ textAlign: 'center' }}>
            {/* Vintage atlas header */}
            <div style={{ fontFamily: "'VT323', monospace", fontSize: 13, letterSpacing: '0.15em', color: 'rgba(26,38,34,.5)', marginBottom: 8 }}>
              VOL. I · 1986 EDITION · FIRST EDITION
            </div>
            <div style={{
              fontFamily: "'Bungee', sans-serif",
              fontSize: 56,
              lineHeight: 0.9,
              textShadow: '2px 2px 0 rgba(80,180,210,.6)',
              marginBottom: 16,
              color: '#1a2622',
            }}>
              WAYFINDER
            </div>
            <div style={{ border: '2.5px solid #1a2622', padding: '14px 18px', marginBottom: 24, background: '#fff9e2', textAlign: 'left' }}>
              <p style={{ fontSize: 15, color: '#2c4838', lineHeight: 1.65 }}>
                Train your brain to navigate the world without GPS. Your sense of direction is a skill — let's build it.
              </p>
            </div>
            <button className="ob-btn" onClick={() => setStep(1)}>Get Started →</button>
            <div style={{ fontFamily: "'VT323', monospace", fontSize: 13, color: 'rgba(44,72,56,.5)', letterSpacing: '0.08em', marginTop: 16 }}>
              R.S. WAYFINDER &amp; CO. · CHICAGO · 1986
            </div>
          </div>
        )}

        {/* ── Name ── */}
        {step === 1 && (
          <div>
            <button className="ob-back" onClick={() => setStep(0)}>
              ← BACK
            </button>
            <div className="lbl" style={{ marginBottom: 6 }}>STEP 1 OF 2 · OBSERVER REGISTRATION</div>
            <div className="ob-title">What's your name?</div>
            <p className="ob-sub">Used for your profile. Stored only on this device.</p>
            <input
              ref={inputRef}
              type="text"
              placeholder="YOUR NAME"
              value={name}
              maxLength={40}
              onChange={e => { setName(e.target.value); setErr(""); }}
              onKeyDown={e => e.key === "Enter" && submitName()}
            />
            {err && <div className="ob-error">{err}</div>}
            <button className="ob-btn" style={{ marginTop: 16 }} onClick={submitName}>Continue →</button>
          </div>
        )}

        {/* ── Avatar colour ── */}
        {step === 2 && (
          <div>
            <button className="ob-back" onClick={() => setStep(1)}>
              ← BACK
            </button>
            <div className="lbl" style={{ marginBottom: 6 }}>STEP 2 OF 2 · ASSIGN MARKER COLOUR</div>
            <div className="ob-title">Pick your colour</div>
            <p className="ob-sub">This appears as your map marker throughout the app.</p>

            {/* Avatar preview */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
              <div style={{
                width: 80, height: 80,
                background: bg,
                border: '3px solid #1a2622',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s',
              }}>
                <span style={{
                  fontFamily: "'Big Shoulders Display', sans-serif",
                  fontSize: 28, fontWeight: 900, color: fg,
                }}>
                  {initials(name) || '?'}
                </span>
              </div>
            </div>

            {/* Color chips */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
              {AVATAR_COLORS.map(([cb, cf], i) => (
                <button
                  key={i}
                  className={`avatar-chip${avatarIdx === i ? ' selected' : ''}`}
                  style={{
                    background: cb,
                    border: `2px solid ${avatarIdx === i ? '#e63a2e' : '#1a2622'}`,
                    width: 48, height: 48,
                  }}
                  onClick={() => setIdx(i)}
                  aria-label={`Colour option ${i + 1}`}
                >
                  <span style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: 14, fontWeight: 900, color: cf }}>
                    {initials(name) || '?'}
                  </span>
                </button>
              ))}
            </div>

            <button className="ob-btn" onClick={finish}>Start Navigating →</button>
          </div>
        )}

      </div>
    </div>
  );
}
