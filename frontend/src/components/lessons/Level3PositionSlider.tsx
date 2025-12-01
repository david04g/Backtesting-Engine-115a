import React, { useMemo, useState } from "react";

type Slide = {
  label: string;
  title: string;
  body: React.ReactNode;
  showSlider?: boolean;
};

const SLIDES: Slide[] = [
  {
    label: "Entry Point",
    title: "Entry Point",
    body: (
      <>
        <p className="text-base leading-relaxed text-[#202020]">
          <em className="font-semibold">Entry</em> is the price where your exposure begins. Before the entry, you
          are flat; after it, your capital is at risk.
        </p>
        <ul className="ml-5 mt-3 list-disc space-y-2 text-sm text-[#202020]">
          <li>The trade does not exist until you choose an entry.</li>
          <li>The chosen entry level influences both potential gain and potential loss.</li>
          <li>Every strategy must specify a clear entry rule.</li>
        </ul>
        <p className="mt-3 text-sm text-[#6b6b6b]">
          Think of the entry as “stepping onto the field” — from that price onward, you are playing the game.
        </p>
      </>
    ),
  },
  {
    label: "Exit Point",
    title: "Exit Point",
    body: (
      <>
        <p className="text-base leading-relaxed text-[#202020]">
          <em className="font-semibold">Exit</em> is the price where your exposure ends. It closes the trade and
          locks in whatever happened between entry and exit.
        </p>
        <ul className="ml-5 mt-3 list-disc space-y-2 text-sm text-[#202020]">
          <li>After the exit, the position returns to zero.</li>
          <li>Gains and losses become final only at exit.</li>
          <li>Entries without defined exits leave risk open-ended.</li>
        </ul>
        <p className="mt-3 text-sm text-[#6b6b6b]">
          Good strategies decide in advance where and why to exit, instead of guessing in the moment.
        </p>
      </>
    ),
  },
  {
    label: "Position Size %",
    title: "Position Size (Position %) ",
    showSlider: true,
    body: (
      <>
        <p className="text-base leading-relaxed text-[#202020]">
          <em className="font-semibold">Position size</em> is how much of your total capital you put into one trade,
          expressed as a percentage.
        </p>
        <ul className="ml-5 mt-3 list-disc space-y-2 text-sm text-[#202020]">
          <li>0% = no exposure; 100% = all capital in this trade.</li>
          <li>Position % multiplies both profit and loss.</li>
          <li>Smaller size limits damage on bad trades; larger size increases impact of every outcome.</li>
        </ul>
        <p className="mt-3 text-sm text-[#6b6b6b]">
          Risk management is mostly position sizing. Even good entries fail if the size is reckless.
        </p>
      </>
    ),
  },
  {
    label: "Trading Costs",
    title: "Trading Costs (Fees and Commissions)",
    body: (
      <>
        <p className="text-base leading-relaxed text-[#202020]">
          Every trade has a cost to enter and exit. These are <em className="font-semibold">trading costs</em> such as
          broker commissions and platform fees.
        </p>
        <ul className="ml-5 mt-3 list-disc space-y-2 text-sm text-[#202020]">
          <li>Costs reduce net return regardless of trade direction.</li>
          <li>Frequent trading makes small fees add up quickly.</li>
          <li>Strategies must clear these costs to be profitable in reality.</li>
        </ul>
        <p className="mt-3 text-sm text-[#6b6b6b]">Backtests that ignore costs almost always look better than live results.</p>
      </>
    ),
  },
  {
    label: "Slippage",
    title: "Slippage",
    body: (
      <>
        <p className="text-base leading-relaxed text-[#202020]">
          <em className="font-semibold">Slippage</em> is the gap between the price you expected to trade at and the
          price you actually get.
        </p>
        <ul className="ml-5 mt-3 list-disc space-y-2 text-sm text-[#202020]">
          <li>Fast moves and thin liquidity increase slippage.</li>
          <li>Slippage quietly pushes entries higher and exits lower for buys, hurting performance.</li>
          <li>Backtests that assume “perfect fills” underestimate real risk.</li>
        </ul>
        <p className="mt-3 text-sm text-[#6b6b6b]">
          Slippage is a hidden cost that grows with volatility and order size.
        </p>
      </>
    ),
  },
  {
    label: "Execution Timing",
    title: "Execution Timing",
    body: (
      <>
        <p className="text-base leading-relaxed text-[#202020]">
          <em className="font-semibold">Execution timing</em> is when the order actually hits the market relative to
          the signal.
        </p>
        <ul className="ml-5 mt-3 list-disc space-y-2 text-sm text-[#202020]">
          <li>Immediate execution may differ from end-of-day or delayed execution.</li>
          <li>The same signal can lead to different entry/exit prices at different times.</li>
          <li>Timing rules must be part of the strategy, not an afterthought.</li>
        </ul>
        <p className="mt-3 text-sm text-[#6b6b6b]">
          Two traders with the same rules but different timing can report very different results.
        </p>
      </>
    ),
  },
];

