import React, { useEffect, useRef, useState } from 'react';
import { API_BASE_URL } from '../config/api';

interface MiniStockChartProps {
  ticker: string;
  width?: number;
  height?: number;
  positive?: boolean;
  period?: string;
  interval?: string;
}

const NewsStockChart: React.FC<MiniStockChartProps> = ({ 
  ticker,
  width = 80, 
  height = 30,
  positive = true,
  period = "1d",
  interval = "1m"
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStockData = async () => {
      if (!ticker) {
        generateRandomChart();
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(
          `${API_BASE_URL}/api/ticker/${ticker}/history?period=${period}&interval=${interval}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch stock data');
        }
        
        const data = await response.json();
        
        if (data.status !== 'success' || !data.data?.history?.length) {
          throw new Error('No historical data available');
        }
        
        drawChart(data.data.history);
      } catch (err) {
        console.error('Error fetching stock data:', err);
        setError('Failed to load stock data');
        generateRandomChart();
      } finally {
        setLoading(false);
      }
    };

    const generateRandomChart = () => {
      const randomData = Array.from({ length: 20 }, (_, i) => {
        const base = 100;
        const noise = (Math.random() - 0.5) * 20;
        return base + (positive ? 1 : -1) * (i * 2 + noise);
      });
      drawChart(randomData.map((value, i) => ({ close: value })));
    };

    const drawChart = (data: any[]) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      
      const scale = window.devicePixelRatio || 1;
      canvas.width = Math.floor(width * scale);
      canvas.height = Math.floor(height * scale);
      ctx.scale(scale, scale);

      ctx.clearRect(0, 0, width, height);

      const closePrices = data.map(item => 
        typeof item === 'number' ? item : item.close
      );

      if (closePrices.length < 2) {
        drawNoData(ctx, width, height);
        return;
      }

      const xStep = width / (closePrices.length - 1);
      const maxY = Math.max(...closePrices);
      const minY = Math.min(...closePrices);
      const yRange = maxY - minY || 1;
      const yScale = (height - 4) / yRange;

      const lineColor = positive ? '#10b981' : '#ef4444';
      const fillColor = positive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)';

      ctx.beginPath();
      closePrices.forEach((value, index) => {
        const x = index * xStep;
        const y = height - (value - minY) * yScale - 2;
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fillStyle = fillColor;
      ctx.fill();

      ctx.beginPath();
      closePrices.forEach((value, index) => {
        const x = index * xStep;
        const y = height - (value - minY) * yScale - 2;
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    };

    const drawNoData = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#9ca3af';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '10px Arial';
      ctx.fillText('No data', width / 2, height / 2);
    };

    fetchStockData();
  }, [ticker, width, height, positive, period, interval]);

  if (error) {
    return (
      <div className="text-xs text-red-500" style={{ width: `${width}px`, height: `${height}px` }}>
        Error
      </div>
    );
  }

  return (
    <canvas 
      ref={canvasRef} 
      width={width} 
      height={height} 
      style={{ 
        width: '100%', 
        height: '100%',
        backgroundColor: '#f9fafb',
        borderRadius: '0.25rem'
      }} 
    />
  );
};

export default NewsStockChart;