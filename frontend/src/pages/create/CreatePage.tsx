import React, { useMemo, useState } from 'react';

interface StrategyResult {
  buy_price: number;
  sell_price: number;
  final_value: number;
  total_return_pct: number;
  series: { date: string; value: number; price: number }[];
}

const strategies = [
  {
    id: 'buy_hold',
    name: 'Buy and Hold (simple)',
    description: 'Buy once and hold until sell date.',
  },
];

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000';

const Chart: React.FC<{ data: { date: string; value: number }[] }> = ({
  data,
}) => {
  const path = useMemo(() => {
    if (!data.length) {
      return '';
    }

    const width = 600;
    const height = 300;
    const values = data.map(point => point.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    const points = data.map((point, index) => {
      const x =
        data.length === 1 ? width / 2 : (index / (data.length - 1)) * width;
      const normalized = (point.value - min) / range;
      const y = height - normalized * height;
      return { x, y };
    });

    return points
      .map((point, index) =>
        `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`
      )
      .join(' ');
  }, [data]);

  if (!data.length) {
    return (
      <div className="flex h-[280px] items-center justify-center rounded-xl bg-white/80 text-sm text-gray-500">
        Run the strategy to see the chart.
      </div>
    );
  }

  return (
    <svg
      className="h-[280px] w-full"
      viewBox="0 0 600 300"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="chart-gradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#DEF693" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#DEF693" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`${path} L 600 300 L 0 300 Z`}
        fill="url(#chart-gradient)"
        stroke="none"
      />
      <path
        d={path}
        fill="none"
        stroke="#B8E994"
        strokeWidth={4}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
};

const CreatePage: React.FC = () => {
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [ticker, setTicker] = useState('AAPL');
  const [buyDate, setBuyDate] = useState('2023-11-08');
  const [sellDate, setSellDate] = useState('2025-07-08');
  const [capital, setCapital] = useState('1000');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<StrategyResult | null>(null);

  const filteredStrategies = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return strategies;
    return strategies.filter(strategy =>
      strategy.name.toLowerCase().includes(term)
    );
  }, [search]);

  const chartData = useMemo(() => {
    if (!result) return [];
    return result.series.map(point => ({
      date: point.date,
      value: point.value,
    }));
  }, [result]);

  const summary = useMemo(() => {
    if (!result) return null;
    return {
      totalReturn: `${result.total_return_pct.toFixed(2)}%`,
      finalValue: `$${result.final_value.toFixed(2)}`,
      buyPrice: `$${result.buy_price.toFixed(2)}`,
      sellPrice: `$${result.sell_price.toFixed(2)}`,
    };
  }, [result]);

  const handleRun = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${API_BASE}/api/strategies/buy_hold`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticker,
          start_date: buyDate,
          end_date: sellDate,
          capital: parseFloat(capital),
        }),
      });

      const data = await response.json();
      if (!response.ok || data.status !== 'success') {
        const message =
          data?.message || 'Unable to run strategy. Please try again.';
        throw new Error(message);
      }

      setResult(data.data);
    } catch (err: any) {
      setError(err?.message || 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  if (!selectedStrategy) {
    return (
      <div className="min-h-screen bg-gray-50 pb-16">
        <div className="mx-auto max-w-5xl px-6 pt-12">
          <div className="rounded-3xl bg-[#FFB8D4] px-8 py-10 text-center shadow-sm">
            <h1 className="text-3xl font-semibold text-gray-800">
              Lookup strategy
            </h1>
          </div>

          <div className="mt-8">
            <input
              type="text"
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Search strategies..."
              className="w-full rounded-full border border-gray-200 bg-white px-6 py-3 text-gray-700 shadow-sm focus:border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-200"
            />
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {filteredStrategies.map(strategy => (
              <div
                key={strategy.id}
                className="rounded-3xl bg-[#DEF693] px-8 py-10 shadow-sm ring-1 ring-gray-100"
              >
                <h2 className="text-xl font-semibold text-gray-800">
                  {strategy.name}
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  {strategy.description}
                </p>
                <button
                  onClick={() => setSelectedStrategy(strategy.id)}
                  className="mt-6 inline-flex items-center rounded-full bg-[#FFB8D4] px-6 py-2 text-sm font-semibold text-gray-800 shadow transition hover:bg-pink-100"
                >
                  Create
                </button>
              </div>
            ))}
            {!filteredStrategies.length && (
              <div className="rounded-3xl bg-white px-8 py-10 text-center text-sm text-gray-500 shadow-sm">
                No strategies match your search yet.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="mx-auto max-w-6xl px-6 pt-12">
        <div className="rounded-3xl bg-[#FFB8D4] px-8 py-10 text-center shadow-sm">
          <h1 className="text-3xl font-semibold text-gray-800">
            Lookup strategy
          </h1>
          <p className="mt-2 text-sm text-gray-700">buy and hold (simple)</p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(360px,1fr)_minmax(480px,1.25fr)]">
          <section className="rounded-3xl bg-[#FFB8D4] p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-800">Inputs</h2>
            <div className="mt-6 space-y-5">
              <div>
                <label className="block text-sm text-gray-700">
                  Ticker (stock of choice)
                </label>
                <input
                  type="text"
                  value={ticker}
                  onChange={event =>
                    setTicker(event.target.value.toUpperCase())
                  }
                  className="mt-2 w-full rounded-md bg-[#DEF693] px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-lime-400"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm text-gray-700">Buy date</label>
                  <input
                    type="date"
                    value={buyDate}
                    onChange={event => setBuyDate(event.target.value)}
                    className="mt-2 w-full rounded-md bg-[#DEF693] px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-lime-400"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700">
                    Sell date
                  </label>
                  <input
                    type="date"
                    value={sellDate}
                    onChange={event => setSellDate(event.target.value)}
                    className="mt-2 w-full rounded-md bg-red-300 px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700">
                  Money invested (capital)
                </label>
                <input
                  type="number"
                  value={capital}
                  onChange={event => setCapital(event.target.value)}
                  className="mt-2 w-full rounded-md bg-[#DEF693] px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-lime-400"
                  min={0}
                  step={100}
                />
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={handleRun}
                disabled={loading}
                className="w-32 rounded-full border border-gray-800 bg-white px-6 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-100 disabled:opacity-60"
              >
                {loading ? 'Running…' : 'Run'}
              </button>
            </div>
            {error && (
              <p className="mt-4 rounded-md bg-white px-4 py-2 text-sm text-red-600">
                {error}
              </p>
            )}
          </section>

          <section className="space-y-6">
            <div className="rounded-3xl bg-[#FFB8D4] p-6 shadow-sm">
              <div className="rounded-xl bg-lime-200 px-4 py-4 text-center text-lg font-semibold text-gray-800">
                Total Return: {summary ? summary.totalReturn : 'TBD'}
              </div>
            </div>

            <div className="rounded-3xl bg-[#FFB8D4] p-6 shadow-sm">
              <Chart data={chartData} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CreatePage;

