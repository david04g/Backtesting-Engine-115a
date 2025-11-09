import React from 'react';

export const RiskVsReward: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="rounded-md p-6" style={{ backgroundColor: '#E8B6B6' }}>
        <h2 className="text-2xl font-bold mb-4">Risk vs Reward</h2>
        <p className="text-base leading-relaxed">
          Higher potential reward typically implies higher risk. Manage risk with position size and diversification.
        </p>
      </div>
      
      <div className="rounded-md p-6" style={{ backgroundColor: '#D9F2A6' }}>
        <div className="rounded-md p-8 flex items-center justify-center" style={{ minHeight: '300px', backgroundColor: '#F8F8E0' }}>
          <svg width="500" height="350" viewBox="0 0 500 350" style={{ overflow: 'visible' }}>
            {/* Axes */}
            <line x1="50" y1="300" x2="450" y2="300" stroke="black" strokeWidth="2" />
            <line x1="50" y1="300" x2="50" y2="50" stroke="black" strokeWidth="2" />
            
            {/* Arrow for Risk axis (pointing right) */}
            <polygon points="450,300 440,295 440,305" fill="black" />
            
            {/* Arrow for Reward axis (pointing up) */}
            <polygon points="50,50 45,60 55,60" fill="black" />
            
            {/* Axis labels */}
            <text x="250" y="330" fontSize="14" fill="black" textAnchor="middle" fontWeight="bold">Risk →</text>
            <text x="20" y="175" fontSize="14" fill="black" textAnchor="middle" transform="rotate(-90 20 175)" fontWeight="bold">Reward ↑</text>
            
            {/* Risk-Reward curve (dark green, concave down) */}
            <path
              d="M 50 270 Q 200 230, 250 200 Q 300 170, 450 130"
              stroke="#228B22"
              strokeWidth="4"
              fill="none"
            />
            
            {/* Calculate points on the curve */}
            {/* For x=100 on first curve: solve quadratic to find t, then calculate y */}
            {/* First curve: (50,270) to (250,200) with control (200,230) */}
            {/* x(t) = (1-t)²*50 + 2(1-t)t*200 + t²*250 = 100 */}
            {/* Solving gives t ≈ 0.177 */}
            {/* y(t) = (1-t)²*270 + 2(1-t)t*230 + t²*200 ≈ 256.5 */}
            {/* For x=350 on second curve: (250,200) to (450,130) with control (300,170) */}
            {/* x(t) = (1-t)²*250 + 2(1-t)t*300 + t²*450 = 350 */}
            {/* Solving gives t ≈ 0.618 */}
            {/* y(t) = (1-t)²*200 + 2(1-t)t*170 + t²*130 ≈ 159 */}
            
            {/* Lower risk, lower reward point - on the curve at x=100 */}
            <circle cx="100" cy="256.5" r="5" fill="#228B22" />
            <rect x="110" y="266.5" width="180" height="20" rx="4" fill="#FFC0CB" />
            <text x="120" y="279.5" fontSize="11" fill="black">Lower risk, lower reward</text>
            
            {/* Higher risk, higher reward point - on the curve at x=350 */}
            <circle cx="350" cy="159" r="5" fill="#228B22" />
            <rect x="360" y="169" width="200" height="20" rx="4" fill="#FFC0CB" />
            <text x="370" y="182" fontSize="11" fill="black">Higher risk, higher reward</text>
          </svg>
        </div>
      </div>
    </div>
  );
};

