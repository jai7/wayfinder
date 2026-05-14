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
        <div className="sheet-body">

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <h2 style={{ fontSize: 17, fontWeight: 600, color: "#1C1C1E", letterSpacing: "-0.01em" }}>Profile</h2>
            <button className="btn-icon" onClick={onClose} aria-label="Close">
              <Icon name="x" size={15} color="#3C3C43" />
            </button>
          </div>

          {!editing ? (
            <>
              {/* Avatar row */}
              <div style={{ display: "flex", alignItems: "center", gap: 16, padding: 16, background: "#F9F9F9", borderRadius: 16, marginBottom: 20 }}>
                <div style={{ width: 60, height: 60, borderRadius: 20, background: avBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 22, fontWeight: 700, color: avFg }}>{initials(profile.name)}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#1C1C1E", letterSpacing: "-0.02em", marginBottom: 2 }}>{profile.name}</div>
                  <div style={{ fontSize: 13, color: "#8E8E93" }}>
                    Since {new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </div>
                </div>
                <button
                  onClick={() => setEditing(true)}
                  style={{ background: "#E8F4FF", border: "none", borderRadius: 10, padding: "7px 13px", color: "#007AFF", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}
                >
                  <Icon name="edit" size={13} color="#007AFF" /> Edit
                </button>
              </div>

              {/* Stats grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                {[
                  ["Total XP",     `${stats.xp} XP`,       "#007AFF", "#E8F4FF"],
                  ["Challenges",   `${stats.done} done`,    "#34C759", "#E8F9EE"],
                  ["Day Streak",   `${stats.streak} days`,  "#FF9500", "#FFF3E0"],
                  ["Daily Drills", `${stats.drills} total`, "#AF52DE", "#F3E5F5"],
                ].map(([label, value, color, bg]) => (
                  <div key={label} style={{ background: bg, borderRadius: 14, padding: "14px 16px" }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: "#1C1C1E", letterSpacing: "-0.02em" }}>{value}</div>
                  </div>
                ))}
              </div>

              {/* Storage note */}
              <div style={{ background: "#F9F9F9", borderRadius: 12, padding: "12px 14px", marginBottom: 20, display: "flex", gap: 10, alignItems: "flex-start" }}>
                <Icon name="book" size={16} color="#8E8E93" strokeWidth={2} />
                <p style={{ fontSize: 13, color: "#6C6C70", lineHeight: 1.6 }}>
                  Your journal and activity history are stored privately in your browser's IndexedDB — they never leave your device.
                </p>
              </div>

              {/* Reset */}
              {!confirmReset ? (
                <button
                  onClick={() => setConfirm(true)}
                  style={{ width: "100%", padding: 13, border: "1.5px solid #FFE5E5", borderRadius: 14, background: "#FFF5F5", color: "#FF3B30", fontSize: 15, fontWeight: 600, cursor: "pointer", letterSpacing: "-0.01em" }}
                >
                  Reset All Progress
                </button>
              ) : (
                <div style={{ background: "#FFF5F5", border: "1.5px solid #FFE5E5", borderRadius: 14, padding: 16 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#FF3B30", marginBottom: 6 }}>Are you sure?</p>
                  <p style={{ fontSize: 13, color: "#6C6C70", marginBottom: 14 }}>
                    This deletes all XP, streaks, completed challenges, drills, and journal entries. Cannot be undone.
                  </p>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={onReset} style={{ flex: 1, padding: 11, border: "none", borderRadius: 10, background: "#FF3B30", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Yes, Reset</button>
                    <button onClick={() => setConfirm(false)} className="btn-ghost" style={{ flex: 1, padding: 11, borderRadius: 10, fontSize: 14 }}>Cancel</button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Edit form */}
              <p style={{ fontSize: 14, fontWeight: 600, color: "#1C1C1E", marginBottom: 6 }}>Name</p>
              <input
                type="text"
                value={name}
                maxLength={40}
                onChange={e => setName(e.target.value)}
                style={{ marginBottom: 20 }}
              />

              <p style={{ fontSize: 14, fontWeight: 600, color: "#1C1C1E", marginBottom: 16 }}>Avatar Colour</p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 28 }}>
                {AVATAR_COLORS.map(([cb, cf], i) => (
                  <button
                    key={i}
                    style={{
                      width: 52, height: 52, borderRadius: 16,
                      background: cb, border: `2.5px solid ${avatarIdx === i ? "#007AFF" : "transparent"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer",
                      transform: avatarIdx === i ? "scale(1.08)" : "scale(1)",
                      transition: "transform 0.14s",
                    }}
                    onClick={() => setIdx(i)}
                    aria-label={`Colour ${i + 1}`}
                  >
                    <span style={{ fontSize: 14, fontWeight: 700, color: cf }}>{initials(name) || "?"}</span>
                  </button>
                ))}
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn-primary" style={{ flex: 2 }} onClick={save}>Save Changes</button>
                <button className="btn-ghost" style={{ flex: 1 }} onClick={cancelEdit}>Cancel</button>
              </div>
            </>
          )}

          <div style={{ height: 8 }} />
        </div>
      </div>
    </div>
  );
}
