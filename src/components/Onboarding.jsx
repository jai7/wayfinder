import { useState, useEffect, useRef } from "react";
import Icon from "./Icon.jsx";
import { AVATAR_COLORS } from "../data/levels.js";
import { initials } from "../utils/levels.js";

export default function Onboarding({ onComplete }) {
  const [step, setStep]     = useState(0); // 0=welcome, 1=name, 2=avatar
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
    if (!t || t.length < 2) { setErr("Please enter at least 2 characters"); return; }
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
    <div className="ob-wrap">
      <div className="ob-inner">

        {/* ── Welcome ── */}
        {step === 0 && (
          <div className="slide-in" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 64, marginBottom: 24 }}>🧭</div>
            <div className="ob-title" style={{ textAlign: "center" }}>Welcome to Wayfinder</div>
            <p style={{ fontSize: 16, color: "#8E8E93", lineHeight: 1.65, marginBottom: 48, textAlign: "center" }}>
              Train your brain to navigate the world without GPS.<br />
              Your sense of direction is a skill — let's build it.
            </p>
            <button className="ob-btn" onClick={() => setStep(1)}>Get Started</button>
          </div>
        )}

        {/* ── Name ── */}
        {step === 1 && (
          <div className="slide-in">
            <button className="ob-back" onClick={() => setStep(0)}>
              <Icon name="chevronL" size={18} color="#007AFF" /> Back
            </button>
            <div className="ob-title">What's your name?</div>
            <p className="ob-sub">We'll use this to personalise your experience.</p>
            <input
              ref={inputRef}
              type="text"
              placeholder="Your name"
              value={name}
              maxLength={40}
              onChange={e => { setName(e.target.value); setErr(""); }}
              onKeyDown={e => e.key === "Enter" && submitName()}
            />
            {err && (
              <p style={{ fontSize: 13, color: "#FF3B30", marginTop: 8, letterSpacing: "-0.01em" }}>{err}</p>
            )}
            <button className="ob-btn" style={{ marginTop: 20 }} onClick={submitName}>Continue</button>
          </div>
        )}

        {/* ── Avatar colour ── */}
        {step === 2 && (
          <div className="slide-in">
            <button className="ob-back" onClick={() => setStep(1)}>
              <Icon name="chevronL" size={18} color="#007AFF" /> Back
            </button>
            <div className="ob-title">Pick your colour</div>
            <p className="ob-sub">This appears as your avatar throughout the app.</p>

            {/* Preview */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
              <div style={{
                width: 88, height: 88, borderRadius: 28,
                background: bg,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 20px rgba(0,0,0,.1)",
                transition: "background 0.2s",
              }}>
                <span style={{ fontSize: 32, fontWeight: 700, color: fg, letterSpacing: "-0.02em" }}>
                  {initials(name) || "?"}
                </span>
              </div>
            </div>

            {/* Chips */}
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 36 }}>
              {AVATAR_COLORS.map(([cb, cf], i) => (
                <button
                  key={i}
                  className={`avatar-chip${avatarIdx === i ? " selected" : ""}`}
                  style={{ background: cb, border: `2.5px solid ${avatarIdx === i ? "#007AFF" : "transparent"}` }}
                  onClick={() => setIdx(i)}
                  aria-label={`Colour option ${i + 1}`}
                >
                  <span style={{ fontSize: 16, fontWeight: 700, color: cf }}>{initials(name) || "?"}</span>
                </button>
              ))}
            </div>

            <button className="ob-btn" onClick={finish}>Start Navigating</button>
          </div>
        )}

      </div>
    </div>
  );
}
