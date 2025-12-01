import React, { useState } from "react";

/**
 * Minimal position slider used on Level 3 / Page 3.
 * The surrounding lesson copy is loaded from Supabase already, so this
 * component only renders the interactive slider UI/pill bar.
 */
export default function Level3PositionSlider() {
  const [positionPct, setPositionPct] = useState(50);

  return (
    <section
      className="rounded-[28px] border border-[#f3bfd2] bg-[#ffe3ef] p-6 shadow-[0_10px_25px_rgba(0,0,0,0.08)]"
      aria-label="Position sizing slider"
    >
      <div className="flex flex-col gap-4 text-sm font-semibold text-[#352b30] sm:flex-row sm:items-center">
        <div className="rounded-full bg-[#d9e9a3] px-4 py-2 text-center text-xs uppercase tracking-wide text-[#2d2a2f]">
          Position %
        </div>

        <div className="flex flex-1 items-center gap-3 text-[#352b30]">
          <span className="text-xs">0%</span>
          <input
            type="range"
            min={0}
            max={100}
            value={positionPct}
            onChange={(e) => setPositionPct(Number(e.target.value))}
            className="h-2 flex-1 appearance-none rounded-full bg-[#fce5f1] accent-[#f1a7bc]"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={positionPct}
            aria-label="Position percent"
          />
          <span className="text-xs">100%</span>
        </div>

        <div className="text-base font-semibold text-[#352b30]">
          <strong>{positionPct}%</strong> of capital in trade
        </div>
      </div>

      <p className="mt-4 text-xs font-medium text-[#6b6b6b]">
        Use the slider to visualize how changing position size scales both profit and risk.
      </p>
    </section>
  );
}
