import { SKILLS } from "../data/levels.js";

const CIRCUMFERENCE = 2 * Math.PI * 46;

const INSIGHTS = [
  "Start with Sun Compass or The Blind Point — both take under 2 minutes and immediately shift how you read your environment.",
  "You're building your foundation. Landmark awareness is the single most transferable spatial skill.",
  "Your mental maps are forming. The 60-Second Map Burn is the biggest lever — try it on your next trip.",
  "You're well on your way. Daily drills are the fastest path to making this instinctive.",
];

export default function SkillsScreen({ gameState }) {
  const { xp, done, streak, totalDrills, skills } = gameState;
  const confidence = Math.min(100, done.length * 12 + streak * 5);
  const insightIdx = Math.min(Math.floor(done.length / 2), INSIGHTS.length - 1);

  return (
    <div className="page-body">

      {/* ── Confidence ring ── */}
      <div className="card" style={{ padding: "24px 20px", marginBottom: 14, textAlign: "center" }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: "#8E8E93", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16 }}>
          Navigation Confidence
        </p>

        <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          <svg width={120} height={120} viewBox="0 0 120 120" style={{ transform: "rotate(-90deg)" }} aria-hidden="true">
            <circle cx="60" cy="60" r="46" fill="none" stroke="#F2F2F7" strokeWidth="10" />
            <circle
              cx="60" cy="60" r="46" fill="none" stroke="#007AFF" strokeWidth="10"
              strokeDasharray={`${(confidence / 100) * CIRCUMFERENCE} ${CIRCUMFERENCE}`}
              strokeLinecap="round"
              style={{ transition: "stroke-dasharray 0.8s cubic-bezier(.4,0,.2,1)" }}
            />
          </svg>
          <div style={{ position: "absolute", textAlign: "center" }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: "#1C1C1E", letterSpacing: "-0.02em" }}>
              {confidence}
            </span>
            <span style={{ fontSize: 16, color: "#8E8E93" }}>%</span>
          </div>
        </div>

        <p style={{ fontSize: 13, color: "#8E8E93", marginTop: 12 }}>
          {done.length} challenges · {totalDrills} drills · {streak} day streak
        </p>
      </div>

      {/* ── Skill bars ── */}
      <div className="card" style={{ padding: "20px", marginBottom: 14 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: "#1C1C1E", marginBottom: 18, letterSpacing: "-0.01em" }}>
          Spatial Skills
        </h2>
        {SKILLS.map((sk, i) => {
          const val = skills[sk.id] ?? 0;
          const pct = Math.min(100, (val / 8) * 100); // max 8 actions per skill area
          return (
            <div key={sk.id} style={{ marginBottom: i < SKILLS.length - 1 ? 18 : 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                <span style={{ fontSize: 14, color: "#1C1C1E", fontWeight: 500, letterSpacing: "-0.01em" }}>{sk.label}</span>
                <span style={{ fontSize: 12, color: "#8E8E93" }}>Lv {val}</span>
              </div>
              <div className="progress-track">
                <div
                  style={{
                    height: "100%", borderRadius: 100,
                    background: sk.color,
                    width: `${pct}%`,
                    transition: "width 0.6s cubic-bezier(.4,0,.2,1)",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Insight ── */}
      <div className="insight-box">
        <p className="insight-label">💡 Insight</p>
        <p className="insight-text">{INSIGHTS[insightIdx]}</p>
      </div>
    </div>
  );
}
