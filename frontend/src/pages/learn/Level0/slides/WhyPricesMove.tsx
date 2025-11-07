import React, { useMemo } from 'react';

export const WhyPricesMove: React.FC = () => {
  // Generate volatile price data with sharp peaks and troughs
  const priceData = useMemo(() => {
    const points: number[] = [];
    const numPoints = 80;
    
    for (let i = 0; i < numPoints; i++) {
      const t = i / numPoints;
      let price: number;
      
      // Create a volatile pattern with a sharp peak and sharp trough
      if (i < 30) {
        // Initial rise with volatility
        price = 180 - (i / 30) * 100 + (Math.random() - 0.5) * 15;
      } else if (i < 35) {
        // Sharp peak (unexpected news)
        price = 80 - (i - 30) * 8 + (Math.random() - 0.5) * 5;
      } else if (i < 55) {
        // Sharp decline with volatility
        price = 40 + (i - 35) * 8 + (Math.random() - 0.5) * 12;
      } else {
        // Recovery with volatility
        price = 200 - (i - 55) * 4.8 + (Math.random() - 0.5) * 10;
      }
      
      points.push(Math.max(50, Math.min(200, price)));
    }
    
    return points;
  }, []);

  // Chart dimensions
  const chartWidth = 500;
  const chartHeight = 250;
  const padding = { left: 50, right: 50, top: 50, bottom: 50 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;

  const minPrice = Math.min(...priceData);
  const maxPrice = Math.max(...priceData);
  const priceRange = maxPrice - minPrice;

  // Convert price to y coordinate
  const priceToY = (price: number) => {
    return padding.top + plotHeight - ((price - minPrice) / priceRange) * plotHeight;
  };

  // Convert index to x coordinate
  const indexToX = (index: number) => {
    return padding.left + (index / (priceData.length - 1)) * plotWidth;
  };

  // Generate path for volatile price line
  const pathData = priceData
    .map((price, index) => {
      const x = indexToX(index);
      const y = priceToY(price);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  // Find peak and trough positions
  const peakIndex = priceData.indexOf(Math.min(...priceData.slice(25, 40)));
  const troughIndex = priceData.indexOf(Math.max(...priceData.slice(50, 65)));

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-md p-6" style={{ backgroundColor: '#E8B6B6' }}>
        <h2 className="text-2xl font-bold mb-4">Why Prices Move</h2>
        <p className="text-base leading-relaxed mb-4">
          Prices update when new information arrives, main drivers are:
        </p>
        <ul className="list-disc list-inside space-y-2 text-base">
          <li>Company results and guidance</li>
          <li>Investor expectations and sentiment</li>
          <li>Economic data and policy</li>
          <li>Unexpected news</li>
        </ul>
      </div>
      
      <div className="rounded-md p-6" style={{ backgroundColor: '#E8B6B6' }}>
        <div className="rounded-md p-8 flex items-center justify-center" style={{ minHeight: '300px', backgroundColor: '#FFC0CB' }}>
          <svg width={chartWidth} height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
            {/* X-axis */}
            <line x1={padding.left} y1={padding.top + plotHeight} x2={padding.left + plotWidth} y2={padding.top + plotHeight} stroke="black" strokeWidth="3" />
            
            {/* Y-axis */}
            <line x1={padding.left} y1={padding.top + plotHeight} x2={padding.left} y2={padding.top} stroke="black" strokeWidth="3" />
            <polygon points={`${padding.left},${padding.top} ${padding.left - 5},${padding.top + 10} ${padding.left + 5},${padding.top + 10}`} fill="black" />
            
            {/* Price line (bright green, thick, very volatile) */}
            <path
              d={pathData}
              stroke="#00FF00"
              strokeWidth="5"
              fill="none"
            />
            
            {/* Arrow pointing DOWN to trough (low point) - "unexpected news" */}
            <line x1={indexToX(peakIndex)} y1={priceToY(priceData[peakIndex]) + 25} x2={indexToX(peakIndex)} y2={priceToY(priceData[peakIndex])} stroke="black" strokeWidth="2" />
            <polygon points={`${indexToX(peakIndex)},${priceToY(priceData[peakIndex])} ${indexToX(peakIndex) - 5},${priceToY(priceData[peakIndex]) + 10} ${indexToX(peakIndex) + 5},${priceToY(priceData[peakIndex]) + 10}`} fill="black" />
            <text x={indexToX(peakIndex)} y={priceToY(priceData[peakIndex]) + 45} fontSize="12" fill="black" fontWeight="bold" textAnchor="middle">unexpected news</text>
            
            {/* Arrow pointing UP to peak (high point) - "Investors lose faith in project" */}
            <line x1={indexToX(troughIndex)} y1={priceToY(priceData[troughIndex]) - 25} x2={indexToX(troughIndex)} y2={priceToY(priceData[troughIndex])} stroke="black" strokeWidth="2" />
            <polygon points={`${indexToX(troughIndex)},${priceToY(priceData[troughIndex])} ${indexToX(troughIndex) - 5},${priceToY(priceData[troughIndex]) - 10} ${indexToX(troughIndex) + 5},${priceToY(priceData[troughIndex]) - 10}`} fill="black" />
            <text x={indexToX(troughIndex)} y={priceToY(priceData[troughIndex]) - 35} fontSize="12" fill="black" fontWeight="bold" textAnchor="middle">Investors lose faith in project</text>
          </svg>
        </div>
      </div>
    </div>
  );
};

