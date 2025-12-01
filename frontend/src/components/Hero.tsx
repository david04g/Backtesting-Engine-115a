import React, { useMemo, useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthModal } from "./auth/AuthModal";

const Hero: React.FC = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [positionPct, setPositionPct] = useState(50);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [series, setSeries] = useState<number[]>([]);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const values: number[] = [];
    let price = 100;
    for (let i = 0; i < 120; i++) {
      const drift = Math.sin(i / 12) * 0.4;
      price += (Math.random() - 0.5) * 3 + drift;
      price = Math.max(50, Math.min(155, price));
      values.push(Number(price.toFixed(2)));
    }
    setSeries(values);
  }, []);

  const hoverPoint = useMemo(() => {
    if (hoverIndex == null || !series.length) return null;
    const value = series[hoverIndex];
    const pctFromStart = ((value - series[0]) / series[0]) * 100;
    return { value, pctFromStart };
  }, [hoverIndex, series]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !series.length) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.clientWidth;
    const height = 280;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#fff7fb");
    gradient.addColorStop(1, "#fde8f1");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "rgba(0,0,0,0.05)";
    for (let i = 0; i <= 5; i++) {
      const y = (height / 5) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const min = Math.min(...series);
    const max = Math.max(...series);
    const range = max - min || 1;
    const stepX = width / (series.length - 1);

    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#ec4899";
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    series.forEach((value, idx) => {
      const x = idx * stepX;
      const y = height - ((value - min) / range) * height;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    const areaGradient = ctx.createLinearGradient(0, 0, 0, height);
    areaGradient.addColorStop(0, "rgba(236,72,153,0.2)");
    areaGradient.addColorStop(1, "rgba(236,72,153,0.03)");
    ctx.fillStyle = areaGradient;
    ctx.fill();

    if (hoverIndex != null) {
      const hoverX = hoverIndex * stepX;
      const hoverY = height - ((series[hoverIndex] - min) / range) * height;
      ctx.strokeStyle = "rgba(53,43,48,0.4)";
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.moveTo(hoverX, 0);
      ctx.lineTo(hoverX, height);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "#fff";
      ctx.strokeStyle = "#ec4899";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(hoverX, hoverY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }, [series, hoverIndex]);

  const handleCanvasMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !series.length) return;
    const bounds = canvas.getBoundingClientRect();
    const ratio = (e.clientX - bounds.left) / bounds.width;
    const index = Math.min(series.length - 1, Math.max(0, Math.round(ratio * (series.length - 1))));
    setHoverIndex(index);
  };

  const handleGetStartedClick = () => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    if (isLoggedIn) {
      navigate("/profile");
      return;
    }

    setAuthMode("signup");
    setShowAuthModal(true);
  };
  return (
    <main className="px-6 py-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <h1 className="mb-8 text-4xl font-bold leading-tight text-gray-800 sm:text-5xl lg:text-6xl">
            Test Your Trading Strategies
          </h1>

          <p className="mb-12 text-lg leading-relaxed text-gray-600 sm:text-xl">
            Backtest your trading strategies with historical data, optimize
            parameters, and make data-driven decisions before risking real
            capital.
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              className="rounded-full border-2 border-gray-800 bg-white px-8 py-4 text-lg font-medium text-gray-800 transition-colors hover:bg-gray-50"
              onClick={handleGetStartedClick}
            >
              Get started
            </button>
          </div>
        </div>
        <div className="flex w-full justify-center lg:max-w-xl">
          <div className="w-full max-w-xl rounded-[32px] border border-white/60 bg-white/90 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.12)]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#7b6f73]">Strategy Pulse</p>
                <h3 className="text-3xl font-semibold text-[#1f1f1f]">
                  {series.length
                    ? `${(((series.at(-1)! - series[0]) / series[0]) * 100 >= 0 ? "+" : "") + (((series.at(-1)! - series[0]) / series[0]) * 100).toFixed(1)}%`
                    : "—"}
                </h3>
                <p className="text-sm text-[#7b6f73]">Simulated return (1Y)</p>
              </div>
              <div className="rounded-full bg-[#d9e9a3] px-4 py-2 text-center text-xs uppercase tracking-wide text-[#2d2a2f]">
                Position %
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={positionPct}
                  onChange={(e) => setPositionPct(Number(e.target.value))}
                  className="mt-2 h-1 w-full appearance-none rounded-full bg-[#fce5f1] accent-[#ec4899]"
                />
                <span className="mt-2 block text-sm font-semibold text-[#352b30]">
                  {positionPct}% exposure
                </span>
              </div>
            </div>

            <div className="mt-6">
              <canvas
                ref={canvasRef}
                className="w-full cursor-crosshair"
                onMouseMove={handleCanvasMove}
                onMouseLeave={() => setHoverIndex(null)}
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-4 text-sm font-medium text-[#352b30]">
              <div className="rounded-2xl bg-[#f4fad0] px-4 py-2">
                <p className="text-xs uppercase tracking-wide text-[#6b6b6b]">Volatility</p>
                <p className="text-lg font-semibold text-[#333333]">Low ⇢ Medium</p>
              </div>
              <div className="rounded-2xl bg-[#ffe3ef] px-4 py-2">
                <p className="text-xs uppercase tracking-wide text-[#6b6b6b]">Sharpe (sim.)</p>
                <p className="text-lg font-semibold text-[#333333]">1.6</p>
              </div>
            </div>

            {hoverPoint && (
              <div className="mt-4 rounded-2xl border border-[#f4cddc] bg-white/80 px-4 py-3 text-sm font-semibold text-[#352b30]">
                <p className="text-xs uppercase tracking-[0.2em] text-[#7b6f73]">Focus</p>
                <div className="flex items-center justify-between">
                  <span>Value</span>
                  <span>${hoverPoint.value.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-[#7b6f73]">
                  <span>vs. start</span>
                  <span>
                    {hoverPoint.pctFromStart >= 0 ? "+" : ""}
                    {hoverPoint.pctFromStart.toFixed(1)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
    </main>
  );
};

export default Hero;
