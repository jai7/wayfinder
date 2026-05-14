import { useState } from "react";
import Icon from "../components/Icon.jsx";
import { groupByDate } from "../utils/dates.js";

export default function HistoryScreen({ db }) {
  const [subTab, setSubTab] = useState("feed");
  const [note, setNote]     = useState("");

  const activityGroups = groupByDate(db.activity);

  async function saveNote() {
    if (!note.trim()) return;
    await db.addNote({ text: note });
    setNote("");
  }

  return (
    <div className="page-body">

      {/* ── Sub-tabs ── */}
      <div className="card sub-tabs" style={{ marginBottom: 14 }}>
        {[["feed","Activity Feed","activity"],["notes","My Notes","pencil"]].map(([id, label, icon]) => (
          <button
            key={id}
            className={`sub-tab${subTab === id ? " active" : ""}`}
            onClick={() => setSubTab(id)}
          >
            <Icon name={icon} size={13} color={subTab === id ? "#007AFF" : "#AEAEB2"} />
            {label}
          </button>
        ))}
      </div>

      {/* ── ACTIVITY FEED ── */}
      {subTab === "feed" && (
        <>
          {db.isLoading && (
            <p style={{ textAlign: "center", padding: "40px 0", color: "#8E8E93", fontSize: 14 }}>Loading activity…</p>
          )}

          {!db.isLoading && db.activity.length === 0 && (
            <div style={{ textAlign: "center", padding: "56px 0" }}>
              <Icon name="activity" size={40} color="#D1D1D6" />
              <p style={{ marginTop: 14, fontSize: 14, color: "#8E8E93", lineHeight: 1.6 }}>
                No activity yet.<br />Complete a challenge or daily drill to start your feed.
              </p>
            </div>
          )}

          {!db.isLoading && activityGroups.map(group => (
            <div key={group.label}>
              <p className="feed-group-label">{group.label}</p>
              <div className="card">
                {group.entries.map((entry, i) => {
                  const isDrill = entry.type === "drill";
                  return (
                    <div key={entry.id} className="feed-item">
                      {/* Timeline dot + connector */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 2 }}>
                        <div className="feed-dot" style={{ background: isDrill ? "#34C759" : "#007AFF" }} />
                        {i < group.entries.length - 1 && (
                          <div style={{ width: 1, flex: 1, background: "#F2F2F7", marginTop: 4 }} />
                        )}
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0, paddingBottom: i < group.entries.length - 1 ? 12 : 0 }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 14, fontWeight: 600, color: "#1C1C1E", letterSpacing: "-0.01em", marginBottom: 4 }}>
                              {entry.title}
                            </p>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                              <span className={`chip ${isDrill ? "green" : "blue"}`}>
                                {isDrill ? "Daily Drill" : "Challenge"}
                              </span>
                              <span style={{ fontSize: 12, color: "#C7C7CC" }}>·</span>
                              <span style={{ fontSize: 12, color: "#8E8E93" }}>{entry.time}</span>
                            </div>
                          </div>
                          <div style={{ flexShrink: 0, background: "#F9F9F9", borderRadius: 10, padding: "5px 10px", fontSize: 13, fontWeight: 600, color: isDrill ? "#34C759" : "#007AFF" }}>
                            +{entry.xp} XP
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </>
      )}

      {/* ── MY NOTES ── */}
      {subTab === "notes" && (
        <>
          {/* Composer */}
          <div className="card" style={{ padding: 16, marginBottom: 14 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1C1C1E", marginBottom: 10, letterSpacing: "-0.01em" }}>
              Quick Observation
            </h3>
            <textarea
              rows={3}
              placeholder="What did you notice today while out? A landmark, an orientation moment, anything worth noting…"
              value={note}
              onChange={e => setNote(e.target.value)}
            />
            <button className="btn-primary" style={{ marginTop: 10 }} onClick={saveNote}>
              Save Note
            </button>
          </div>

          {db.isLoading && (
            <p style={{ textAlign: "center", padding: "32px 0", color: "#8E8E93", fontSize: 14 }}>Loading notes…</p>
          )}

          {!db.isLoading && db.journal.length > 0 && (
            <>
              <p className="section-label">
                {db.journal.length} {db.journal.length === 1 ? "Entry" : "Entries"} · Stored in your browser
              </p>
              <div className="card" style={{ padding: "0 16px" }}>
                {db.journal.map(entry => (
                  <div key={entry.id} className="j-row">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 5 }}>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#007AFF", letterSpacing: "-0.01em" }}>{entry.ch}</span>
                        <span style={{ fontSize: 12, color: "#C7C7CC", margin: "0 5px" }}>·</span>
                        <span style={{ fontSize: 12, color: "#8E8E93" }}>{entry.date}</span>
                        {entry.time && (
                          <>
                            <span style={{ fontSize: 12, color: "#C7C7CC", margin: "0 5px" }}>·</span>
                            <span style={{ fontSize: 12, color: "#8E8E93" }}>{entry.time}</span>
                          </>
                        )}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                        {entry.xp > 0 && (
                          <span style={{ fontSize: 12, color: "#34C759", fontWeight: 600 }}>+{entry.xp} XP</span>
                        )}
                        <button
                          className="btn-icon danger"
                          onClick={() => db.removeJournalEntry(entry.id)}
                          aria-label="Delete entry"
                        >
                          <Icon name="trash" size={15} color="#C7C7CC" />
                        </button>
                      </div>
                    </div>
                    <p style={{ fontSize: 14, color: "#3C3C43", lineHeight: 1.6, letterSpacing: "-0.01em" }}>
                      {entry.text}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}

          {!db.isLoading && db.journal.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px 0" }}>
              <Icon name="pencil" size={40} color="#D1D1D6" />
              <p style={{ marginTop: 12, fontSize: 14, color: "#8E8E93", lineHeight: 1.6 }}>
                No notes yet.<br />Jot an observation or complete a challenge with a reflection.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
