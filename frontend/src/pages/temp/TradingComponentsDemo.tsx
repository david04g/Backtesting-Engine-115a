// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import EntryExitPositionSize from '../../components/lessons/EntryExitPositionSize';
// import SlippageFeesExecution from '../../components/lessons/SlippageFeesExecution';

// const TradingComponentsDemo: React.FC = () => {
//   const navigate = useNavigate();
//   const [activeTab, setActiveTab] = useState<'entry' | 'slippage'>('entry');
  
//   // Sample price data for the EntryExitPositionSize component
//   const generateSamplePrices = () => {
//     const prices = [100];
//     for (let i = 1; i < 50; i++) {
//       const change = (Math.random() - 0.5) * 4;
//       prices.push(Math.max(50, Math.min(150, prices[i - 1] + change)));
//     }
//     return prices;
//   };

//   const [prices] = useState<number[]>(generateSamplePrices());
//   const [entryIndex, setEntryIndex] = useState(10);
//   const [exitIndex, setExitIndex] = useState(40);
//   const [positionSize, setPositionSize] = useState(100);

//   return (
//     <div className="max-w-6xl mx-auto p-6">
//       <h1 className="text-2xl font-bold mb-6">Trading Components Demo</h1>
      
//       <div className="flex space-x-4 mb-6">
//         <button
//           onClick={() => setActiveTab('entry')}
//           className={`px-4 py-2 rounded ${
//             activeTab === 'entry' 
//               ? 'bg-blue-600 text-white' 
//               : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//           }`}
//         >
//           Entry/Exit & Position Size
//         </button>
//         <button
//           onClick={() => setActiveTab('slippage')}
//           className={`px-4 py-2 rounded ${
//             activeTab === 'slippage' 
//               ? 'bg-blue-600 text-white' 
//               : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//           }`}
//         >
//           Slippage & Fees
//         </button>
//       </div>

//       <div className="bg-white rounded-lg shadow-md p-6">
//         {activeTab === 'entry' ? (
//           <div>
//             <h2 className="text-xl font-semibold mb-4">Entry/Exit & Position Size</h2>
//             <div className="border rounded-lg p-4">
//               <EntryExitPositionSize 
//                 prices={prices}
//                 onParametersChange={({ entryIndex, exitIndex, positionSize }) => {
//                   setEntryIndex(entryIndex);
//                   setExitIndex(exitIndex);
//                   setPositionSize(positionSize);
//                 }}
//               />
//             </div>
//           </div>
//         ) : (
//           <div>
//             <h2 className="text-xl font-semibold mb-4">Slippage & Fees</h2>
//             <div className="border rounded-lg p-4">
//               <SlippageFeesExecution 
//                 prices={prices}
//                 entryIndex={entryIndex}
//                 exitIndex={exitIndex}
//                 positionSize={positionSize}
//               />
//             </div>
//           </div>
//         )}
//       </div>

//       <div className="mt-6">
//         <button
//           onClick={() => navigate(-1)}
//           className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
//         >
//           ← Back
//         </button>
//       </div>
//     </div>
//   );
// };

// export default TradingComponentsDemo;

import React, { useCallback, useMemo, useState } from "react";
import EntryExitPositionSize from "../../components/lessons/EntryExitPositionSize";
import SlippageFeesExecution from "../../components/lessons/SlippageFeesExecution";

function generateSampleSeries(length = 80) {
  const prices: number[] = [100];
  for (let i = 1; i < length; i += 1) {
    const change = (Math.random() - 0.5) * 4;
    const next = Math.max(40, Math.min(200, prices[i - 1] + change));
    prices.push(+next.toFixed(2));
  }
  return prices;
}

export default function TradingComponentsDemo() {
  const [series, setSeries] = useState<number[]>(() => generateSampleSeries());
  const [seriesVersion, setSeriesVersion] = useState(0);
  const [entryIndex, setEntryIndex] = useState<number | null>(null);
  const [exitIndex, setExitIndex] = useState<number | null>(null);

  const handleEntryExitChange = useCallback(
    ({ entryIndex: entry, exitIndex: exit }: { entryIndex: number | null; exitIndex: number | null }) => {
      setEntryIndex(entry);
      setExitIndex(exit);
    },
    []
  );

  const regenerateSeries = () => {
    setSeries(generateSampleSeries());
    setSeriesVersion((version) => version + 1);
    setEntryIndex(null);
    setExitIndex(null);
  };

  const effectiveEntryIndex = entryIndex ?? 10;
  const effectiveExitIndex = exitIndex ?? 40;

  const slippageSeries = useMemo(() => [...series], [series]);

  return (
    <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-lime-800 font-semibold">Interactive Demo</p>
          <h1 className="text-3xl font-bold text-gray-900 mt-1">Trading Components Demo</h1>
          <p className="text-gray-600 mt-2 max-w-2xl">
            Experiment with the same entry/exit workflow and slippage simulation found in the lessons—now housed in a dedicated
            sandbox so you can play without affecting lesson progress.
          </p>
        </div>
        <button
          type="button"
          onClick={regenerateSeries}
          className="self-start rounded-full border border-lime-200 bg-white px-5 py-2 font-semibold text-lime-800 shadow-sm hover:bg-lime-50"
        >
          Regenerate Sample Prices
        </button>
      </header>

      <section className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-3xl border border-gray-100 bg-white shadow-md">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-900">Entry/Exit & Position Size</h2>
            <p className="text-sm text-gray-600">Pick trade levels and sizing to see how capital at risk changes.</p>
          </div>
          <EntryExitPositionSize
            key={seriesVersion}
            initialSeries={series}
            onChange={handleEntryExitChange}
          />
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white shadow-md">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-900">Slippage, Fees & Execution</h2>
            <p className="text-sm text-gray-600">See how the same trade performs once you add execution friction.</p>
          </div>
          <SlippageFeesExecution
            series={slippageSeries}
            entryIndex={effectiveEntryIndex}
            exitIndex={effectiveExitIndex}
          />
        </div>
      </section>
    </main>
  );
}