export default function Level3PositionSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [positionPct, setPositionPct] = useState(50);
  const currentSlide = useMemo(() => SLIDES[currentIndex], [currentIndex]);
  const showSlider = currentSlide.showSlider;

  return (
    <div className="p-4 sm:p-6">
      <section className="mx-auto flex w-full max-w-5xl flex-col overflow-hidden rounded-[32px] bg-white shadow-[0_18px_45px_rgba(0,0,0,0.06)] md:flex-row">
        <aside className="w-full border-b-2 border-[#e3e3e3] bg-[#f4fad0] p-6 md:w-1/3 md:border-b-0 md:border-r-2">
          <div className="rounded-[20px] bg-[#e7f6a7] px-5 py-4 text-center text-[#202020]">
            <p className="text-lg font-semibold">Level 3</p>
            <span className="mt-1 block text-sm font-medium opacity-80">Gimmicks: Entries, Exits, and Frictions</span>
          </div>

          <div className="mt-6 space-y-4">
            {SLIDES.map((slide, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={slide.label}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`flex w-full items-center rounded-[16px] px-3 py-2 text-left transition ${
                    isActive ? "bg-[#ffe3ef] text-[#202020] shadow-inner" : "opacity-70 hover:opacity-100"
                  }`}
                >
                  <span
                    className={`mr-3 inline-flex h-5 w-5 items-center justify-center rounded-full border-2 border-white shadow-[0_0_0_2px_#e7f6a7] ${
                      isActive ? "bg-[#ffc9da]" : "bg-[#e7f6a7]"
                    }`}
                  />
                  <span className="text-sm font-semibold">{slide.label}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <main className="flex-1 bg-[#ffe3ef] p-6 text-[#202020]">
          <div className="rounded-[20px] bg-[#ffc9da] px-6 py-5 shadow-[0_8px_25px_rgba(0,0,0,0.08)]">
            <h2 className="text-2xl font-semibold text-[#202020]">{currentSlide.title}</h2>
            <div className="mt-4 space-y-2 text-sm leading-relaxed">{currentSlide.body}</div>
          </div>

          {showSlider && (
            <div className="mt-5 flex flex-col gap-3 rounded-[16px] bg-white/70 px-5 py-4 text-sm font-medium text-[#352b30] shadow-inner sm:flex-row sm:items-center">
              <div className="rounded-full bg-[#d9e9a3] px-4 py-2 text-center text-xs font-semibold uppercase tracking-wide">
                Position %
              </div>
              <div className="flex flex-1 items-center gap-3">
                <span className="text-xs font-semibold">0%</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={positionPct}
                  onChange={(e) => setPositionPct(Number(e.target.value))}
                  className="h-2 flex-1 appearance-none rounded-full bg-[#fce5f1] accent-[#f1a7bc]"
                  aria-label="Position percentage slider"
                />
                <span className="text-xs font-semibold">100%</span>
              </div>
              <div className="text-sm font-semibold text-[#352b30]">
                <strong>{positionPct}%</strong> of capital in trade
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-4 text-sm font-medium text-[#352b30] sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setCurrentIndex((idx) => Math.max(0, idx - 1))}
                className="rounded-full bg-[#f1a7bc] px-5 py-2 text-[#352b30] transition disabled:opacity-40"
                disabled={currentIndex === 0}
              >
                ◀ Previous
              </button>
              <button
                type="button"
                onClick={() =>
                  setCurrentIndex((idx) => Math.min(SLIDES.length - 1, idx + 1))
                }
                className="rounded-full bg-[#f1a7bc] px-5 py-2 text-[#352b30] transition disabled:opacity-40"
                disabled={currentIndex === SLIDES.length - 1}
              >
                Next ▶
              </button>
            </div>

            <div className="flex justify-center gap-2">
              {SLIDES.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-2.5 w-2.5 rounded-full ${
                    idx === currentIndex ? "bg-[#ffb3cf]" : "bg-[#ffd9e8]"
                  }`}
                />
              ))}
            </div>
          </div>
        </main>
      </section>
    </div>
  );
}
