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
    <section className="p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6" aria-labelledby="exec-title">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 id="exec-title" className="text-xl font-semibold text-gray-800 mb-1">
              Slippage, Fees, and Execution Timing
            </h2>
            <p className="text-sm text-gray-600">
              Simulate executing an order immediately or delayed — see how slippage and fees change results.
            </p>
          </div>
        </div>

        {/* All controls on the same line */}
        <div className="flex gap-3 my-4 items-center flex-wrap">
          {/* Commission dropdown */}
          <div className="flex items-center bg-white border border-green-200 rounded-lg px-3 py-2 h-10 shadow-sm flex-shrink-0">
            <span className="text-sm text-green-600 mr-2">Commission $</span>
            <select 
              id="fee"
              value={commission} 
              onChange={(e) => setCommission(Number(e.target.value))}
              className="border border-green-200 rounded-md px-2 py-1 text-sm outline-none text-green-600 font-medium bg-white"
            >
              <option value={0}>0</option>
              <option value={1}>1</option>
              <option value={5}>5</option>
            </select>
          </div>

          {/* Slippage slider */}
          <div className="flex items-center bg-white border border-green-200 rounded-lg px-3 py-2 h-10 shadow-sm flex-shrink-0 min-w-[200px]">
            <span className="text-sm text-green-600 mr-2">Slippage (ticks)</span>
            <input
              id="slip"
              type="range"
              min={0}
              max={5}
              value={slippageTicks}
              onChange={(e) => setSlippageTicks(Number(e.target.value))}
              className="w-20 mx-1.5 appearance-none h-1 bg-green-100 rounded-md outline-none"
            />
            <span className="min-w-[20px] text-center text-sm text-green-600 font-medium">
              {slippageTicks}
            </span>
          </div>

          {/* Execution delay dropdown */}
          <div className="flex items-center bg-white border border-green-200 rounded-lg px-3 py-2 h-10 shadow-sm flex-shrink-0">
            <span className="text-sm text-green-600 mr-2">Execution delay</span>
            <select 
              id="delay"
              value={delaySteps} 
              onChange={(e) => setDelaySteps(Number(e.target.value))}
              className="border border-green-200 rounded-md px-2 py-1 text-sm outline-none text-green-600 font-medium bg-white"
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
            className="bg-green-600 text-white border-none px-4 py-2 rounded-md text-sm cursor-pointer font-medium transition-opacity hover:opacity-90 flex-shrink-0"
          >
            Simulate
          </button>
        </div>

        <div className="flex">
          <div className="flex-1">
            <canvas ref={canvasRef} className="w-full rounded-lg bg-pink-50 cursor-crosshair" style={{ height: 300 }} aria-label="Execution chart" />
          </div>
        </div>

        <div 
          className="le-result mt-3 p-3 bg-white border border-green-200 rounded-lg text-sm text-green-600 font-medium shadow-sm"
          ref={resultRef} 
        >
          Result: —
        </div>
      </div>
    </section>
  );
}
