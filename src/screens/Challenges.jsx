import { useState } from "react";
import DrillCard from "../components/DrillCard.jsx";
import ChallengeSheet from "../components/ChallengeSheet.jsx";
import { CHALLENGES } from "../data/challenges.js";
import { getDailyDrills } from "../data/drills.js";
import { todayKey } from "../utils/dates.js";
import { initials } from "../utils/levels.js";
import { getGreeting } from "../utils/dates.js";

// Difficulty dots (ink filled = earned)
function LevelDots({ n = 1 }) {
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {[1, 2, 3].map(i => (
        <span
          key={i}
          style={{
            display: 'inline-block',
            width: 9, height: 9,
            borderRadius: '50%',
            border: '1.5px solid #1a2622',
            background: i <= n ? '#1a2622' : '#fff9e2',
          }}
        />
      ))}
    </div>
  );
}

// Atlas index map SVG
function IndexMap() {
  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox="0 0 340 240" width="100%" style={{ display: 'block', maxWidth: 340 }}>
        <defs>
          <pattern id="wave" width="14" height="14" patternUnits="userSpaceOnUse">
            <path d="M0 7 Q 3.5 3 7 7 T 14 7" fill="none" stroke="#7fb9bc" strokeWidth=".8" opacity=".6" />
          </pattern>
        </defs>
        <rect width="340" height="240" fill="#9fd6d8" />
        <rect width="340" height="240" fill="url(#wave)" />

        {/* Regions */}
        <path d="M 20 30 C 60 16, 130 12, 170 22 C 175 60, 145 100, 90 100 C 50 100, 22 80, 20 30 Z" fill="#f4dc7c" />
        <path d="M 170 22 C 240 22, 300 30, 320 60 C 312 90, 260 110, 200 100 C 180 100, 168 60, 170 22 Z" fill="#f0a6b5" />
        <path d="M 90 100 C 145 100, 200 100, 260 110 C 280 130, 270 150, 220 156 C 160 156, 110 140, 90 130 C 75 120, 80 110, 90 100 Z" fill="#9cd6a5" />
        <path d="M 20 110 C 60 110, 80 110, 90 130 C 110 140, 160 156, 220 156 C 280 160, 320 170, 320 200 C 280 220, 200 224, 130 224 C 70 224, 30 210, 20 180 C 16 150, 16 130, 20 110 Z" fill="#f0b487" />

        {/* Coastline */}
        <path d="M 20 30 C 60 16, 240 14, 320 60 C 312 90, 320 170, 320 200 C 280 220, 70 224, 20 180 C 16 130, 14 60, 20 30 Z"
              fill="none" stroke="#2c4838" strokeWidth="2" opacity=".7" />

        {/* Roads */}
        <g stroke="#2c4838" strokeWidth="1" fill="none" opacity=".5">
          <path d="M 60 60 C 120 70, 180 70, 240 60" />
          <path d="M 80 120 C 140 130, 220 130, 280 130" />
          <path d="M 100 180 C 160 180, 220 180, 280 190" />
          <path d="M 100 40 C 110 80, 120 130, 130 200" />
          <path d="M 220 40 C 230 80, 250 130, 240 200" />
        </g>

        {/* City blocks */}
        <g fill="#fdf6df" stroke="#2c4838" strokeWidth=".5">
          <rect x="120" y="180" width="6" height="5" />
          <rect x="140" y="200" width="6" height="5" />
          <rect x="160" y="180" width="6" height="5" />
          <rect x="170" y="190" width="6" height="5" />
          <rect x="200" y="180" width="6" height="5" />
          <rect x="220" y="200" width="6" height="5" />
          <rect x="250" y="190" width="6" height="5" />
        </g>

        {/* Region labels */}
        <g fontFamily="Big Shoulders Display, sans-serif" fontWeight="800" fontSize="9"
           fill="#1a2622" opacity=".85" letterSpacing="2.5">
          <text x="50"  y="58"  textAnchor="start">GREETING</text>
          <text x="240" y="56"  textAnchor="middle">TALLY</text>
          <text x="175" y="132" textAnchor="middle">DRILL HEIGHTS</text>
          <text x="170" y="190" textAnchor="middle">CURRICULUM</text>
        </g>

        {/* Compass */}
        <g transform="translate(305 28)">
          <circle r="14" fill="#fdf6df" stroke="#2c4838" strokeWidth="1" />
          <polygon points="0,-12 3,0 0,12 -3,0" fill="#e63a2e" stroke="#2c4838" strokeWidth=".6" />
          <text y="-16" textAnchor="middle" fontFamily="Big Shoulders Display, sans-serif"
                fontWeight="900" fontSize="9" fill="#2c4838">N</text>
        </g>
      </svg>

      {/* Double frame */}
      <div style={{ position: 'absolute', inset: 0, border: '2.5px solid #1a2622', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 6, border: '1px solid rgba(26,38,34,.3)', pointerEvents: 'none' }} />

      {/* Caption badge */}
      <div style={{
        position: 'absolute', top: 0, left: 0,
        background: '#1a2622', color: '#fdf6df',
        fontFamily: "'VT323', monospace", fontSize: 11, letterSpacing: '0.1em',
        padding: '2px 8px',
      }}>
        FIG. A · INDEX MAP
      </div>
    </div>
  );
}

