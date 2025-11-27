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

  // draw on change
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ratio = window.devicePixelRatio || 1;
    c.width = Math.floor((c.clientWidth || 900) * ratio);
    c.height = Math.floor((c.clientHeight || 200) * ratio);
    (c.style as any).width = `${c.clientWidth}px`;
    (c.style as any).height = `${c.clientHeight}px`;

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
  }, [series, commission, slippageTicks, delaySteps, entryIndex, targetSellIndex]);

  const simulate = () => {
    // simply re-trigger useEffect by updating series reference (or call the same draw routine)
    setSeries((s) => [...s]);
  };

  return (
    <section className="le-demo">
      <div className="le-card" aria-labelledby="exec-title">
        <h2 id="exec-title" style={{ margin: 0, marginBottom: 6 }}>
          Slippage, Fees, and Execution Timing
        </h2>
        <p className="le-small">Simulate executing an order immediately or delayed — see how slippage and fees change results.</p>

        <div className="le-row" style={{ marginTop: 8 }}>
          <span className="le-pill">
            <span className="le-label">Commission $</span>
            <select id="fee" value={commission} onChange={(e) => setCommission(Number(e.target.value))}>
              <option value={0}>0</option>
              <option value={1}>1</option>
              <option value={5}>5</option>
            </select>
          </span>

          <span className="le-pill">
            <span className="le-label">Slippage (ticks)</span>
            <input
              id="slip"
              className="le-range"
              type="range"
              min={0}
              max={5}
              value={slippageTicks}
              onChange={(e) => setSlippageTicks(Number(e.target.value))}
              style={{ width: 160 }}
            />
            <span style={{ marginLeft: 8 }}>{slippageTicks}</span>
          </span>

          <span className="le-pill">
            <span className="le-label">Execution delay</span>
            <select id="delay" value={delaySteps} onChange={(e) => setDelaySteps(Number(e.target.value))}>
              <option value={0}>Immediate</option>
              <option value={1}>1 step</option>
              <option value={3}>3 steps</option>
            </select>
          </span>

          <button className="le-primary" id="exec-run" onClick={simulate}>
            Simulate
          </button>
        </div>

        <div className="le-row">
          <div style={{ flex: 1 }}>
            <canvas ref={canvasRef} className="le-canvas" aria-label="Execution chart" style={{ height: 200 }} />
          </div>
        </div>

        <div className="le-result" ref={resultRef} style={{ marginTop: 8 }}>
          Result: —
        </div>
      </div>
    </section>
  );
}
