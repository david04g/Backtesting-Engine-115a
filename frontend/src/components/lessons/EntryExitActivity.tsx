import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const POINTS = 80;
const VIEWBOX_WIDTH = 800;
const VIEWBOX_HEIGHT = 260;

const generateMockData = () => {
  const points: number[] = [];
  let price = 100;
  for (let i = 0; i < POINTS; i += 1) {
    const drift = Math.sin(i / 8) * 1.2;
    const noise = (Math.random() - 0.5) * 2;
    price = Math.max(80, Math.min(140, price + drift + noise));
    points.push(Number(price.toFixed(2)));
  }
  return points;
};

const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

export const EntryExitActivity: React.FC = () => {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const data = useMemo(() => generateMockData(), []);
  const [entryIndex, setEntryIndex] = useState(8);
  const [exitIndex, setExitIndex] = useState(40);
  const [activeMarker, setActiveMarker] = useState<"entry" | "exit" | null>(
    null,
  );

  const minPrice = useMemo(() => Math.min(...data), [data]);
  const maxPrice = useMemo(() => Math.max(...data), [data]);
  const entryPrice = data[entryIndex];
  const exitPrice = data[exitIndex];
  const profit = exitPrice - entryPrice;

  const normalizeY = useCallback(
    (price: number) => {
      const denominator = maxPrice - minPrice || 1;
      const relative = (price - minPrice) / denominator;
      return VIEWBOX_HEIGHT - relative * VIEWBOX_HEIGHT;
    },
    [maxPrice, minPrice]
  );

  const pathD = useMemo(() => {
    return data
      .map((value, index) => {
        const x = (index / (data.length - 1)) * VIEWBOX_WIDTH;
        const y = normalizeY(value);
        return `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(" ");
  }, [data, normalizeY]);

  useEffect(() => {
    if (!activeMarker) {
      document.body.style.userSelect = "";
      return undefined;
    }

    document.body.style.userSelect = "none";

    const handlePointerMove = (event: PointerEvent) => {
      if (!chartRef.current) return;
      const bounds = chartRef.current.getBoundingClientRect();
      const offsetX = event.clientX - bounds.left;
      const clampedX = Math.max(0, Math.min(bounds.width, offsetX));
      const ratio = clampedX / bounds.width;
      const nextIndex = Math.round(ratio * (data.length - 1));
      if (activeMarker === "entry") {
        setEntryIndex((prev) => {
          const candidate = Math.min(nextIndex, exitIndex - 1);
          return Math.max(0, candidate);
        });
      } else {
        setExitIndex((prev) => {
          const candidate = Math.max(nextIndex, entryIndex + 1);
          return Math.min(data.length - 1, candidate);
        });
      }
    };

    const handlePointerUp = () => setActiveMarker(null);

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      document.body.style.userSelect = "";
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [activeMarker, data.length, entryIndex, exitIndex]);

  const markerStyle = (index: number, color: string) => ({
    left: `${(index / (data.length - 1)) * 100}%`,
    background: color,
  });

  return (
    <div className="w-full rounded-2xl bg-[#ffc9da] p-6 shadow-sm">
      <header className="mb-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#6b6b6b]">
          Level 2 · Page 3
        </p>
        <h3 className="text-2xl font-bold text-[#202020]">
          Drag the Entry & Exit Markers
        </h3>
        <p className="max-w-3xl text-base text-[#202020]">
          Place <strong>Entry</strong> and <strong>Exit</strong> on the chart.
          Entry must occur before Exit. P/L = (Exit Price − Entry Price) ×
          Position Size (fixed at 1 unit).
        </p>
      </header>

      <div className="rounded-2xl bg-white/90 p-5">
        <div
          ref={chartRef}
          className="relative h-[320px] w-full rounded-xl border-2 border-gray-200 bg-white"
        >
          <svg
            viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full"
          >
            <defs>
              <linearGradient id="profitFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#f1a7bc" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#f1a7bc" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d={`${pathD} L ${VIEWBOX_WIDTH},${VIEWBOX_HEIGHT} L 0,${VIEWBOX_HEIGHT} Z`}
              fill="url(#profitFill)"
            />
            <path
              d={pathD}
              fill="none"
              stroke="#84cc16"
              strokeWidth={4}
              strokeLinecap="round"
            />
          </svg>

          <div
            className="absolute top-0 bottom-0 w-1 cursor-grab"
            style={markerStyle(entryIndex, "#d9e9a3")}
            onPointerDown={() => setActiveMarker("entry")}
          >
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 rounded-xl bg-[#e7f6a7] px-3 py-1 text-xs font-semibold text-[#202020] shadow">
              Entry
            </div>
          </div>

          <div
            className="absolute top-0 bottom-0 w-1 cursor-grab"
            style={markerStyle(exitIndex, "#f1a7bc")}
            onPointerDown={() => setActiveMarker("exit")}
          >
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 rounded-xl bg-[#f1a7bc] px-3 py-1 text-xs font-semibold text-[#202020] shadow">
              Exit
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-[#e7f6a7] p-4">
            <p className="text-xs uppercase tracking-wide text-[#6b6b6b]">
              Entry Price
            </p>
            <p className="text-2xl font-bold text-[#202020]">
              {formatCurrency(entryPrice)}
            </p>
            <p className="text-sm text-[#6b6b6b]">Point {entryIndex + 1}</p>
          </div>
          <div className="rounded-2xl bg-[#f1a7bc] p-4">
            <p className="text-xs uppercase tracking-wide text-[#6b6b6b]">
              Exit Price
            </p>
            <p className="text-2xl font-bold text-[#202020]">
              {formatCurrency(exitPrice)}
            </p>
            <p className="text-sm text-[#6b6b6b]">Point {exitIndex + 1}</p>
          </div>
          <div className="rounded-2xl bg-[#d9e9a3] p-4">
            <p className="text-xs uppercase tracking-wide text-[#6b6b6b]">
              P/L (1 unit)
            </p>
            <p
              className={`text-2xl font-bold ${
                profit >= 0 ? "text-emerald-700" : "text-rose-600"
              }`}
            >
              {profit >= 0 ? "+" : ""}
              {formatCurrency(profit)}
            </p>
            <p className="text-sm text-[#6b6b6b]">
              {exitIndex - entryIndex} bars held
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
