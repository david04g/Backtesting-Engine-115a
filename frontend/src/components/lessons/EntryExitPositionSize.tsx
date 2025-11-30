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

const CANVAS_PADDING = 36;

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

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ffb3d2";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const pad = CANVAS_PADDING;
  const w = canvas.width - pad * 2;
  const h = canvas.height - pad * 2;
  const filtered = series.filter((v) => v != null) as number[];
  const min = Math.min(...filtered);
  const max = Math.max(...filtered);
  const range = max - min || 1;
  const scaleX = w / (series.length - 1 || 1);
  const scaleY = h / range;

  // Draw axes similar to the reference mockup
  ctx.strokeStyle = "#1f1f1f";
  ctx.lineWidth = 3;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(pad, pad);
  ctx.lineTo(pad, pad + h);
  ctx.lineTo(pad + w, pad + h);
  ctx.stroke();

  // Draw the main price line
  ctx.beginPath();
  ctx.lineWidth = 3;
  ctx.strokeStyle = opts?.color ?? "#a5f4ff";
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

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
      ctx.fillStyle = m.color ?? "#111827";
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
    const pad = CANVAS_PADDING;
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

  const chipClass =
    "flex items-center gap-2 rounded-full border border-[#1f1f1f]/15 bg-[#edffac] px-4 py-2 text-sm font-semibold text-[#1f1f1f] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]";
  const statClass =
    "flex flex-col items-center rounded-full border border-[#1f1f1f]/15 bg-[#edffac] px-6 py-2 text-sm font-semibold text-[#1f1f1f] shadow-[0_2px_6px_rgba(0,0,0,0.08)]";

  return (
    <div className="p-6">
      <section
        className="rounded-[32px] bg-[#f6ffb9] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
        aria-labelledby="entry-exit-title"
      >
        <div className="space-y-2 text-[#1f1f1f]">
          <h2 id="entry-exit-title" className="text-lg font-semibold">
            Pick an entry price and exit price on the chart; choose a position size to see P/L and risk.
          </h2>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className={chipClass}>
            <span>Capital $</span>
            <input
              type="number"
              value={capital}
              min={100}
              onChange={(e) => setCapital(Number(e.target.value))}
              className="w-24 rounded-full border border-transparent bg-white/70 px-3 py-1 text-right text-base font-semibold text-[#1f1f1f] focus:border-black/30 focus:outline-none"
            />
          </div>

          <div className={`${chipClass} flex-grow min-w-[220px]`}>
            <span>Position %</span>
            <input
              type="range"
              min={1}
              max={100}
              value={positionPct}
              onChange={(e) => setPositionPct(Number(e.target.value))}
              className="mx-2 h-1 w-full grow appearance-none rounded-full bg-white/70"
            />
            <span className="text-base">{positionPct}%</span>
          </div>

          <div className={statClass}>
            <span className="text-xs uppercase tracking-wide text-[#2c2c2c]">
              Entry
            </span>
            <span className="text-xl">
              {entryIdx != null ? series[entryIdx].toFixed(2) : "—"}
            </span>
          </div>

          <div className={statClass}>
            <span className="text-xs uppercase tracking-wide text-[#2c2c2c]">
              Exit
            </span>
            <span className="text-xl">
              {exitIdx != null ? series[exitIdx].toFixed(2) : "—"}
            </span>
          </div>

          <div className={statClass}>
            <span className="text-xs uppercase tracking-wide text-[#2c2c2c]">
              P/L $
            </span>
            <span
              className={`text-xl ${
                plValue != null ? (plValue >= 0 ? "text-emerald-600" : "text-rose-600") : "text-[#1f1f1f]"
              }`}
            >
              {plValue != null ? plValue.toFixed(2) : "—"}
            </span>
          </div>

          <div className="ml-auto flex flex-wrap gap-2">
            <button
              onClick={() => regenerate("up", length)}
              className="rounded-full border border-[#1f1f1f]/15 bg-white/70 px-4 py-2 text-sm font-semibold text-[#1f1f1f] transition hover:bg-white"
            >
              Generate Uptrend
            </button>
            <button
              onClick={() => regenerate("down", length)}
              className="rounded-full border border-[#1f1f1f]/15 bg-white/70 px-4 py-2 text-sm font-semibold text-[#1f1f1f] transition hover:bg-white"
            >
              Generate Downtrend
            </button>
            <button
              onClick={clearMarks}
              className="rounded-full border border-[#1f1f1f]/15 bg-transparent px-4 py-2 text-sm font-semibold text-[#1f1f1f] transition hover:bg-white/40"
            >
              Clear Marks
            </button>
          </div>
        </div>

        <div className="mt-6 rounded-[40px] bg-[#ffb3d2] p-6 shadow-[inset_0_2px_12px_rgba(0,0,0,0.15)]">
          <canvas
            ref={canvasRef}
            className="w-full rounded-[28px] bg-transparent cursor-crosshair"
            style={{ height: 320 }}
            onClick={onCanvasClick}
            aria-label="Entry/Exit chart"
          />
        </div>

        <p className="mt-4 text-center text-sm font-medium text-[#3d3d3d]">
          Tip: Position size controls how much capital is exposed. Larger size → larger potential gain or loss.
        </p>
      </section>
    </div>
  );
}
