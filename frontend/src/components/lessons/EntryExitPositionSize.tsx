import React, { useEffect, useRef, useState } from "react";

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

export default function EntryExitPositionSize(props: Props) {
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
    <div className="p-6">
      <section className="bg-white rounded-lg shadow-sm border border-gray-100 p-6" aria-labelledby="entry-exit-title">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 id="entry-exit-title" className="text-xl font-semibold text-gray-800 mb-1">
              Entry / Exit / Position Size
            </h2>
            <p className="text-sm text-gray-600">
              Pick an entry price and exit price on the chart; choose a position size to see P/L and risk.
            </p>
          </div>
        </div>

        {/* All controls on the same line */}
        <div className="flex gap-3 my-4 items-center flex-wrap">
          {/* Capital input */}
          <div className="flex items-center bg-white border border-green-200 rounded-lg px-3 py-2 h-10 shadow-sm flex-shrink-0">
            <span className="text-sm text-green-600 mr-2">Capital $</span>
            <input
              type="number"
              value={capital}
              min={100}
              onChange={(e) => setCapital(Number(e.target.value))}
              className="w-20 border border-green-200 rounded-md px-2 py-1 text-sm outline-none text-green-600 font-medium"
            />
          </div>

          {/* Position slider */}
          <div className="flex items-center bg-white border border-green-200 rounded-lg px-3 py-2 h-10 shadow-sm flex-shrink-0 min-w-[220px]">
            <span className="text-sm text-green-600 mr-2">Position %</span>
            <input
              type="range"
              min={1}
              max={100}
              value={positionPct}
              onChange={(e) => setPositionPct(Number(e.target.value))}
              className="w-20 mx-1.5 appearance-none h-1 bg-green-100 rounded-md outline-none"
            />
            <span className="min-w-[35px] text-center text-sm text-green-600 font-medium">
              {positionPct}%
            </span>
          </div>

          {/* Entry card */}
          <div className="bg-white border border-green-200 rounded-lg px-4 py-2 min-w-[80px] text-center shadow-sm flex-shrink-0">
            <div className="text-xs text-green-600 mb-1">Entry</div>
            <div className="text-green-600 font-semibold text-base">
              {entryIdx != null ? series[entryIdx].toFixed(2) : "—" }
            </div>
          </div>

          {/* Exit card */}
          <div className="bg-white border border-green-200 rounded-lg px-4 py-2 min-w-[80px] text-center shadow-sm flex-shrink-0">
            <div className="text-xs text-green-600 mb-1">Exit</div>
            <div className="text-green-600 font-semibold text-base">
              {exitIdx != null ? series[exitIdx].toFixed(2) : "—" }
            </div>
          </div>

          {/* P/L card */}
          <div className="bg-white border border-green-200 rounded-lg px-4 py-2 min-w-[80px] text-center shadow-sm flex-shrink-0">
            <div className="text-xs text-green-600 mb-1">P/L $</div>
            <div className={`font-semibold text-base ${plValue != null ? (plValue >= 0 ? 'text-green-600' : 'text-red-500') : 'text-green-600'}`}>
              {plValue != null ? plValue.toFixed(2) : "—" }
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-1.5 ml-auto flex-shrink-0">
            <button
              onClick={() => regenerate("up", length)}
              className="bg-green-600 text-white border-none px-4 py-2 rounded-md text-sm cursor-pointer font-medium transition-opacity hover:opacity-90"
            >
              Generate Uptrend
            </button>
            <button
              onClick={() => regenerate("down", length)}
              className="bg-green-600 text-white border-none px-4 py-2 rounded-md text-sm cursor-pointer font-medium transition-opacity hover:opacity-90"
            >
              Generate Downtrend
            </button>
            <button 
              onClick={clearMarks}
              className="bg-white border border-green-200 text-green-600 px-4 py-2 rounded-md text-sm cursor-pointer font-medium transition-colors hover:bg-green-50"
            >
              Clear Marks
            </button>
          </div>
        </div>

        <canvas
          ref={canvasRef}
          className="w-full rounded-lg bg-pink-50 cursor-crosshair"
          style={{ height: 300 }}
          onClick={onCanvasClick}
          aria-label="Entry/Exit chart"
        />

        <div className="mt-5 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
          Tip: Position size controls how much capital is exposed. Larger size → larger potential gain or loss.
        </div>
      </section>
    </div>
  );
}
