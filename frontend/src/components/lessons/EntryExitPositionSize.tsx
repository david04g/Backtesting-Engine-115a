import React, { useEffect, useRef, useState } from "react";

/**
 * EntryExitPositionSize.tsx
 * - Pixel-faithful port of Module C (Entry / Exit / Position Size)
 * - Self-contained CSS injection so visual matches original demo
 */

type Props = {
  // Optionally pass a precomputed price series; otherwise component generates one
  initialSeries?: number[];
  initialMode?: "flat" | "up" | "down";
  length?: number;
  onChange?: (params: {
    entryIndex: number | null;
    exitIndex: number | null;
    positionPct: number;
    capital: number;
    pl: number | null;
  }) => void;
};

function injectStylesOnce() {
  if (typeof document === "undefined") return;
  if (document.getElementById("level0-demo-styles")) return;
  const css = `
  /* Modern light theme styles */
  :root {
    --bg: #f8f9fa;
    --panel: #ffffff;
    --muted: #6c757d;
    --text: #212529;
    --accent: #4dabf7;
    --good: #40c057;
    --bad: #fa5252;
    --warn: #fcc419;
    --border: #e9ecef;
    --chart-bg: #fff5f7;
    --chart-line: #4dabf7;
    --pill-bg: #f1f3f5;
    --pill-border: #e9ecef;
  }
  
  .le-demo { 
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; 
    color: var(--text);
    background: var(--bg);
    padding: 16px;
    border-radius: 12px;
  }
  
  .le-card { 
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 12px; 
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }
  
  .le-row { 
    display: flex; 
    gap: 12px; 
    align-items: center; 
    flex-wrap: wrap; 
    margin-bottom: 12px;
  }
  
  .le-pill { 
    background: var(--pill-bg);
    border: 1px solid var(--pill-border);
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 14px;
    color: var(--text);
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 36px;
    box-sizing: border-box;
  }
  
  .le-pill input, 
  .le-pill select {
    background: white;
    border: 1px solid var(--border);
    color: var(--text);
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 14px;
    outline: none;
  }
  
  .le-pill input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 2px rgba(77, 171, 247, 0.2);
  }
  
  .le-range {
    -webkit-appearance: none;
    width: 120px;
    height: 4px;
    background: #dee2e6;
    border-radius: 2px;
    outline: none;
    margin: 0 8px;
  }
  
  .le-range::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    background: var(--accent);
    border-radius: 50%;
    cursor: pointer;
  }
  
  .le-canvas { 
    width: 100%; 
    height: 240px; 
    background: var(--chart-bg);
    border-radius: 8px; 
    border: 1px solid var(--border);
    display: block;
    margin: 12px 0;
  }
  
  .le-mono { 
    font-family: 'Roboto Mono', Menlo, Monaco, Consolas, monospace; 
    color: var(--text);
  }
  
  .le-small { 
    font-size: 12px; 
    color: var(--muted);
    margin-right: 4px;
  }
  
  .le-summary-row { 
    display: flex; 
    gap: 12px; 
    margin-top: 16px;
    flex-wrap: wrap;
  }
  
  .le-summary { 
    background: var(--pill-bg);
    border: 1px solid var(--pill-border);
    padding: 8px 16px;
    border-radius: 20px;
    min-width: 100px;
    text-align: center;
  }
  
  .le-summary b { 
    display: block; 
    font-size: 16px; 
    margin-top: 4px;
    font-weight: 500;
  }
  
  .le-btn-clear { 
    background: transparent;
    border: 1px solid var(--border);
    padding: 6px 16px;
    border-radius: 20px;
    color: var(--text);
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;
  }
  
  .le-btn-clear:hover {
    background: var(--pill-bg);
  }
  
  .le-primary {
    background: var(--accent);
    border: none;
    padding: 8px 16px;
    border-radius: 20px;
    color: white;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s;
  }
  
  .le-primary:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }`;
  const el = document.createElement("style");
  el.id = "level0-demo-styles";
  el.innerHTML = css;
  document.head.appendChild(el);
}

/* ---- small helpers (same logic as the original demo) ---- */

function genSeries(len = 80, mode: "flat" | "up" | "down" = "flat") {
  const out: number[] = [];
  let p = 100;
  for (let i = 0; i < len; i++) {
    const baseStep = (Math.random() - 0.48) * (mode === "flat" ? 1 : mode === "up" ? 1.2 : -1.2);
    const trend = mode === "up" ? 0.3 : mode === "down" ? -0.3 : 0;
    const step = baseStep + trend;
    p = Math.max(1, +(p * (1 + step / 100)).toFixed(2));
    out.push(p);
  }
  return out;
}

