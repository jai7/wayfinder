/**
 * Three dots indicating difficulty level (1–3 filled).
 */
export default function Dots({ n = 1 }) {
  return (
    <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
      {[1, 2, 3].map(d => (
        <div
          key={d}
          style={{
            width: 5, height: 5,
            borderRadius: "50%",
            background: d <= n ? "#1C1C1E" : "#E5E5EA",
          }}
        />
      ))}
    </div>
  );
}
