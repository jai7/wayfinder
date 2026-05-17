import { useState, useRef, useEffect } from "react";
import Icon from "./Icon.jsx";

const DRILL_SYMBOLS = ['§', '◎', '▤', '✦', '◉', '↺', 'Π'];

function initCanvas(canvas, w, h) {
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff9e2';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(44,72,56,0.07)';
  ctx.lineWidth = 0.5;
  for (let x = 0; x <= w; x += 20) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  for (let y = 0; y <= h; y += 20) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }
}

function SketchPad() {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const isDrawing = useRef(false);
  const last = useRef(null);
  const toolRef = useRef('pencil');
  const [tool, setTool] = useState('pencil');

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    function resize() {
      initCanvas(canvas, wrap.clientWidth, CANVAS_H);
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  function changeTool(t) {
    setTool(t);
    toolRef.current = t;
  }

  function getXY(e) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if (e.touches) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  function onStart(e) {
    e.preventDefault();
    isDrawing.current = true;
    last.current = getXY(e);
  }

  function onMove(e) {
    if (!isDrawing.current) return;
    e.preventDefault();
    const pos = getXY(e);
    const ctx = canvasRef.current.getContext('2d');
    const isPencil = toolRef.current === 'pencil';
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = isPencil ? '#1a2622' : '#fff9e2';
    ctx.lineWidth = isPencil ? 2.5 : 22;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    last.current = pos;
  }

  function onEnd() {
    isDrawing.current = false;
    last.current = null;
  }

  function clearPad() {
    const canvas = canvasRef.current;
    initCanvas(canvas, canvas.width, canvas.height);
  }

  const chipBtn = (active) => ({
    padding: '2px 10px',
    border: '2px solid #1a2622',
    marginLeft: -2,
    background: active ? '#1a2622' : '#fff9e2',
    color: active ? '#fdf6df' : '#1a2622',
    fontFamily: "'VT323', monospace",
    fontSize: 13,
    letterSpacing: '0.08em',
    cursor: 'pointer',
    lineHeight: 1.6,
  });

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{
          fontFamily: "'Big Shoulders Display', sans-serif",
          fontSize: 12, fontWeight: 800, letterSpacing: '0.15em',
          textTransform: 'uppercase', color: 'rgba(26,38,34,.65)',
        }}>
          Sketch Pad
        </span>
        <div style={{ display: 'flex' }}>
          <button style={chipBtn(tool === 'pencil')} onClick={() => changeTool('pencil')}>
            ✏ Pencil
          </button>
          <button style={chipBtn(tool === 'eraser')} onClick={() => changeTool('eraser')}>
            ◻ Erase
          </button>
          <button style={chipBtn(false)} onClick={clearPad}>
            Clear
          </button>
        </div>
      </div>

      <div
        ref={wrapRef}
        style={{
          border: '2px solid #1a2622',
          lineHeight: 0,
          cursor: tool === 'pencil' ? 'crosshair' : 'cell',
          touchAction: 'none',
          userSelect: 'none',
        }}
      >
        <canvas
          ref={canvasRef}
          style={{ display: 'block', width: '100%', height: CANVAS_H }}
          onMouseDown={onStart}
          onMouseMove={onMove}
          onMouseUp={onEnd}
          onMouseLeave={onEnd}
          onTouchStart={onStart}
          onTouchMove={onMove}
          onTouchEnd={onEnd}
        />
      </div>

      <div style={{ fontFamily: "'VT323', monospace", fontSize: 12, color: 'rgba(44,72,56,.45)', letterSpacing: '0.05em', marginTop: 3 }}>
        No peeking at any map.
      </div>
    </div>
  );
}

const CANVAS_H = 210;

export default function DrillCard({ drill, index = 1, doneToday, onComplete }) {
  const [open, setOpen]   = useState(false);
  const [notes, setNotes] = useState("");
  const sym = DRILL_SYMBOLS[(index - 1) % DRILL_SYMBOLS.length];
  const hasSketchPad = drill.id === 'd7';

  function handleComplete() {
    onComplete(drill, notes);
    setNotes("");
    setOpen(false);
  }

  return (
    <>
      {/* Ledger row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '28px 38px 1fr 70px 90px',
          alignItems: 'center',
          gap: 12,
          padding: '11px 0',
          borderBottom: '1px dashed rgba(44,72,56,.7)',
          opacity: doneToday ? 0.45 : 1,
          cursor: doneToday ? 'default' : 'pointer',
        }}
        onClick={() => !doneToday && setOpen(true)}
        role="button"
        tabIndex={doneToday ? -1 : 0}
        onKeyDown={e => e.key === 'Enter' && !doneToday && setOpen(true)}
        aria-label={`${drill.title} drill`}
      >
        <div style={{ fontFamily: "'VT323', monospace", fontSize: 16, letterSpacing: '0.06em', color: '#2c4838' }}>
          {String(index).padStart(2, '0')}.
        </div>

        <div className="pin" style={{ width: 36, height: 36, fontSize: 17 }}>
          {doneToday ? '✓' : sym}
        </div>

        <div>
          <div style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 18, lineHeight: 1 }}>
            {drill.title.toUpperCase()}
          </div>
          <div style={{ fontFamily: "'VT323', monospace", fontSize: 13, color: '#2c4838', marginTop: 2, letterSpacing: '0.04em' }}>
            {drill.description}
          </div>
        </div>

        <div style={{ fontFamily: "'VT323', monospace", fontSize: 14, color: '#2c4838', letterSpacing: '0.06em' }}>
          {drill.duration}
        </div>

        <div style={{ textAlign: 'right' }}>
          <span className={`wf-chip ${doneToday ? 'wf-chip-cream' : 'wf-chip-ink'}`}>
            +{drill.xp} XP
          </span>
        </div>
      </div>

      {/* Detail bottom sheet */}
      {open && (
        <div className="overlay" onClick={() => setOpen(false)}>
          <div className="sheet" onClick={e => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="sheet-body" style={{ paddingBottom: 24 }}>

              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <div className="lbl">DRILL HEIGHTS · DAILY PRACTICE</div>
                  <div style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 24, lineHeight: 1, marginTop: 4 }}>
                    {drill.title.toUpperCase()}
                  </div>
                </div>
                <button className="btn-icon" onClick={() => setOpen(false)} aria-label="Close">
                  <Icon name="x" size={18} />
                </button>
              </div>

              {/* Meta chips */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                <span className="wf-chip wf-chip-cream">⏱ {drill.duration}</span>
                <span className="wf-chip wf-chip-cream">{drill.category.toUpperCase()}</span>
                <span className="wf-chip wf-chip-ink">+{drill.xp} XP</span>
              </div>

              {/* Description */}
              <p style={{ fontSize: 15, color: '#2c4838', lineHeight: 1.6, marginBottom: 16 }}>
                {drill.description}
              </p>

              {/* Sketch pad — Sketch from Memory drill only */}
              {hasSketchPad && <SketchPad />}

              {/* Reflection */}
              <label style={{
                fontFamily: "'Big Shoulders Display', sans-serif",
                fontSize: 12, fontWeight: 800, letterSpacing: '0.15em',
                textTransform: 'uppercase', display: 'block', marginBottom: 8,
                color: 'rgba(26,38,34,.65)',
              }}>
                Quick Reflection (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="What did you notice? Any surprises?"
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />

              <button className="btn-primary" style={{ marginTop: 16 }} onClick={handleComplete}>
                Complete Drill · +{drill.xp} XP
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
