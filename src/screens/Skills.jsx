import { SKILLS } from "../data/levels.js";

const CIRCUMFERENCE = 2 * Math.PI * 46;

const INSIGHTS = [
  "Start with Sun Compass or The Blind Point — both take under 2 minutes and immediately shift how you read your environment.",
  "You're building your foundation. Landmark awareness is the single most transferable spatial skill.",
  "Your mental maps are forming. The 60-Second Map Burn is the biggest lever — try it on your next trip.",
  "You're well on your way. Daily drills are the fastest path to making this instinctive.",
];

// Vintage skill color → ink-style bar
const SKILL_BAR_COLORS = {
  observation: '#9cd6a5',
  cardinal:    '#9fd6d8',
  mental_map:  '#f4dc7c',
  landmark:    '#f0b487',
  confidence:  '#f0a6b5',
};

export default function SkillsScreen({ gameState }) {
  const { xp, done, streak, totalDrills, skills } = gameState;
  const confidence = Math.min(100, done.length * 12 + streak * 5);
  const insightIdx = Math.min(Math.floor(done.length / 2), INSIGHTS.length - 1);

  return (
    <div className="page-body" style={{ paddingTop: 20 }}>

      {/* ── Section header ── */}
      <div style={{ marginBottom: 20 }}>
        <div className="lbl">TALLY COAST · ASSESSMENT</div>
        <div style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 36, lineHeight: 1, marginTop: 2 }}>
          SKILL CHART
        </div>
      </div>
      <hr style={{ borderTop: '2.5px solid #1a2622', borderBottom: 'none', marginBottom: 20 }} />

      {/* ── Confidence ring ── */}
      <div className="section-grid" style={{ marginTop: 0, marginBottom: 0 }}>
        <div className="section-bar-butter" />
        <div>
          <div className="lbl" style={{ marginBottom: 8 }}>NAVIGATION CONFIDENCE</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width={120} height={120} viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }} aria-hidden="true">
                <circle cx="60" cy="60" r="46" fill="none" stroke="rgba(26,38,34,.12)" strokeWidth="10" />
                <circle
                  cx="60" cy="60" r="46" fill="none" stroke="#e63a2e" strokeWidth="10"
                  strokeDasharray={`${(confidence / 100) * CIRCUMFERENCE} ${CIRCUMFERENCE}`}
                  strokeLinecap="butt"
                  style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(.4,0,.2,1)' }}
                />
              </svg>
              <div style={{ position: 'absolute', textAlign: 'center' }}>
                <div style={{ fontFamily: "'Bungee', sans-serif", fontSize: 28, lineHeight: 1, color: '#1a2622' }}>
                  {confidence}
                </div>
                <div style={{ fontFamily: "'VT323', monospace", fontSize: 13, color: '#2c4838', letterSpacing: '0.08em' }}>PCT</div>
              </div>
            </div>

            <div style={{ flex: 1, minWidth: 140 }}>
              {[
                { label: 'CHALLENGES DONE', val: done.length },
                { label: 'DRILLS COMPLETE', val: totalDrills },
                { label: 'DAY STREAK',      val: streak },
                { label: 'TOTAL XP',        val: xp },
              ].map(({ label, val }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(44,72,56,.4)', padding: '6px 0' }}>
                  <span className="lbl" style={{ fontSize: 10 }}>{label}</span>
                  <span style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 18, lineHeight: 1 }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Spatial skills ── */}
      <div className="section-grid">
        <div className="section-bar-mint" />
        <div>
          <div className="lbl" style={{ marginBottom: 4 }}>DRILL HEIGHTS · SKILL LEDGER</div>
          <div style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 28, lineHeight: 1, marginBottom: 12 }}>
            SPATIAL SKILLS
          </div>
          <hr style={{ borderTop: '2px solid #1a2622', borderBottom: 'none', marginBottom: 12 }} />

          {SKILLS.map((sk, i) => {
            const val = skills[sk.id] ?? 0;
            const pct = Math.min(100, (val / 8) * 100);
            const barColor = SKILL_BAR_COLORS[sk.id] || '#f4dc7c';
            return (
              <div key={sk.id} style={{ marginBottom: i < SKILLS.length - 1 ? 16 : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                  <span style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 800, fontSize: 14, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    {sk.label}
                  </span>
                  <span style={{ fontFamily: "'VT323', monospace", fontSize: 14, color: '#2c4838', letterSpacing: '0.08em' }}>
                    LV {val}
                  </span>
                </div>
                <div className="progress-track">
                  <div style={{
                    height: '100%',
                    background: barColor,
                    width: `${pct}%`,
                    borderRight: pct > 0 ? '2px solid #1a2622' : 'none',
                    transition: 'width 0.6s cubic-bezier(.4,0,.2,1)',
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Insight ── */}
      <div className="section-grid" style={{ marginBottom: 0 }}>
        <div className="section-bar-peach" />
        <div>
          <div className="lbl" style={{ marginBottom: 4 }}>CURRICULUM CITY · FIELD NOTES</div>
          <div style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 22, lineHeight: 1, marginBottom: 10 }}>
            NAVIGATOR'S INSIGHT
          </div>
          <hr style={{ borderTop: '2px solid #1a2622', borderBottom: 'none', marginBottom: 12 }} />
          <p style={{ fontSize: 15, color: '#2c4838', lineHeight: 1.65 }}>
            {INSIGHTS[insightIdx]}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: 20, paddingTop: 10, borderTop: '2px solid #1a2622', fontFamily: "'VT323', monospace", fontSize: 13, letterSpacing: '0.06em', color: '#2c4838', textAlign: 'center' }}>
        ★ TRUE NORTH BY THE SHADOW AT NOON · R.S. WAYFINDER &amp; CO.
      </div>
    </div>
  );
}