const MODES = [["all","ALL"],["home","HOME"],["explorer","EXPLORER"],["gym","GYM"]];

export default function ChallengesScreen({ gameState, db, profile }) {
  const [filter, setFilter] = useState("all");
  const [active, setActive] = useState(null);
  const dailyDrills = getDailyDrills();
  const drillsDoneIds = gameState.drillsToday.date === todayKey()
    ? gameState.drillsToday.ids : [];
  const drillsDoneCount = drillsDoneIds.length;
  const filtered = filter === "all"
    ? CHALLENGES : CHALLENGES.filter(c => c.mode === filter);
  const doneChallenges = gameState.done.length;
  const leftThisWeek = Math.max(0, CHALLENGES.length - doneChallenges);
  const greeting = getGreeting();

  async function handleCompleteChallenge(challenge, reflection) {
    gameState.completeChallenge(challenge);
    await Promise.all([
      db.logChallengeActivity({ challenge }),
      reflection.trim() ? db.addChallengeReflection({ challenge, text: reflection }) : Promise.resolve(),
    ]);
  }

  async function handleCompleteDrill(drill, note) {
    gameState.completeDrill(drill);
    await Promise.all([
      db.logDrillActivity({ drill }),
      note.trim() ? db.addDrillReflection({ drill, text: note }) : Promise.resolve(),
    ]);
  }

  // Pin symbols for curriculum items
  const CURR_SYMBOLS = ['Π', '☉', '▦', '§', '◉', '↺', '✦', '◎'];

  return (
    <div className="page-body" style={{ paddingTop: 0 }}>

      {/* ── MASTHEAD ─────────────────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: 24,
        alignItems: 'flex-start',
        padding: '28px 0 0',
        marginBottom: 0,
      }}>
        {/* Left: title + greeting */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 240 }}>
          <div>
            <div style={{ fontFamily: "'VT323', monospace", fontSize: 13, letterSpacing: '0.12em', color: 'rgba(26,38,34,.55)', marginBottom: 2 }}>
              VOL. I · SHEET 1 OF 12 · 1986 EDITION
            </div>
            <div style={{
              fontFamily: "'Bungee', sans-serif",
              fontSize: 'clamp(52px, 8vw, 88px)',
              lineHeight: 0.92,
              marginTop: 2,
              textShadow: '2px 2px 0 rgba(80,180,210,.65)',
              color: '#1a2622',
            }}>
              WAYFINDER
            </div>
            <p style={{ fontSize: 13, fontWeight: 500, marginTop: 6, color: '#2c4838', lineHeight: 1.4 }}>
              a pocket atlas of personal orientation —<br />for persons who forgot the way home
            </p>
          </div>

          {/* Greeting block */}
          <div style={{ marginTop: 20 }}>
            <div className="lbl">✦ GREETING BAY · OBSERVER</div>
            <div style={{
              fontFamily: "'Big Shoulders Display', sans-serif",
              fontSize: 'clamp(24px, 4vw, 44px)',
              fontWeight: 900,
              lineHeight: 1,
              marginTop: 4,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {greeting.toUpperCase()},{' '}
              <span style={{ color: '#e63a2e' }}>
                {(profile?.name ?? 'WAYFARER').toUpperCase()}
              </span>.
            </div>
            <p style={{ fontSize: 13, fontWeight: 500, marginTop: 6, color: '#2c4838', maxWidth: 480 }}>
              {drillsDoneCount === dailyDrills.length
                ? 'All drills done! Come back tomorrow to keep the streak alive.'
                : `${dailyDrills.length - drillsDoneCount} drill${dailyDrills.length - drillsDoneCount !== 1 ? 's' : ''} remain today. Walk them to keep the streak alive.`
              }
            </p>

            {/* Rank bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
              <span className="lbl">RANK</span>
              <span style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: 17, fontWeight: 900, whiteSpace: 'nowrap' }}>
                LOST LAMB
              </span>
              <span className="tick">→ CURIOUS WANDERER</span>
              <span className="tick">· {gameState.xp}/100 XP</span>
            </div>
            <div style={{ marginTop: 6, height: 10, border: '2px solid #1a2622', background: '#fff9e2', position: 'relative', maxWidth: 380 }}>
              <div style={{
                position: 'absolute', left: 0, top: 0, bottom: 0,
                width: `${Math.min(100, (gameState.xp / 100) * 100)}%`,
                background: '#e63a2e',
                borderRight: gameState.xp > 0 ? '2px solid #1a2622' : 'none',
              }} />
            </div>
          </div>
        </div>

        {/* Right: index map */}
        <div style={{ width: 'clamp(160px, 28%, 300px)', flexShrink: 0 }}>
          <IndexMap />
          {/* Map key */}
          <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px' }}>
            {[
              { color: '#f4dc7c', label: 'GREETING BAY' },
              { color: '#f0a6b5', label: 'TALLY COAST' },
              { color: '#9cd6a5', label: 'DRILL HEIGHTS' },
              { color: '#f0b487', label: 'CURRICULUM' },
            ].map(({ color, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 12, height: 12, background: color, border: '1.5px solid #1a2622', flexShrink: 0 }} />
                <span style={{ fontFamily: "'VT323', monospace", fontSize: 11, letterSpacing: '0.06em', color: '#2c4838' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <hr style={{ marginTop: 20, borderTop: '2.5px solid #1a2622', borderBottom: 'none' }} />

      {/* ── TALLY COAST ─────────────────────────────────────────────────── */}
      <div className="section-grid">
        <div className="section-bar-pink" />
        <div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <div>
              <div className="lbl">TALLY COAST · WEEKLY LOG</div>
              <div className="h-sect" style={{ marginTop: 2 }}>THIS WEEK</div>
            </div>
            <div className="tick" style={{ fontSize: 13 }}>
              WK {Math.ceil(new Date().getDate() / 7)} · {new Date().getFullYear()}
            </div>
          </div>
          <hr style={{ marginTop: 8, borderTop: '2px solid #1a2622', borderBottom: 'none' }} />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginTop: 10 }}>
            {[
              { val: drillsDoneCount,       label: 'DONE TODAY'       },
              { val: leftThisWeek,          label: 'LEFT TO EXPLORE',  accent: leftThisWeek > 0 },
              { val: gameState.streak,      label: 'STREAK DAYS'      },
            ].map(({ val, label, accent }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
                <div style={{
                  fontFamily: "'Bungee', sans-serif",
                  fontSize: 'clamp(42px, 6vw, 72px)',
                  lineHeight: 0.9,
                  color: accent ? '#e63a2e' : '#1a2622',
                  WebkitTextStroke: '1px #fdf6df',
                }}>
                  {String(val).padStart(2, '0')}
                </div>
                <div className="lbl" style={{ fontSize: 12 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── DRILL HEIGHTS ────────────────────────────────────────────────── */}
      <div className="section-grid">
        <div className="section-bar-mint" />
        <div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <div>
              <div className="lbl">DRILL HEIGHTS · CHAPTER I</div>
              <div className="h-sect" style={{ marginTop: 2 }}>TODAY'S DRILLS</div>
            </div>
            <div className="tick" style={{ fontSize: 13 }}>
              RESETS @ 00:00 · {drillsDoneCount}/{dailyDrills.length}
            </div>
          </div>
          <hr style={{ marginTop: 8, borderTop: '2px solid #1a2622', borderBottom: 'none' }} />

          {dailyDrills.map((drill, i) => (
            <DrillCard
              key={drill.id}
              drill={drill}
              index={i + 1}
              doneToday={drillsDoneIds.includes(drill.id)}
              onComplete={handleCompleteDrill}
            />
          ))}
        </div>
      </div>

      {/* ── CURRICULUM CITY ──────────────────────────────────────────────── */}
      <div className="section-grid" style={{ marginBottom: 0 }}>
        <div className="section-bar-peach" />
        <div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <div>
              <div className="lbl">CURRICULUM CITY · CHAPTER II</div>
              <div className="h-sect" style={{ marginTop: 2 }}>THE CURRICULUM</div>
            </div>
            <div className="tick" style={{ fontSize: 13 }}>MASTER ONCE · KEEP FOR LIFE</div>
          </div>
          <hr style={{ marginTop: 8, borderTop: '2px solid #1a2622', borderBottom: 'none' }} />

          {/* Filter pills */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8, marginBottom: 4, flexWrap: 'wrap', gap: 0 }}>
            {MODES.map(([id, label]) => (
              <button
                key={id}
                className={`filter-pill${filter === id ? ' active' : ''}`}
                onClick={() => setFilter(id)}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Curriculum header row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '36px 1fr 90px 80px 110px',
            gap: 12,
            padding: '6px 0',
            borderBottom: '2px solid #1a2622',
            fontFamily: "'Big Shoulders Display', sans-serif",
            fontWeight: 800,
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            color: 'rgba(26,38,34,.6)',
          }}>
            <div>SYM</div>
            <div>STATION</div>
            <div>TERRAIN</div>
            <div>TIME</div>
            <div style={{ textAlign: 'right' }}>LEVEL · XP</div>
          </div>

          {/* Curriculum rows */}
          {filtered.map((ch, i) => {
            const isDone = gameState.done.includes(ch.id);
            const sym = CURR_SYMBOLS[i % CURR_SYMBOLS.length];
            return (
              <div
                key={ch.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '36px 1fr 90px 80px 110px',
                  gap: 12,
                  alignItems: 'center',
                  padding: '10px 0',
                  borderBottom: '1px dashed rgba(44,72,56,.6)',
                  opacity: isDone ? 0.45 : 1,
                  cursor: isDone ? 'default' : 'pointer',
                }}
                onClick={() => !isDone && setActive(ch)}
                role="button"
                tabIndex={isDone ? -1 : 0}
                onKeyDown={e => e.key === 'Enter' && !isDone && setActive(ch)}
              >
                {/* Symbol pin */}
                <div className="pin" style={{ width: 34, height: 34, fontSize: 15 }}>
                  {isDone ? '✓' : sym}
                </div>

                {/* Station name */}
                <div>
                  <div style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 17, lineHeight: 1 }}>
                    {ch.title.toUpperCase()}
                  </div>
                  <div style={{ fontFamily: "'VT323', monospace", fontSize: 12, color: '#2c4838', letterSpacing: '0.04em', marginTop: 2 }}>
                    {ch.category}
                  </div>
                </div>

                {/* Terrain / mode */}
                <div className="lbl" style={{ fontSize: 10 }}>
                  {ch.mode.toUpperCase()}
                </div>

                {/* Duration */}
                <div className="tick" style={{ fontSize: 13 }}>{ch.duration}</div>

                {/* Level dots + XP */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                  <LevelDots n={ch.difficulty} />
                  <div style={{ fontFamily: "'VT323', monospace", fontSize: 14, color: '#e63a2e', minWidth: 36, textAlign: 'right' }}>
                    +{ch.xp}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <div style={{
        marginTop: 24, paddingTop: 10, borderTop: '2px solid #1a2622',
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
        fontFamily: "'VT323', monospace", fontSize: 13, letterSpacing: '0.06em', color: '#2c4838',
      }}>
        <div>★ TRUE NORTH BY THE SHADOW AT NOON</div>
        <div>R.S. WAYFINDER &amp; CO. · CHICAGO · 1986</div>
        <div>FOLIO 14</div>
      </div>

      {/* Challenge sheet */}
      {active && (
        <ChallengeSheet
          challenge={active}
          onComplete={(ch, reflection) => { handleCompleteChallenge(ch, reflection); setActive(null); }}
          onClose={() => setActive(null)}
        />
      )}
    </div>
  );
}
