import React, { useEffect, useRef } from 'react';

const StockChart: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 500;
    canvas.height = 300;

    // Generate sample stock data
    const dataPoints = 60;
    const data: number[] = [];
    let price = 100;
    
    for (let i = 0; i < dataPoints; i++) {
      price += (Math.random() - 0.48) * 5;
      data.push(Math.max(50, Math.min(150, price)));
    }

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = (canvas.height / 5) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw chart line
    const xStep = canvas.width / (dataPoints - 1);
    const yScale = canvas.height / 100;
    const yOffset = 50;

    ctx.strokeStyle = '#84cc16';
    ctx.lineWidth = 3;
    ctx.beginPath();

    data.forEach((value, index) => {
      const x = index * xStep;
      const y = canvas.height - (value - yOffset) * yScale;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw area under line
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.closePath();
    ctx.fillStyle = 'rgba(132, 204, 22, 0.1)';
    ctx.fill();

  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Sample Strategy</h3>
          <p className="text-2xl font-bold text-gray-800">+24.5%</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Sharpe Ratio</p>
          <p className="text-lg font-semibold text-gray-800">1.8</p>
        </div>
      </div>
      <canvas ref={canvasRef} className="w-full h-auto" />
      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
        <span>Jan 2024</span>
        <span>Dec 2024</span>
      </div>
    </div>
  );
};

export default StockChart;