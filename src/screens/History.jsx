import { useState } from "react";
import Icon from "../components/Icon.jsx";
import { groupByDate, formatTimestamp } from "../utils/dates.js";

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
    <div className="page-body" style={{ paddingTop: 20 }}>

      {/* ── Section header ── */}
      <div style={{ marginBottom: 12 }}>
        <div className="lbl">WAYFINDER · FIELD RECORDS</div>
        <div style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 36, lineHeight: 1, marginTop: 2 }}>
          HISTORY
        </div>
      </div>
      <hr style={{ borderTop: '2.5px solid #1a2622', borderBottom: 'none', marginBottom: 0 }} />

      {/* ── Sub-tabs ── */}
      <div className="sub-tabs">
        {[["feed","ACTIVITY LOG","activity"],["notes","FIELD NOTES","pencil"]].map(([id, label, icon]) => (
          <button
            key={id}
            className={`sub-tab${subTab === id ? " active" : ""}`}
            onClick={() => setSubTab(id)}
          >
            <Icon name={icon} size={12} color={subTab === id ? "#e63a2e" : "rgba(44,72,56,.5)"} />
            {label}
          </button>
        ))}
      </div>

      {/* ── ACTIVITY FEED ── */}
      {subTab === "feed" && (
        <>
          {db.isLoading && (
            <p style={{ fontFamily: "'VT323', monospace", textAlign: 'center', padding: '40px 0', color: '#2c4838', fontSize: 16, letterSpacing: '0.1em' }}>
              LOADING RECORDS…
            </p>
          )}

          {!db.isLoading && db.activity.length === 0 && (
            <div style={{ textAlign: 'center', padding: '56px 0' }}>
              <div style={{ fontFamily: "'Bungee', sans-serif", fontSize: 36, color: 'rgba(26,38,34,.15)', marginBottom: 12 }}>∅</div>
              <div style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 800, fontSize: 18, marginBottom: 6, color: '#1a2622' }}>
                NO ACTIVITY YET
              </div>
              <p style={{ fontFamily: "'VT323', monospace", fontSize: 15, color: '#2c4838', letterSpacing: '0.06em', lineHeight: 1.5 }}>
                COMPLETE A CHALLENGE OR DAILY DRILL<br />TO START YOUR ACTIVITY LOG.
              </p>
            </div>
          )}

          {!db.isLoading && activityGroups.map(group => (
            <div key={group.label} style={{ marginBottom: 24 }}>
              <div className="feed-group-label">{group.label}</div>

              {group.entries.map((entry, i) => {
                const isDrill = entry.type === "drill";
                return (
                  <div
                    key={entry.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '12px 1fr',
                      gap: 12,
                      alignItems: 'center',
                      padding: '10px 0',
                      borderBottom: '1px dashed rgba(44,72,56,.5)',
                    }}
                  >
                    {/* Color bar */}
                    <div style={{
                      width: 10, height: 10, borderRadius: '50%',
                      background: isDrill ? '#9cd6a5' : '#f0a6b5',
                      border: '2px solid #1a2622',
                      flexShrink: 0,
                    }} />

                    {/* Content */}
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 16, lineHeight: 1 }}>
                          {(entry.title || '').toUpperCase()}
                        </div>
                        <div style={{ fontFamily: "'VT323', monospace", fontSize: 13, color: '#2c4838', letterSpacing: '0.06em', marginTop: 2 }}>
                          {isDrill ? 'DAILY DRILL' : 'CURRICULUM'} · {formatTimestamp(entry.createdAt)}
                        </div>
                      </div>
                      <div style={{
                        fontFamily: "'VT323', monospace", fontSize: 15,
                        color: '#e63a2e', letterSpacing: '0.08em', flexShrink: 0,
                      }}>
                        +{entry.xp} XP
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </>
      )}

      {/* ── MY NOTES ── */}
      {subTab === "notes" && (
        <>
          {/* Composer */}
          <div style={{ border: '2px solid #1a2622', padding: 16, marginBottom: 20, background: '#fff9e2' }}>
            <div className="lbl" style={{ marginBottom: 8 }}>✦ QUICK OBSERVATION</div>
            <textarea
              rows={3}
              placeholder="What did you notice today while out? A landmark, an orientation moment…"
              value={note}
              onChange={e => setNote(e.target.value)}
            />
            <button className="btn-primary" style={{ marginTop: 10 }} onClick={saveNote}>
              Save Field Note
            </button>
          </div>

          {db.isLoading && (
            <p style={{ fontFamily: "'VT323', monospace", textAlign: 'center', padding: '32px 0', color: '#2c4838', fontSize: 16 }}>
              LOADING NOTES…
            </p>
          )}

          {!db.isLoading && db.journal.length > 0 && (
            <>
              <div className="lbl" style={{ marginBottom: 10 }}>
                {db.journal.length} {db.journal.length === 1 ? 'ENTRY' : 'ENTRIES'} · STORED IN YOUR BROWSER
              </div>
              {db.journal.map((entry, i) => (
                <div
                  key={entry.id}
                  style={{
                    padding: '12px 0',
                    borderBottom: '1px dashed rgba(44,72,56,.6)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div>
                      <span style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 800, fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(26,38,34,.6)' }}>
                        {entry.ch || 'OBSERVATION'}
                      </span>
                      <span style={{ fontFamily: "'VT323', monospace", fontSize: 13, color: 'rgba(44,72,56,.6)', letterSpacing: '0.06em', marginLeft: 8 }}>
                        · {formatTimestamp(entry.createdAt)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {entry.xp > 0 && (
                        <span style={{ fontFamily: "'VT323', monospace", fontSize: 14, color: '#e63a2e', letterSpacing: '0.08em' }}>
                          +{entry.xp} XP
                        </span>
                      )}
                      <button
                        className="btn-icon"
                        onClick={() => db.removeJournalEntry(entry.id)}
                        aria-label="Delete entry"
                      >
                        <Icon name="trash" size={14} color="rgba(26,38,34,.4)" />
                      </button>
                    </div>
                  </div>
                  <p style={{ fontSize: 14, color: '#2c4838', lineHeight: 1.6 }}>{entry.text}</p>
                </div>
              ))}
            </>
          )}

          {!db.isLoading && db.journal.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div style={{ fontFamily: "'Bungee', sans-serif", fontSize: 36, color: 'rgba(26,38,34,.15)', marginBottom: 12 }}>✎</div>
              <div style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 800, fontSize: 16, marginBottom: 6 }}>
                NO FIELD NOTES YET
              </div>
              <p style={{ fontFamily: "'VT323', monospace", fontSize: 15, color: '#2c4838', letterSpacing: '0.06em' }}>
                JOT AN OBSERVATION OR COMPLETE A CHALLENGE<br />WITH A REFLECTION TO AUTO-SAVE IT HERE.
              </p>
            </div>
          )}
        </>
      )}

      {/* Footer */}
      <div style={{ marginTop: 20, paddingTop: 10, borderTop: '2px solid #1a2622', fontFamily: "'VT323', monospace", fontSize: 13, letterSpacing: '0.06em', color: '#2c4838', textAlign: 'center' }}>
        ★ ALL RECORDS STORED LOCALLY IN YOUR BROWSER
      </div>
    </div>
  );
}