function drawLineCanvas(
  canvas: HTMLCanvasElement,
  series: number[],
  opts?: {
    color?: string;
    overlays?: { data: (number | null)[]; color?: string; width?: number }[];
    markers?: { i: number; color?: string; label?: string }[];
  }
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  
  // Set canvas background to light pink
  ctx.fillStyle = "#fff5f7";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  const pad = 16; // Reduced padding for more chart area
  const w = canvas.width - pad * 2;
  const h = canvas.height - pad * 2;
  const filtered = series.filter((v) => v != null) as number[];
  const min = Math.min(...filtered);
  const max = Math.max(...filtered);
  const range = max - min || 1;
  const scaleX = w / (series.length - 1 || 1);
  const scaleY = h / range;

  // Draw subtle grid lines
  ctx.strokeStyle = "rgba(0, 0, 0, 0.05)";
  ctx.lineWidth = 1;
  
  // Horizontal grid lines
  const yStep = range / 4;
  for (let i = 0; i <= 4; i++) {
    const y = pad + (i * h) / 4;
    ctx.beginPath();
    ctx.setLineDash([2, 2]);
    ctx.moveTo(pad, y);
    ctx.lineTo(pad + w, y);
    ctx.stroke();
    
    // Add Y-axis labels
    if (i > 0) {
      ctx.fillStyle = "#6b7280";
      ctx.font = "10px -apple-system, system-ui, sans-serif";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      const value = (max - (i * yStep)).toFixed(2);
      ctx.fillText(value, pad - 8, y);
    }
  }
  
  // Reset line dash
  ctx.setLineDash([]);

  // Draw the main price line
  ctx.beginPath();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = opts?.color ?? "#4dabf7";
  ctx.lineJoin = "round";
  
  // Draw the line
  series.forEach((v, i) => {
    if (v == null) return;
    const x = pad + i * scaleX;
    const y = pad + h - (v - min) * scaleY;
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.stroke();

  // Draw markers for entry/exit points
  if (opts?.markers) {
    opts.markers.forEach((m) => {
      if (m.i < 0 || m.i >= series.length) return;
      const x = pad + m.i * scaleX;
      const y = pad + h - (series[m.i] - min) * scaleY;
      
      // Draw marker circle
      ctx.beginPath();
      ctx.fillStyle = m.color === "#22c55e" ? "#10b981" : "#f59e0b"; // Green for entry, orange for exit
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
      
      // Add white border to marker
      ctx.beginPath();
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.arc(x, y, 7, 0, Math.PI * 2);
      ctx.stroke();
      
      // Add label
      if (m.label) {
        ctx.font = "12px -apple-system, system-ui, sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "bottom";
        ctx.fillStyle = m.color === "#22c55e" ? "#10b981" : "#f59e0b";
        
        // Position label above or below the point to avoid overlap
        const labelY = y - 10 > 20 ? y - 10 : y + 20;
        const text = `${m.label} @ ${series[m.i].toFixed(2)}`;
        
        // Add text background for better readability
        const textWidth = ctx.measureText(text).width;
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.fillRect(x + 10, labelY - 14, textWidth + 10, 20);
        
        // Draw text
        ctx.fillStyle = m.color === "#22c55e" ? "#10b981" : "#f59e0b";
        ctx.fillText(text, x + 15, labelY);
      }
    });
  }
}

/* -------------------- Component -------------------- */

export default function EntryExitPositionSize(props: Props) {
  injectStylesOnce();

  const length = props.length ?? 80;
  const initialMode = props.initialMode ?? "flat";

  const [series, setSeries] = useState<number[]>(() =>
    props.initialSeries ? [...props.initialSeries] : genSeries(length, initialMode)
  );
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [entryIdx, setEntryIdx] = useState<number | null>(null);
  const [exitIdx, setExitIdx] = useState<number | null>(null);
  const [positionPct, setPositionPct] = useState<number>(10);
  const [capital, setCapital] = useState<number>(1000);

  // compute P/L
  const computePL = (): number | null => {
    if (entryIdx == null || exitIdx == null) return null;
    const entry = series[entryIdx];
    const exit = series[exitIdx];
    const sizeDollars = (capital * (positionPct / 100));
    const units = sizeDollars / entry;
    const pl = (exit - entry) * units;
    return pl;
  };

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    
    // Set canvas size properly
    const displayWidth = c.clientWidth || 600;
    const displayHeight = 300;
    
    // Set canvas dimensions to match display size
    c.width = displayWidth;
    c.height = displayHeight;

    // Draw the chart
    const markers = [];
    if (entryIdx != null) markers.push({ i: entryIdx, color: "#22c55e", label: "Entry" });
    if (exitIdx != null) markers.push({ i: exitIdx, color: "#f59e0b", label: "Exit" });

    drawLineCanvas(c, series, { color: "#8ec5ff", markers: markers });

    // notify parent if provided
    props.onChange?.({
      entryIndex: entryIdx,
      exitIndex: exitIdx,
      positionPct,
      capital,
      pl: computePL(),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [series, entryIdx, exitIdx]); // Remove positionPct and capital from dependencies

  // Separate effect for onChange callback when position or capital changes
  useEffect(() => {
    props.onChange?.({
      entryIndex: entryIdx,
      exitIndex: exitIdx,
      positionPct,
      capital,
      pl: computePL(),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positionPct, capital]); // Only depend on positionPct and capital

  // handle canvas click mapping to index
  const onCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current;
    if (!c) return;
    const rect = c.getBoundingClientRect();
    const pad = 30;
    const w = rect.width - pad * 2;
    const clickX = e.clientX - rect.left - pad;
    const idx = Math.round((clickX / (w || 1)) * (series.length - 1));
    if (idx < 0 || idx >= series.length) return;
    if (entryIdx == null) {
      setEntryIdx(idx);
    } else if (exitIdx == null) {
      setExitIdx(idx);
    } else {
      // cycle: set new entry and clear exit
      setEntryIdx(idx);
      setExitIdx(null);
    }
  };

  const clearMarks = () => {
    setEntryIdx(null);
    setExitIdx(null);
  };

  const regenerate = (mode: "flat" | "up" | "down", len = series.length) => {
    setSeries(genSeries(len, mode));
    setEntryIdx(null);
    setExitIdx(null);
  };

  const plValue = computePL();

  return (
    <div className="le-demo">
      <section className="le-card" aria-labelledby="entry-exit-title">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h2 id="entry-exit-title" style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: '#1f2937' }}>
              Entry / Exit / Position Size
            </h2>
            <p className="le-small" style={{ margin: '4px 0 0 0', color: '#6b7280' }}>
              Pick an entry price and exit price on the chart; choose a position size to see P/L and risk.
            </p>
          </div>
        </div>

        {/* All controls on the same line */}
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          margin: '16px 0',
          alignItems: 'center',
          flexWrap: 'wrap',
          maxWidth: '100%'
        }}>
          {/* Capital input */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            background: 'white',
            border: '1px solid #dcfce7',
            borderRadius: '8px',
            padding: '6px 12px',
            height: '40px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            flexShrink: 0
          }}>
            <span style={{ fontSize: '14px', color: '#16a34a', marginRight: '8px' }}>Capital $</span>
            <input
              type="number"
              value={capital}
              min={100}
              onChange={(e) => setCapital(Number(e.target.value))}
              style={{
                width: '80px',
                border: '1px solid #dcfce7',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '14px',
                outline: 'none',
                color: '#16a34a',
                fontWeight: 500
              }}
            />
          </div>

          {/* Position slider - more compact */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            background: 'white',
            border: '1px solid #dcfce7',
            borderRadius: '8px',
            padding: '6px 12px',
            height: '40px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            flexShrink: 0,
            minWidth: '220px'
          }}>
            <span style={{ fontSize: '14px', color: '#16a34a', marginRight: '8px' }}>Position %</span>
            <input
              type="range"
              min={1}
              max={100}
              value={positionPct}
              onChange={(e) => setPositionPct(Number(e.target.value))}
              style={{
                width: '80px',
                margin: '0 6px',
                WebkitAppearance: 'none',
                height: '4px',
                background: '#d1fae5',
                borderRadius: '2px',
                outline: 'none',
              }}
            />
            <span style={{ 
              minWidth: '35px', 
              textAlign: 'center', 
              fontSize: '14px',
              color: '#16a34a',
              fontWeight: 500
            }}>
              {positionPct}%
            </span>
          </div>

          {/* Entry card */}
          <div style={{ 
            background: 'white', 
            border: '1px solid #dcfce7',
            padding: '8px 12px',
            borderRadius: '8px',
            minWidth: '80px',
            textAlign: 'center',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            flexShrink: 0
          }}>
            <div style={{ fontSize: '12px', color: '#16a34a', marginBottom: '4px' }}>Entry</div>
            <div style={{ color: '#16a34a', fontWeight: 600, fontSize: '16px' }}>
              {entryIdx != null ? series[entryIdx].toFixed(2) : "—"}
            </div>
          </div>

          {/* Exit card */}
          <div style={{ 
            background: 'white', 
            border: '1px solid #dcfce7',
            padding: '8px 12px',
            borderRadius: '8px',
            minWidth: '80px',
            textAlign: 'center',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            flexShrink: 0
          }}>
            <div style={{ fontSize: '12px', color: '#16a34a', marginBottom: '4px' }}>Exit</div>
            <div style={{ color: '#16a34a', fontWeight: 600, fontSize: '16px' }}>
              {exitIdx != null ? series[exitIdx].toFixed(2) : "—"}
            </div>
          </div>

          {/* P/L card */}
          <div style={{ 
            background: 'white', 
            border: '1px solid #dcfce7',
            padding: '8px 12px',
            borderRadius: '8px',
            minWidth: '80px',
            textAlign: 'center',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            flexShrink: 0
          }}>
            <div style={{ fontSize: '12px', color: '#16a34a', marginBottom: '4px' }}>P/L $</div>
            <div style={{ 
              color: plValue != null ? (plValue >= 0 ? '#16a34a' : '#ef4444') : '#16a34a',
              fontWeight: 600, 
              fontSize: '16px' 
            }}>
              {plValue != null ? plValue.toFixed(2) : "—"}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '6px', marginLeft: 'auto', flexShrink: 0 }}>
            <button
              onClick={() => regenerate("up", length)}
              style={{
                background: '#16a34a',
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                cursor: 'pointer',
                fontWeight: 500,
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
            >
              Generate Uptrend
            </button>
            <button
              onClick={() => regenerate("down", length)}
              style={{
                background: '#16a34a',
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                cursor: 'pointer',
                fontWeight: 500,
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
            >
              Generate Downtrend
            </button>
            <button 
              onClick={clearMarks}
              style={{
                background: 'white',
                border: '1px solid #dcfce7',
                color: '#16a34a',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                cursor: 'pointer',
                fontWeight: 500,
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#f0fdf4'}
              onMouseOut={(e) => e.currentTarget.style.background = 'white'}
            >
              Clear Marks
            </button>
          </div>
        </div>

        <canvas
          ref={canvasRef}
          className="le-canvas"
          onClick={onCanvasClick}
          aria-label="Entry/Exit chart"
          style={{ 
            cursor: "crosshair", 
            margin: '12px 0',
            width: '100%',
            borderRadius: '8px',
            background: '#fff5f7',
            display: 'block'
          }}
        />

        <div className="le-summary-row" style={{ marginTop: '20px' }}>
          <div className="le-summary" style={{ background: 'white', border: '1px solid #e5e7eb' }}>
            <div className="le-small" style={{ color: '#6b7280' }}>Entry</div>
            <b id="entry-val" style={{ color: '#10b981', fontSize: '16px' }}>
              {entryIdx != null ? series[entryIdx].toFixed(2) : "—"}
            </b>
          </div>

          <div className="le-summary" style={{ background: 'white', border: '1px solid #e5e7eb' }}>
            <div className="le-small" style={{ color: '#6b7280' }}>Exit</div>
            <b id="exit-val" style={{ color: '#f59e0b', fontSize: '16px' }}>
              {exitIdx != null ? series[exitIdx].toFixed(2) : "—"}
            </b>
          </div>

          <div className="le-summary" style={{ background: 'white', border: '1px solid #e5e7eb' }}>
            <div className="le-small" style={{ color: '#6b7280' }}>P/L $</div>
            <b 
              id="pl-val" 
              style={{ 
                color: plValue != null ? (plValue >= 0 ? '#10b981' : '#ef4444') : '#6b7280',
                fontSize: '16px'
              }}
            >
              {plValue != null ? plValue.toFixed(2) : "—"}
            </b>
          </div>

          <div className="le-summary" style={{ background: 'white', border: '1px solid #e5e7eb' }}>
            <div className="le-small" style={{ color: '#6b7280' }}>Position $</div>
            <b style={{ fontSize: '16px', color: '#1f2937' }}>
              {(capital * (positionPct / 100)).toFixed(2)}
            </b>
          </div>
        </div>

        <div className="le-result" style={{ 
          marginTop: '16px', 
          padding: '12px', 
          background: '#f8fafc', 
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          color: '#4b5563',
          fontSize: '14px'
        }}>
          Tip: Position size controls how much capital is exposed. Larger size → larger potential gain or loss.
        </div>
      </section>
    </div>
  );
}
