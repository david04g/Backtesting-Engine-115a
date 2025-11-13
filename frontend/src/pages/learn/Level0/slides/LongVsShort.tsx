import React, { useMemo } from 'react';

export const LongVsShort: React.FC = () => {
  // Generate synthetic price data over 60 days with upward trend
  const priceData = useMemo(() => {
    return Array.from({ length: 60 }, (_, i) => {
      const t = i / 10;
      const base = 100 + 10 * Math.sin(t * 0.8) + 0.5 * i + (Math.random() - 0.5) * 2;
      return Math.round(base * 100) / 100;
    });
  }, []);

  const buyPrice = priceData[0];
  const sellPrice = priceData[priceData.length - 1];

  // Calculate chart dimensions and scaling
  const chartWidth = 500;
  const chartHeight = 250;
  const padding = { top: 30, right: 60, bottom: 40, left: 50 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;

  const minPrice = Math.min(...priceData) * 0.95;
  const maxPrice = Math.max(...priceData) * 1.05;
  const priceRange = maxPrice - minPrice;

  // Convert price to y coordinate
  const priceToY = (price: number) => {
    return padding.top + plotHeight - ((price - minPrice) / priceRange) * plotHeight;
  };

  // Convert index to x coordinate
  const indexToX = (index: number) => {
    return padding.left + (index / (priceData.length - 1)) * plotWidth;
  };

  // Generate path for price line
  const pathData = priceData
    .map((price, index) => {
      const x = indexToX(index);
      const y = priceToY(price);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  const markerWidth = 16;
  const markerHeight = 12;
  const buyX = indexToX(0);
  const buyY = priceToY(priceData[0]);
  const sellX = indexToX(priceData.length - 1);
  const sellY = priceToY(priceData[priceData.length - 1]);
  const buyMarkerOffset = { x: 10, y: -4 };
  const sellLabelOffsetY = 2;

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="rounded-md p-6" style={{ backgroundColor: '#E8B6B6' }}>
        <h2 className="text-2xl font-bold mb-4">Long vs Short</h2>
        <p className="text-base leading-relaxed">
          Long: buy first, sell later; profit if price rises. Short: borrow and sell first, buy back later; 
          profit if price falls. Both carry risk.
        </p>
      </div>
      
      <div className="rounded-md p-6" style={{ backgroundColor: '#D9F2A6' }}>
        <div className="rounded-md p-8 flex items-center justify-center" style={{ minHeight: '300px', backgroundColor: '#D9F2A6' }}>
          <div className="bg-white rounded-md p-6" style={{ width: '100%', maxWidth: '500px' }}>
            <svg width={chartWidth} height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
              {/* Grid lines */}
              {[0, 1, 2, 3, 4].map((i) => {
                const y = padding.top + (i / 4) * plotHeight;
                return (
                  <line
                    key={`grid-h-${i}`}
                    x1={padding.left}
                    y1={y}
                    x2={padding.left + plotWidth}
                    y2={y}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                    strokeDasharray="2,2"
                  />
                );
              })}

              {/* Y-axis */}
              <line
                x1={padding.left}
                y1={padding.top}
                x2={padding.left}
                y2={padding.top + plotHeight}
                stroke="black"
                strokeWidth="2"
              />
              
              {/* X-axis */}
              <line
                x1={padding.left}
                y1={padding.top + plotHeight}
                x2={padding.left + plotWidth}
                y2={padding.top + plotHeight}
                stroke="black"
                strokeWidth="2"
              />

              {/* Y-axis arrow */}
              <polygon
                points={`${padding.left},${padding.top} ${padding.left - 5},${padding.top + 10} ${padding.left + 5},${padding.top + 10}`}
                fill="black"
              />

              {/* X-axis arrow */}
              <polygon
                points={`${padding.left + plotWidth},${padding.top + plotHeight} ${padding.left + plotWidth - 10},${padding.top + plotHeight - 5} ${padding.left + plotWidth - 10},${padding.top + plotHeight + 5}`}
                fill="black"
              />

              {/* Y-axis labels */}
              {[0, 1, 2, 3, 4].map((i) => {
                const price = minPrice + (4 - i) / 4 * priceRange;
                const y = padding.top + (i / 4) * plotHeight;
                return (
                  <text
                    key={`y-label-${i}`}
                    x={padding.left - 10}
                    y={y + 4}
                    fontSize="10"
                    fill="black"
                    textAnchor="end"
                  >
                    ${price.toFixed(0)}
                  </text>
                );
              })}

              {/* X-axis labels */}
              <text
                x={padding.left + plotWidth / 2}
                y={chartHeight - 10}
                fontSize="12"
                fill="black"
                textAnchor="middle"
                fontWeight="bold"
              >
                Time (Days)
              </text>

              {/* Y-axis label */}
              <text
                x={15}
                y={padding.top + plotHeight / 2}
                fontSize="12"
                fill="black"
                textAnchor="middle"
                transform={`rotate(-90 15 ${padding.top + plotHeight / 2})`}
                fontWeight="bold"
              >
                Price ($)
              </text>

              {/* Price line (black) */}
              <path
                d={pathData}
                stroke="black"
                strokeWidth="2"
                fill="none"
              />

              {/* Buy (long) marker - red downward-pointing triangle */}
              <polygon
                points={`${buyX + buyMarkerOffset.x},${buyY + buyMarkerOffset.y} ${buyX + buyMarkerOffset.x - markerWidth / 2},${buyY + buyMarkerOffset.y + markerHeight} ${buyX + buyMarkerOffset.x + markerWidth / 2},${buyY + buyMarkerOffset.y + markerHeight}`}
                fill="#ef4444"
              />
              <text
                x={buyX + buyMarkerOffset.x}
                y={buyY + buyMarkerOffset.y + markerHeight + 6}
                fontSize="11"
                fill="black"
                textAnchor="middle"
                fontWeight="bold"
              >
                Buy (long)
              </text>

              {/* Sell (short) marker - red downward-pointing triangle */}
              <polygon
                points={`${sellX},${sellY} ${sellX - markerWidth / 2},${sellY + markerHeight} ${sellX + markerWidth / 2},${sellY + markerHeight}`}
                fill="#ef4444"
              />
              <text
                x={sellX}
                y={sellY + markerHeight + 6 + sellLabelOffsetY}
                fontSize="11"
                fill="black"
                textAnchor="middle"
                fontWeight="bold"
              >
                Sell (short)
              </text>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

