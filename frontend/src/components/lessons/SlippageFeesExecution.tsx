import React, { useEffect, useRef, useState } from "react";

/**
 * SlippageFeesExecution.tsx
 * - Pixel-faithful port of Module D (Slippage, Fees, Execution Timing)
 * - Injects required CSS (same as EntryExitPositionSize)
 */

type Props = {
  // optionally receive the same price series or entry/exit indices from parent
  series?: number[];
  entryIndex?: number | null;
  exitIndex?: number | null;
};

function injectStylesOnce_Slippage() {
  if (typeof document === "undefined") return;
  if (document.getElementById("level0-demo-styles")) return; // already injected by previous component
}

/* reuse the same drawLineCanvas & genSeries helpers as in EntryExitPositionSize */
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
    markers?: { i: number; color?: string; label?: string }[];
    overlays?: { data: (number | null)[]; color?: string; width?: number }[];
    color?: string;
  }
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const pad = 30;
  const w = canvas.width - pad * 2;
  const h = canvas.height - pad * 2;
  const min = Math.min(...series);
  const max = Math.max(...series);
  const scaleX = w / (series.length - 1 || 1);
  const scaleY = h / (max - min || 1);
  // grid
  ctx.strokeStyle = "#142233";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    ctx.beginPath();
    ctx.moveTo(pad, pad + (i * h) / 4);
    ctx.lineTo(pad + w, pad + (i * h) / 4);
    ctx.stroke();
  }
  // series
  ctx.beginPath();
  ctx.lineWidth = 2;
  ctx.strokeStyle = opts?.color ?? "#99d7ff";
  series.forEach((v, i) => {
    const x = pad + i * scaleX;
    const y = pad + h - (v - min) * scaleY;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
  // overlays
  if (opts?.overlays) {
    opts.overlays.forEach((o) => {
      ctx.beginPath();
      ctx.lineWidth = o.width ?? 1.5;
      ctx.strokeStyle = o.color ?? "#34d399";
      o.data.forEach((v, i) => {
        if (v == null) return;
        const x = pad + i * scaleX;
        const y = pad + h - (v - min) * scaleY;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    });
  }
  // markers
  if (opts?.markers) {
    opts.markers.forEach((m) => {
      if (m.i < 0 || m.i >= series.length) return;
      const x = pad + m.i * scaleX;
      const y = pad + h - (series[m.i] - min) * scaleY;
      ctx.fillStyle = m.color ?? "#f59e0b";
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
      if (m.label) {
        ctx.fillStyle = "#cfe9ff";
        ctx.font = "12px system-ui";
        ctx.fillText(`${m.label} @ ${series[m.i].toFixed(2)}`, x + 8, y - 8);
      }
    });
  }
}

export default function SlippageFeesExecution(props: Props) {
  injectStylesOnce_Slippage();

  const [series, setSeries] = useState<number[]>(() => props.series ?? genSeries(80, "flat"));
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [commission, setCommission] = useState<number>(0);
  const [slippageTicks, setSlippageTicks] = useState<number>(1);
  const [delaySteps, setDelaySteps] = useState<number>(0);

  // default entry/sell indexes if not provided
  const entryIndex = props.entryIndex ?? 10;
  const targetSellIndex = props.exitIndex ?? 40;

  const resultRef = useRef<HTMLDivElement | null>(null);

  // draw on change - separated from canvas sizing
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    
    // Set canvas size properly with fixed height
    const displayWidth = c.clientWidth || 900;
    const displayHeight = 300; // Fixed height
    
    // Set canvas dimensions to match display size
    c.width = displayWidth;
    c.height = displayHeight;

    // draw base series
    drawLineCanvas(c, series, { color: "#99d7ff" });

    // simulate actual sell index with delay + slippage (slippage as ticks)
    const delay = delaySteps;
    const randSign = Math.random() > 0.5 ? 1 : -1;
    const actualSellIdx = Math.min(series.length - 1, targetSellIndex + delay + randSign * slippageTicks);

    // markers: buy and actual sell
    drawLineCanvas(c, series, {
      color: "#99d7ff",
      markers: [
        { i: entryIndex, color: "#22c55e", label: "Buy" },
        { i: actualSellIdx, color: "#f59e0b", label: "Sell" },
      ],
    });
    // compute executed P/L
    const buyPx = series[entryIndex];
    const sellPx = series[actualSellIdx];
    const net = sellPx - buyPx - commission * 2; // commission both sides
    if (resultRef.current) {
      resultRef.current.innerHTML = `Executed: Buy @ ${buyPx.toFixed(2)} → Sell @ ${sellPx.toFixed(2)} (idx ${actualSellIdx})<br/>Fees: $${(commission * 2).toFixed(
        2
      )} · Net P/L: $${net.toFixed(2)} (slippage ±${slippageTicks} ticks, delay ${delay} steps)`;
      resultRef.current.style.color = net >= 0 ? "var(--good)" : "var(--bad)";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [series, entryIndex, targetSellIndex]); // Only depend on series and indices

  // Separate effect for updating markers when parameters change
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;

    // simulate actual sell index with delay + slippage (slippage as ticks)
    const delay = delaySteps;
    const randSign = Math.random() > 0.5 ? 1 : -1;
    const actualSellIdx = Math.min(series.length - 1, targetSellIndex + delay + randSign * slippageTicks);

    // Clear and redraw with new markers
    drawLineCanvas(c, series, { color: "#99d7ff" });
    drawLineCanvas(c, series, {
      color: "#99d7ff",
      markers: [
        { i: entryIndex, color: "#22c55e", label: "Buy" },
        { i: actualSellIdx, color: "#f59e0b", label: "Sell" },
      ],
    });
    
    // compute executed P/L
    const buyPx = series[entryIndex];
    const sellPx = series[actualSellIdx];
    const net = sellPx - buyPx - commission * 2; // commission both sides
    if (resultRef.current) {
      resultRef.current.innerHTML = `Executed: Buy @ ${buyPx.toFixed(2)} → Sell @ ${sellPx.toFixed(2)} (idx ${actualSellIdx})<br/>Fees: $${(commission * 2).toFixed(
        2
      )} · Net P/L: $${net.toFixed(2)} (slippage ±${slippageTicks} ticks, delay ${delay} steps)`;
      resultRef.current.style.color = net >= 0 ? "var(--good)" : "var(--bad)";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commission, slippageTicks, delaySteps]); // Only depend on simulation parameters

  const simulate = () => {
    // simply re-trigger useEffect by updating series reference (or call the same draw routine)
    setSeries((s) => [...s]);
  };

  return (
    <section className="le-demo">
      <div className="le-card" aria-labelledby="exec-title">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h2 id="exec-title" style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: '#1f2937' }}>
              Slippage, Fees, and Execution Timing
            </h2>
            <p className="le-small" style={{ margin: '4px 0 0 0', color: '#6b7280' }}>
              Simulate executing an order immediately or delayed — see how slippage and fees change results.
            </p>
          </div>
        </div>

        {/* All controls on the same line */}
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          margin: '16px 0',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          {/* Commission dropdown */}
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
            <span style={{ fontSize: '14px', color: '#16a34a', marginRight: '8px' }}>Commission $</span>
            <select 
              id="fee"
              value={commission} 
              onChange={(e) => setCommission(Number(e.target.value))}
              style={{
                border: '1px solid #dcfce7',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '14px',
                outline: 'none',
                color: '#16a34a',
                fontWeight: 500,
                background: 'white'
              }}
            >
              <option value={0}>0</option>
              <option value={1}>1</option>
              <option value={5}>5</option>
            </select>
          </div>

          {/* Slippage slider */}
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
            minWidth: '200px'
          }}>
            <span style={{ fontSize: '14px', color: '#16a34a', marginRight: '8px' }}>Slippage (ticks)</span>
            <input
              id="slip"
              type="range"
              min={0}
              max={5}
              value={slippageTicks}
              onChange={(e) => setSlippageTicks(Number(e.target.value))}
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
              minWidth: '20px', 
              textAlign: 'center', 
              fontSize: '14px',
              color: '#16a34a',
              fontWeight: 500
            }}>
              {slippageTicks}
            </span>
          </div>

          {/* Execution delay dropdown */}
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
            <span style={{ fontSize: '14px', color: '#16a34a', marginRight: '8px' }}>Execution delay</span>
            <select 
              id="delay"
              value={delaySteps} 
              onChange={(e) => setDelaySteps(Number(e.target.value))}
              style={{
                border: '1px solid #dcfce7',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '14px',
                outline: 'none',
                color: '#16a34a',
                fontWeight: 500,
                background: 'white'
              }}
            >
              <option value={0}>Immediate</option>
              <option value={1}>1 step</option>
              <option value={3}>3 steps</option>
            </select>
          </div>

          {/* Simulate button */}
          <button 
            id="exec-run"
            onClick={simulate}
            style={{
              background: '#16a34a',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: 500,
              transition: 'all 0.2s',
              flexShrink: 0
            }}
            onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
          >
            Simulate
          </button>
        </div>

        <div className="le-row">
          <div style={{ flex: 1 }}>
            <canvas ref={canvasRef} className="le-canvas" aria-label="Execution chart" style={{ 
              height: 300, 
              width: '100%',
              borderRadius: '8px',
              background: '#fff5f7',
              cursor: 'crosshair'
            }} />
          </div>
        </div>

        <div 
          className="le-result" 
          ref={resultRef} 
          style={{ 
            marginTop: 12,
            padding: '12px 16px',
            background: 'white',
            border: '1px solid #dcfce7',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#16a34a',
            fontWeight: 500,
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}
        >
          Result: —
        </div>
      </div>
    </section>
  );
}
