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

import React from "react";
import EntryExitPositionSize from '../../components/lessons/EntryExitPositionSize';
import SlippageFeesExecution from '../../components/lessons/SlippageFeesExecution';


export default function TradingComponentsDemo() {
  return (
    <>
      <EntryExitPositionSize />
      <div style={{ height: 18 }} />
      <SlippageFeesExecution />
    </>
  );
}
