import React, { useEffect, useRef, useState } from "react";

type Props = {
  // optionally receive the same price series or entry/exit indices from parent
  series?: number[];
  entryIndex?: number | null;
  exitIndex?: number | null;
};


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
  ctx.fillStyle = "#ffb3d2";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const pad = 30;
  const w = canvas.width - pad * 2;
  const h = canvas.height - pad * 2;
  const min = Math.min(...series);
  const max = Math.max(...series);
  const scaleX = w / (series.length - 1 || 1);
  const scaleY = h / (max - min || 1);

  // Draw axes with rounded corners style
  ctx.strokeStyle = "#1f1f1f";
  ctx.lineWidth = 3;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(pad, pad);
  ctx.lineTo(pad, pad + h);
  ctx.lineTo(pad + w, pad + h);
  ctx.stroke();

  // Draw main price line
  ctx.beginPath();
  ctx.lineWidth = 3;
  ctx.strokeStyle = opts?.color ?? "#8ec5ff";
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  series.forEach((v, i) => {
    const x = pad + i * scaleX;
    const y = pad + h - (v - min) * scaleY;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Draw overlays
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

  // Draw markers
  if (opts?.markers) {
    opts.markers.forEach((m) => {
      if (m.i < 0 || m.i >= series.length) return;
      const x = pad + m.i * scaleX;
      const y = pad + h - (series[m.i] - min) * scaleY;

      // Draw marker circle
      ctx.beginPath();
      ctx.fillStyle = m.color ?? "#1f1f1f";
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();

      // Add label
      if (m.label) {
        ctx.font = "14px 'Space Grotesk', 'Inter', sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#1f1f1f";
        const labelY = y - 18 < pad ? y + 18 : y - 18;
        const text = `${m.label} @ ${series[m.i].toFixed(2)}`;
        ctx.fillText(text, x + 12, labelY);
      }
    });
  }
}

export default function SlippageFeesExecution(props: Props) {
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

    // draw base series with new color
    drawLineCanvas(c, series, { color: "#8ec5ff" });

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
    drawLineCanvas(c, series, { color: "#8ec5ff" });
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
    <div className="p-6">
      <section
        className="rounded-[32px] bg-[#f6ffb9] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
        aria-labelledby="exec-title"
      >
        <div className="space-y-2 text-[#1f1f1f]">
          <h2 id="exec-title" className="text-lg font-semibold">
            Slippage, Fees, and Execution Timing
          </h2>
          <p className="text-sm text-[#3d3d3d]">
            Simulate executing an order immediately or delayed — see how slippage and fees change results.
          </p>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          {/* Commission dropdown */}
          <div className="flex items-center gap-2 rounded-full border border-[#1f1f1f]/15 bg-[#edffac] px-4 py-2 text-sm font-semibold text-[#1f1f1f] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
            <span>Commission $</span>
            <select 
              id="fee"
              value={commission} 
              onChange={(e) => setCommission(Number(e.target.value))}
              className="w-16 rounded-full border border-transparent bg-white/70 px-3 py-1 text-right text-base font-semibold text-[#1f1f1f] focus:border-black/30 focus:outline-none"
            >
              <option value={0}>0</option>
              <option value={1}>1</option>
              <option value={5}>5</option>
            </select>
          </div>

          {/* Slippage slider */}
          <div className="flex items-center gap-2 rounded-full border border-[#1f1f1f]/15 bg-[#edffac] px-4 py-2 text-sm font-semibold text-[#1f1f1f] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] min-w-[200px] flex-grow">
            <span>Slippage (ticks)</span>
            <input
              id="slip"
              type="range"
              min={0}
              max={5}
              value={slippageTicks}
              onChange={(e) => setSlippageTicks(Number(e.target.value))}
              className="mx-2 h-1 w-full grow appearance-none rounded-full bg-white/70"
            />
            <span className="text-base min-w-[20px] text-center">{slippageTicks}</span>
          </div>

          {/* Execution delay dropdown */}
          <div className="flex items-center gap-2 rounded-full border border-[#1f1f1f]/15 bg-[#edffac] px-4 py-2 text-sm font-semibold text-[#1f1f1f] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
            <span>Execution delay</span>
            <select 
              id="delay"
              value={delaySteps} 
              onChange={(e) => setDelaySteps(Number(e.target.value))}
              className="w-24 rounded-full border border-transparent bg-white/70 px-3 py-1 text-right text-base font-semibold text-[#1f1f1f] focus:border-black/30 focus:outline-none"
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
            className="rounded-full border border-[#1f1f1f]/15 bg-white/70 px-4 py-2 text-sm font-semibold text-[#1f1f1f] transition hover:bg-white"
          >
            Simulate
          </button>
        </div>

        <div className="mt-6 rounded-[40px] bg-[#ffb3d2] p-6 shadow-[inset_0_2px_12px_rgba(0,0,0,0.15)]">
          <canvas 
            ref={canvasRef} 
            className="w-full rounded-[28px] bg-transparent cursor-crosshair" 
            style={{ height: 320 }} 
            aria-label="Execution chart" 
          />
        </div>

        <div 
          className="mt-4 rounded-full border border-[#1f1f1f]/15 bg-[#edffac] px-6 py-3 text-sm font-semibold text-[#1f1f1f] shadow-[0_2px_6px_rgba(0,0,0,0.08)]"
          ref={resultRef} 
        >
          Result: —
        </div>
      </section>
    </div>
  );
}
