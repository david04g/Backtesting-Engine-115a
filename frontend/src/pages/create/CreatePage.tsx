import React, { useMemo, useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import { get_user_progress } from '../../components/apiServices/userApi';

const isWeekday = (date: Date): boolean => {
  const day = date.getDay();
  return day !== 0 && day !== 6;
};

const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const getLatestMarketCloseDate = (): string => {
  const now = new Date();
  let date = new Date(now);
  
  do {
    date.setDate(date.getDate() - 1);
  } while (!isWeekday(date));
  
  return formatDate(date);
};

const getMinDate = (): string => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 20);
  return formatDate(date);
};

interface StrategyResult {
  buy_price: number;
  sell_price: number;
  final_value: number;
  total_return_pct: number;
  short_window?: number;
  long_window?: number;
  contribution?: number;
  total_contributed?: number;
  frequency?: string;
  series: { date: string; value: number; price: number }[];
}

interface SavedStrategy {
  strategy_id: string;
  ticker_name: string;
  strategy_type: string;
  money_invested: number;
  start_date: string;
  end_date: string;
  commission_dollars?: number;
  position_percent?: number;
  metadata: {
    strategy_name?: string;
    short_window?: number;
    long_window?: number;
    frequency?: string;
    contribution?: number;
  };
  created_at: string;
}

const ALL_STRATEGIES = [
  {
    id: 'buy_hold',
    name: 'Buy and Hold (simple)',
    description: 'Buy once and hold until sell date.',
    requiredLevel: 1, // unlocks after completing level 0
  },
  {
    id: 'simple_moving_average_crossover',
    name: 'Simple Moving Average Crossover',
    description: 'Trade based on short vs. long moving average crossovers.',
    requiredLevel: 2, // unlocks after completing level 1
  },
  {
    id: 'dca',
    name: 'Dollar-Cost Averaging (DCA)',
    description: 'Invest a fixed amount at regular intervals.',
    requiredLevel: 3, // unlocks after completing level 2
  },
  {
    id: 'buy_hold_markers',
    name: 'Buy and Hold Advanced',
    description: 'Advanced buy and hold with entry/exit and trading costs',
    requiredLevel: 4,
  }
];

const useAvailableStrategies = () => {
  const [userLevel, setUserLevel] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserLevel = async () => {
      try {
        const userId = localStorage.getItem('user_id');
        console.log('User ID from localStorage:', userId);
        
        if (userId) {
          const progress = await get_user_progress(userId);
          console.log('Progress from API:', progress);
          // If progress exists, use its level, otherwise default to 0
          const level = progress?.level ?? 0;
          console.log('Setting user level to:', level);
          setUserLevel(level);
        } else {
          console.log('No user ID found, setting level to 0');
          setUserLevel(0); // Default to level 0 if not logged in
        }
      } catch (error) {
        console.error('Error fetching user level:', error);
        setUserLevel(0); // Default to level 0 on error
      } finally {
        setLoading(false);
      }
    };

    fetchUserLevel();
  }, []);

  const strategies = useMemo(() => {
    if (loading) return [];
    
    console.log('Available strategies filter - userLevel:', userLevel);
    
    // For level 1, only show requiredLevel 1 (Buy and Hold)
    // For higher levels, show strategies where requiredLevel <= userLevel
    const available = ALL_STRATEGIES.filter(strategy => {
      if (userLevel === 1) {
        return strategy.requiredLevel === 1;
      }
      return userLevel !== null && strategy.requiredLevel <= userLevel;
    });
    
    console.log('Available strategies:', available.map(s => s.name));
    return available;
  }, [userLevel, loading]);

  return { strategies, loading };
};

const Chart: React.FC<{ 
  data: { 
    date: string; 
    value: number; 
    is_entry?: boolean; 
    is_exit?: boolean; 
    price: number 
  }[];
  entryPrice?: string;
  exitPrice?: string;
}> = ({ data, entryPrice, exitPrice }) => {
  const { path, min, max, range } = useMemo(() => {
    if (!data.length) {
      return { path: '', min: 0, max: 0, range: 1 };
    }

    const width = 600;
    const height = 300;
    const values = data.map(point => point.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    const points = data.map((point, index) => {
      const x = data.length === 1 ? width / 2 : (index / (data.length - 1)) * width;
      const normalized = (point.value - min) / range;
      const y = height - normalized * height;
      return { x, y };
    });

    const path = points
      .map((point, index) =>
        `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`
      )
      .join(' ');

    return { path, min, max, range };
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
          <stop offset="0%" stopColor="#84cc16" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#84cc16" stopOpacity="0" />
        </linearGradient>
        
        <marker
          id="entry-arrow"
          viewBox="0 0 10 10"
          refX="5"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#4CAF50" />
        </marker>
        
        <marker
          id="exit-arrow"
          viewBox="0 0 10 10"
          refX="5"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#F44336" />
        </marker>
      </defs>
      
      <path
        d={`${path} L 600 300 L 0 300 Z`}
        fill="url(#chart-gradient)"
        stroke="none"
      />
      
      <path
        d={path}
        fill="none"
        stroke="#84cc16"
        strokeWidth={4}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      
      {(() => {
        const markers = [];
        
        // First, show backend-provided entry/exit points
        const backendMarkers = data
          .filter(point => point.is_entry || point.is_exit)
          .map((point, index) => {
            const dataIndex = data.findIndex(p => p === point);
            const x = data.length === 1 ? 300 : (dataIndex / (data.length - 1)) * 600;
            const y = ((max - point.price) / range) * 300;
            console.log('Backend marker:', point.price);
            
            return (
              <g key={`backend-${point.date}-${index}`}>
                <circle
                  cx={x}
                  cy={y}
                  r="6"
                  fill={point.is_entry ? "#4CAF50" : "#F44336"}
                  stroke="white"
                  strokeWidth="2"
                />
                <text
                  x={x}
                  y={y - 10}
                  textAnchor="middle"
                  fontSize="12"
                  fill={point.is_entry ? "#4CAF50" : "#F44336"}
                  fontWeight="bold"
                >
                  {point.is_entry ? 'BUY' : 'SELL'} ${point.price.toFixed(2)}
                </text>
              </g>
            );
          });
        
        // Then, show user-entered price markers if they exist and are different from backend markers
        if (entryPrice) {
          const entryPriceNum = parseFloat(entryPrice);
          console.log('entryPriceNum:', entryPriceNum);
          if (!isNaN(entryPriceNum)) {
            // Find the data point with portfolio value closest to entry price
            const closestEntryPoint = data.reduce((closest, point, index) => {
              const currentDiff = Math.abs(point.price - entryPriceNum);
              const closestDiff = Math.abs(closest.price - entryPriceNum);
              return currentDiff < closestDiff ? point : closest;
            }, data[0]);
            
            const entryIndex = data.findIndex(p => p === closestEntryPoint);
            const x = data.length === 1 ? 300 : (entryIndex / (data.length - 1)) * 600;
            const y = ((max - closestEntryPoint.value) / range) * 300;
            console.log("value:", closestEntryPoint.value);
            
            markers.push(
              <g key="user-entry-marker">
                <circle
                  cx={x}
                  cy={y}
                  r="6"
                  fill="#4CAF50"
                  stroke="white"
                  strokeWidth="2"
                />
                <text
                  x={x}
                  y={y - 10}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#4CAF50"
                  fontWeight="bold"
                >
                  BUY ${closestEntryPoint.price.toFixed(2)}
                </text>
              </g>
            );
          }
        }
        
        if (exitPrice) {
          const exitPriceNum = parseFloat(exitPrice);
          if (!isNaN(exitPriceNum)) {
            // Find the data point with portfolio value closest to exit price
            const closestExitPoint = data.reduce((closest, point, index) => {
              const currentDiff = Math.abs(point.price - exitPriceNum);
              const closestDiff = Math.abs(closest.price - exitPriceNum);
              return currentDiff < closestDiff ? point : closest;
            }, data[0]);
            
            const exitIndex = data.findIndex(p => p === closestExitPoint);
            const x = data.length === 1 ? 300 : (exitIndex / (data.length - 1)) * 600;
            const y = ((max - closestExitPoint.value) / range) * 300;
            console.log('value:', closestExitPoint.value);
            
            markers.push(
              <g key="user-exit-marker">
                <circle
                  cx={x}
                  cy={y}
                  r="6"
                  fill="#F44336"
                  stroke="white"
                  strokeWidth="2"
                />
                <text
                  x={x}
                  y={y - 10}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#F44336"
                  fontWeight="bold"
                >
                  SELL ${closestExitPoint.price.toFixed(2)}
                </text>
              </g>
            );
          }
        }
        console.log("markers:", markers);
        return [...backendMarkers, ...markers];
      })()}
    </svg>
  );
};
const CreatePage: React.FC = () => {
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [ticker, setTicker] = useState('AAPL');
  const getDefaultBuyDate = (): string => {
    const latestClose = new Date(getLatestMarketCloseDate());
    latestClose.setFullYear(latestClose.getFullYear() - 3);
    while (!isWeekday(latestClose)) {
      latestClose.setDate(latestClose.getDate() - 1);
    }
    return formatDate(latestClose);
  };

  const [buyDate, setBuyDate] = useState(getDefaultBuyDate());
  const [sellDate, setSellDate] = useState(getLatestMarketCloseDate());
  const [capital, setCapital] = useState('1000');
  const [loading, setLoading] = useState(false);

  const [shortWindow, setShortWindow] = useState('100');
  const [longWindow, setLongWindow] = useState('250');

  const [frequency, setFrequency] = useState('monthly');
  const [contribution, setContribution] = useState('');

  const [commission, setCommission] = useState('0');
  const [positionPercent, setPositionPercent] = useState('100');

  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<StrategyResult | null>(null);

  const [strategyName, setStrategyName] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [savedStrategies, setSavedStrategies] = useState<SavedStrategy[]>([]);
  const [showSavedStrategies, setShowSavedStrategies] = useState(false);
  const [loadingSavedStrategies, setLoadingSavedStrategies] = useState(false);

  const [news, setNews] = useState<Array<{
    title: string;
    publisher: string;
    link: string;
    publish_time?: number;
    type?: string;
  }>>([]);

  const [newsError, setNewsError] = useState<string | null>(null);
  const { strategies, loading: strategiesLoading } = useAvailableStrategies();

  const [entryPrice, setEntryPrice] = useState('');
  const [exitPrice, setExitPrice] = useState('');

  const filteredStrategies = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return strategies;
    const filtered = strategies.filter(strategy =>
      strategy.name.toLowerCase().includes(term)
    );
    return filtered;
  }, [search, strategies]);

  const chartData = useMemo(() => {
    if (!result?.series) return [];
    
    console.log('Raw result.series:', result.series);
    
    const mappedData = result.series.map(point => ({
      date: point.date,
      value: point.value,
      is_entry: point.is_entry || false,
      is_exit: point.is_exit || false,
      price: point.price
    }));
    
    console.log('Mapped chartData:', mappedData);
    console.log('Entry/Exit points:', mappedData.filter(p => p.is_entry || p.is_exit));
    
    return mappedData;
  }, [result]);

  const getUserId = () => {
    const userId = localStorage.getItem('user_id');
    if (userId && userId !== 'null' && userId !== 'undefined') {
      return userId;
    }
    return null;
  };

  useEffect(() => {
    const fetchSavedStrategies = async () => {
      const userId = getUserId();
      if (!userId) return;

      setLoadingSavedStrategies(true);
      try {
        const response = await fetch(API_ENDPOINTS.STRATEGIES.GET_USER_STRATEGIES(userId));
        const data = await response.json();
        if (data.status === 'success') {
          setSavedStrategies(data.data);
        }
      } catch (err) {
        console.error('Error fetching saved strategies:', err);
      } finally {
        setLoadingSavedStrategies(false);
      }
    };

    fetchSavedStrategies();
  }, []);

  useEffect(() => {
    setResult(null);
    setError(null);
    setSaveSuccess(false);
    setSaveError(null);
  }, [selectedStrategy]);

  useEffect(() => {
    const fetchNews = async () => {
      if (!ticker || !ticker.trim()) {
        setNews([]);
        return;
      }

      setLoading(true);
      setNewsError(null);
      
      try {
        const url = API_ENDPOINTS.GET_TICKER_NEWS(ticker.toUpperCase());
        
        const response = await fetch(url);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status === 'success') {
          const newsItems = Array.isArray(data.data) ? data.data : [];
          setNews(newsItems);
          
          if (newsItems.length === 0) {
            setNewsError('No recent news found for this ticker.');
          }
        } else {
          throw new Error(data.message || 'Failed to load news');
        }
      } catch (err) {
        const errorMessage = 'Failed to load news. ' + (err instanceof Error ? err.message : '');
        console.error('Error in fetchNews:', errorMessage, err);
        setNewsError(errorMessage);
        setNews([]);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchNews();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [ticker]);

  const summary = useMemo(() => {
    if (!result) return null;
    
    if (result.total_return_pct === undefined || result.final_value === undefined) {
      return null;
    }

    const base = {
      totalReturn: `${result.total_return_pct.toFixed(2)}%`,
      finalValue: `$${result.final_value.toFixed(2)}`,
    };

    if (selectedStrategy === 'buy_hold') {
      if (result.buy_price !== undefined && result.sell_price !== undefined) {
        return {
          ...base,
          buyPrice: `$${result.buy_price.toFixed(2)}`,
          sellPrice: `$${result.sell_price.toFixed(2)}`,
        };
      }
    } else if (selectedStrategy === 'simple_moving_average_crossover') {
      return {
        ...base,
        shortWindow: result.short_window,
        longWindow: result.long_window,
      };
    } else if (selectedStrategy === 'dca') {
      return {
        ...base,
        frequency: result.frequency,
        contribution: result.contribution ? `$${result.contribution.toFixed(2)}` : 'N/A',
        totalContrib: result.total_contributed ? `$${result.total_contributed.toFixed(2)}` : 'N/A',
      };
    } else if (selectedStrategy === 'buy_hold_markers') {
      return {
        ...base,
        buyPrice: result.buy_price ? `$${result.buy_price.toFixed(2)}` : 'N/A',
        sellPrice: result.sell_price ? `$${result.sell_price.toFixed(2)}` : 'N/A',
        commission: result.commission_dollars ? `$${result.commission_dollars.toFixed(2)}` : 'N/A',
        positionPercent: result.position_percent ? `${result.position_percent}%` : '100%',
      };
    }

    return base;
  }, [result, selectedStrategy]);

  const handleRun = async () => {
    if (!selectedStrategy) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let endpoint: string;
      switch (selectedStrategy) {
        case 'buy_hold':
          endpoint = API_ENDPOINTS.STRATEGIES.BUY_HOLD;
          break;
        case 'simple_moving_average_crossover':
          endpoint = API_ENDPOINTS.STRATEGIES.SIMPLE_MOVING_AVERAGE_CROSSOVER;
          break;
        case 'dca':
          endpoint = API_ENDPOINTS.STRATEGIES.DCA;
          break;
        case 'buy_hold_markers':
          endpoint = API_ENDPOINTS.STRATEGIES.BUY_HOLD_MARKERS;
          break;
        default:
          throw new Error('Unknown strategy');
      }
      
      const body: Record<string, any> = {
        ticker,
        start_date: buyDate,
        end_date: sellDate,
        capital: parseFloat(capital),
      };

      if (selectedStrategy === 'simple_moving_average_crossover') {
        body.short_window = parseInt(shortWindow, 10);
        body.long_window = parseInt(longWindow, 10);
      }

      if (selectedStrategy === 'dca') {
        body.frequency = frequency;
        if (contribution.trim() !== '') {
          body.contribution = parseFloat(contribution);
        }
      }

      if (selectedStrategy === 'buy_hold_markers') {
        body.commission_dollars = parseFloat(commission) || 0;
        body.position_percent = Math.min(Math.max(parseFloat(positionPercent) || 100, 0), 100);
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server returned an invalid response. Please try again later.');
      }

      const data = await response.json();
      
      if (!response.ok || data.status !== 'success') {
        throw new Error(data?.message || 'Unable to run strategy.');
      }

      setResult(data.data);
    } catch (err: any) {
      console.error('Error running strategy:', err);
      setError(err?.message || 'An unexpected error occurred. Please check the console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStrategy = async () => {
    const userId = getUserId();
    if (!userId) {
      setSaveError('Please log in to save strategies');
      return;
    }

    if (!selectedStrategy) {
      setSaveError('No strategy selected');
      return;
    }

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const metadata: Record<string, any> = {};
      
      if (strategyName.trim()) {
        metadata.strategy_name = strategyName.trim();
      }

      if (selectedStrategy === 'simple_moving_average_crossover') {
        metadata.short_window = parseInt(shortWindow, 10);
        metadata.long_window = parseInt(longWindow, 10);
      }

      if (selectedStrategy === 'dca') {
        metadata.frequency = frequency;
        if (contribution.trim() !== '') {
          metadata.contribution = parseFloat(contribution);
        }
      }

      const body = {
        user_id: userId,
        strategy_name: strategyName.trim() || `${ticker} ${selectedStrategy}`,
        ticker: ticker,
        strategy_type: selectedStrategy,
        capital: parseFloat(capital),
        start_date: buyDate,
        end_date: sellDate,
        commission_dollars: parseFloat(commission) || 0,
        position_percent: Math.min(Math.max(parseFloat(positionPercent) || 100, 0), 100),
        metadata: metadata,
      };

      const response = await fetch(API_ENDPOINTS.STRATEGIES.SAVE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok || data.status !== 'success') {
        throw new Error(data?.message || 'Unable to save strategy.');
      }

      setSaveSuccess(true);
      setStrategyName('');
      
      const strategiesResponse = await fetch(API_ENDPOINTS.STRATEGIES.GET_USER_STRATEGIES(userId));
      const strategiesData = await strategiesResponse.json();
      if (strategiesData.status === 'success') {
        setSavedStrategies(strategiesData.data);
      }

      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err?.message || 'Unexpected error');
    } finally {
      setSaving(false);
    }
  };

  const handleLoadStrategy = (strategy: SavedStrategy) => {
    setResult(null);
    setError(null);
    setSaveSuccess(false);
    setSaveError(null);

    setTicker(strategy.ticker_name);
    setBuyDate(strategy.start_date);
    setSellDate(strategy.end_date);
    setCapital(strategy.money_invested.toString());
    
    if (strategy.metadata) {
      if (strategy.metadata.short_window) {
        setShortWindow(strategy.metadata.short_window.toString());
      }
      if (strategy.metadata.long_window) {
        setLongWindow(strategy.metadata.long_window.toString());
      }
      if (strategy.metadata.frequency) {
        setFrequency(strategy.metadata.frequency);
      }
      if (strategy.metadata.contribution) {
        setContribution(strategy.metadata.contribution.toString());
      }
    }

    if (strategy.commission_dollars) {
      setCommission(strategy.commission_dollars.toString());
    }

    if (strategy.position_percent) {
      setPositionPercent(strategy.position_percent.toString());
    }

    setSelectedStrategy(strategy.strategy_type);
    setShowSavedStrategies(false);
  };

  const handleDeleteStrategy = async (strategyId: string) => {
    if (!window.confirm('Are you sure you want to delete this strategy?')) {
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.STRATEGIES.DELETE(strategyId), {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.status === 'success') {
        setSavedStrategies(prev => prev.filter(s => s.strategy_id !== strategyId));
      } else {
        alert('Failed to delete strategy: ' + (data.message || 'Unknown error'));
      }
    } catch (err: any) {
      alert('Error deleting strategy: ' + (err?.message || 'Unknown error'));
    }
  };

  if (!selectedStrategy) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex-1 pb-16">
          <div className="mx-auto max-w-5xl px-6 pt-12">
          <div className="rounded-3xl bg-pink-200 px-8 py-10 text-center shadow-sm">
            <h1 className="text-3xl font-semibold text-gray-800">
              Lookup strategy
            </h1>
          </div>

          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <input
              type="text"
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Search strategies..."
              className="flex-1 rounded-full border border-gray-200 bg-white px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base text-gray-700 shadow-sm focus:border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-200"
            />
            <button
              onClick={() => setShowSavedStrategies(true)}
              className="rounded-full bg-lime-300 px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-gray-800 shadow transition hover:bg-lime-200 whitespace-nowrap"
            >
              My Strategies ({savedStrategies.length})
            </button>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {filteredStrategies.map(strategy => (
              <div
                key={strategy.id}
                className="rounded-3xl bg-white px-8 py-10 shadow-sm ring-1 ring-gray-100"
              >
                <h2 className="text-xl font-semibold text-gray-800">
                  {strategy.name}
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  {strategy.description}
                </p>
                <button
                  onClick={() => setSelectedStrategy(strategy.id)}
                  className="mt-6 inline-flex items-center rounded-full bg-lime-300 px-6 py-2 text-sm font-semibold text-gray-800 shadow transition hover:bg-lime-200"
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

        {showSavedStrategies && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="max-h-[80vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-8 shadow-xl">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-800">
                  My Saved Strategies
                </h2>
                <button
                  onClick={() => setShowSavedStrategies(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {loadingSavedStrategies ? (
                <div className="py-8 text-center text-gray-500">Loading...</div>
              ) : savedStrategies.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  No saved strategies yet. Create and save a strategy to see it here!
                </div>
              ) : (
                <div className="space-y-4">
                  {savedStrategies.map(strategy => (
                    <div
                      key={strategy.strategy_id}
                      className="rounded-2xl bg-gray-50 p-6 shadow-sm ring-1 ring-gray-100"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-800">
                            {strategy.metadata?.strategy_name || `${strategy.ticker_name} ${strategy.strategy_type}`}
                          </h3>
                          <div className="mt-2 space-y-1 text-sm text-gray-600">
                            <p>Ticker: {strategy.ticker_name}</p>
                            <p>Strategy: {strategies.find(s => s.id === strategy.strategy_type)?.name || strategy.strategy_type}</p>
                            <p>Capital: ${strategy.money_invested}</p>
                            <p>Period: {strategy.start_date} to {strategy.end_date}</p>
                            {strategy.metadata?.short_window && (
                              <p>Windows: {strategy.metadata.short_window} / {strategy.metadata.long_window}</p>
                            )}
                            {strategy.metadata?.frequency && (
                              <p>Frequency: {strategy.metadata.frequency}</p>
                            )}
                            {strategy.commission_dollars && (
                              <p>Commission: ${strategy.commission_dollars}</p>
                            )}
                            {strategy.position_percent && (
                              <p>Position Size: {strategy.position_percent}%</p>
                            )}
                          </div>
                        </div>
                        <div className="ml-4 flex flex-col gap-2">
                          <button
                            onClick={() => handleLoadStrategy(strategy)}
                            className="rounded-full bg-lime-300 px-4 py-2 text-sm font-semibold text-gray-800 shadow transition hover:bg-lime-200"
                          >
                            Load
                          </button>
                          <button
                            onClick={() => handleDeleteStrategy(strategy.strategy_id)}
                            className="rounded-full bg-red-300 px-4 py-2 text-sm font-semibold text-gray-800 shadow transition hover:bg-red-200"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        </div>
      </div>
  );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex-1 pb-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-8 sm:pt-12">
        <div className="rounded-3xl bg-pink-200 px-4 py-6 sm:px-8 sm:py-10 shadow-sm">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <button
              onClick={() => setSelectedStrategy(null)}
              className="rounded-full bg-white px-4 py-2 text-xs sm:text-sm font-semibold text-gray-800 shadow transition hover:bg-gray-100"
            >
              ← Back
            </button>
            <button
              onClick={() => setShowSavedStrategies(true)}
              className="rounded-full bg-lime-300 px-4 py-2 text-xs sm:text-sm font-semibold text-gray-800 shadow transition hover:bg-lime-200"
            >
              My Strategies ({savedStrategies.length})
            </button>
          </div>
          <h1 className="mt-4 text-center text-2xl sm:text-3xl font-semibold text-gray-800">
            Lookup strategy
          </h1>
          <p className="mt-2 text-center text-xs sm:text-sm text-gray-700">
            {strategies.find(s => s.id === selectedStrategy)?.name}
          </p>
        </div>

        <div className="mt-6 sm:mt-10 grid gap-6 sm:gap-8 lg:grid-cols-[minmax(360px,1fr)_minmax(480px,1.25fr)]">
          <section className="rounded-3xl bg-pink-200 p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-800">Inputs</h2>
            <div className="mt-6 space-y-5">
              {selectedStrategy === 'simple_moving_average_crossover' && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm text-gray-700">
                      Short Moving Average Window
                    </label>
                    <input
                      type="number"
                      value={shortWindow}
                      onChange={e => setShortWindow(e.target.value)}
                      className="mt-2 w-full rounded-md bg-lime-200 px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-lime-400"
                      min={1}
                      step={1}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700">
                      Long Moving Average Window
                    </label>
                    <input
                      type="number"
                      value={longWindow}
                      onChange={e => setLongWindow(e.target.value)}
                      className="mt-2 w-full rounded-md bg-red-300 px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-200"
                      min={1}
                      step={1}
                    />
                  </div>
                </div>
              )}
              {selectedStrategy === 'dca' && (
                <>
                  <div>
                    <label className="block text-sm text-gray-700">
                      Buy Frequency
                    </label>
                    <select
                      value={frequency}
                      onChange={e => setFrequency(e.target.value)}
                      className="mt-2 w-full rounded-md bg-lime-200 px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-lime-400"
                    >
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Biweekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700">
                      Contribution per Buy (optional)
                    </label>
                    <input
                      type="number"
                      value={contribution}
                      onChange={e => setContribution(e.target.value)}
                      placeholder="If empty, capital will be split evenly"
                      className="mt-2 w-full rounded-md bg-lime-200 px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-lime-400"
                      min={0}
                      step={10}
                    />
                  </div>
                </>
              )}

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
                  className="mt-2 w-full rounded-md bg-lime-200 px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-lime-400"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm text-gray-700">Buy date</label>
                  <input
                    type="date"
                    value={buyDate}
                    min={getMinDate()}
                    max={(() => {
                      const maxDate = new Date(sellDate);
                      maxDate.setDate(maxDate.getDate() - 1);
                      while (!isWeekday(maxDate)) {
                        maxDate.setDate(maxDate.getDate() - 1);
                      }
                      return formatDate(maxDate);
                    })()}
                    onChange={event => {
                      const selectedDate = event.target.value;
                      const date = new Date(selectedDate);
                      const sellDateObj = new Date(sellDate);
                      
                      if (date >= sellDateObj) {
                        const nextDay = new Date(date);
                        nextDay.setDate(nextDay.getDate() + 1);
                        while (!isWeekday(nextDay)) {
                          nextDay.setDate(nextDay.getDate() + 1);
                        }
                        setSellDate(formatDate(nextDay));
                      }
                      
                      if (isWeekday(date)) {
                        setBuyDate(selectedDate);
                      } else {
                        const prevDate = new Date(date);
                        do {
                          prevDate.setDate(prevDate.getDate() - 1);
                        } while (!isWeekday(prevDate));
                        const formattedDate = formatDate(prevDate);
                        setBuyDate(formattedDate);
                        
                        if (prevDate >= new Date(sellDate)) {
                          const nextDay = new Date(prevDate);
                          nextDay.setDate(nextDay.getDate() + 1);
                          while (!isWeekday(nextDay)) {
                            nextDay.setDate(nextDay.getDate() + 1);
                          }
                          setSellDate(formatDate(nextDay));
                        }
                      }
                    }}
                    className={`mt-2 w-full rounded-md px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 ${
                      !isWeekday(new Date(buyDate)) 
                        ? 'bg-yellow-100 focus:ring-yellow-400' 
                        : 'bg-lime-200 focus:ring-lime-400'
                    }`}
                  />
                  {!isWeekday(new Date(buyDate)) && (
                    <p className="mt-1 text-xs text-yellow-600">
                      Date adjusted to previous business day
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-700">
                    Sell date
                  </label>
                  <input
                    type="date"
                    value={sellDate}
                    min={(() => {
                      const minDate = new Date(buyDate);
                      minDate.setDate(minDate.getDate() + 1);
                      while (!isWeekday(minDate)) {
                        minDate.setDate(minDate.getDate() + 1);
                      }
                      return formatDate(minDate);
                    })()}
                    max={getLatestMarketCloseDate()}
                    onChange={event => {
                      const selectedDate = event.target.value;
                      const date = new Date(selectedDate);
                      const buyDateObj = new Date(buyDate);
                      
                      if (date <= buyDateObj) {
                        const nextDay = new Date(buyDateObj);
                        nextDay.setDate(nextDay.getDate() + 1);
                        while (!isWeekday(nextDay)) {
                          nextDay.setDate(nextDay.getDate() + 1);
                        }
                        setSellDate(formatDate(nextDay));
                        return;
                      }
                      
                      if (isWeekday(date)) {
                        setSellDate(selectedDate);
                      } else {
                        const nextDate = new Date(date);
                        do {
                          nextDate.setDate(nextDate.getDate() + 1);
                        } while (!isWeekday(nextDate));
                        setSellDate(formatDate(nextDate));
                      }
                    }}
                    className={`mt-2 w-full rounded-md px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 ${
                      !isWeekday(new Date(sellDate)) 
                        ? 'bg-yellow-100 focus:ring-yellow-400' 
                        : 'bg-red-300 focus:ring-red-200'
                    }`}
                  />
                  {!isWeekday(new Date(sellDate)) && (
                    <p className="mt-1 text-xs text-yellow-600">
                      Date adjusted to previous business day
                    </p>
                  )}
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
                  className="mt-2 w-full rounded-md bg-lime-200 px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-lime-400"
                  min={0}
                  step={100}
                />
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <button
                onClick={handleRun}
                disabled={loading}
                className="w-full rounded-full border border-gray-800 bg-white px-6 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-100 disabled:opacity-60"
              >
                {loading ? 'Running…' : 'Run'}
              </button>

              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <h3 className="mb-3 text-sm font-semibold text-gray-700">
                  Save This Strategy
                </h3>
                <input
                  type="text"
                  value={strategyName}
                  onChange={e => setStrategyName(e.target.value)}
                  placeholder="Strategy name (optional)"
                  className="mb-3 w-full rounded-md border border-gray-200 bg-white px-4 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-lime-400"
                />
                <button
                  onClick={handleSaveStrategy}
                  disabled={saving || savedStrategies.length >= 5}
                  className="w-full rounded-full bg-lime-300 px-6 py-2 text-sm font-semibold text-gray-800 shadow transition hover:bg-lime-200 disabled:opacity-60"
                  title={savedStrategies.length >= 5 ? 'Maximum 5 strategies allowed' : ''}
                >
                  {saving ? 'Saving…' : 'Save Strategy'}
                </button>
                {savedStrategies.length >= 5 && (
                  <p className="mt-2 text-xs text-red-600">
                    Maximum limit of 5 strategies reached. Delete a strategy to save a new one.
                  </p>
                )}
              </div>

              {saveSuccess && (
                <p className="rounded-md bg-lime-100 px-4 py-2 text-sm text-green-700">
                  Strategy saved successfully!
                </p>
              )}
              {saveError && (
                <p className="rounded-md bg-red-100 px-4 py-2 text-sm text-red-600">
                  {saveError}
                </p>
              )}
            </div>

            {error && (
              <p className="mt-4 rounded-md bg-white px-4 py-2 text-sm text-red-600">
                {error}
              </p>
            )}
          </section>

          <section className="space-y-6">
            <div className="rounded-3xl bg-pink-200 p-6 shadow-sm">
              <div className="rounded-xl bg-lime-200 px-4 py-4 text-center text-lg font-semibold text-gray-800">
                Total Return: {summary ? summary.totalReturn : 'TBD'}
              </div>
            </div>

            {summary && selectedStrategy === 'dca' && (
              <div className="rounded-3xl bg-pink-200 p-6 shadow-sm text-gray-800 text-sm space-y-2">
                <p>Final Value: {summary.finalValue}</p>
                <p>Total Contributed: {summary.totalContrib}</p>
                <p>Contribution Each: {summary.contribution}</p>
                <p>Frequency: {summary.frequency}</p>
              </div>
            )}
            {selectedStrategy === 'buy_hold_markers' && (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm text-gray-700">
                      Entry Price ($)
                    </label>
                    <input
                      type="number"
                      value={entryPrice}
                      onChange={e => setEntryPrice(e.target.value)}
                      placeholder="Leave empty for market open"
                      className="mt-2 w-full rounded-md bg-green-100 px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700">
                      Exit Price ($)
                    </label>
                    <input
                      type="number"
                      value={exitPrice}
                      onChange={e => setExitPrice(e.target.value)}
                      placeholder="Leave empty for market close"
                      className="mt-2 w-full rounded-md bg-red-100 px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-300"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm text-gray-700">
                      Commission per Trade ($)
                    </label>
                    <input
                      type="number"
                      value={commission}
                      onChange={e => setCommission(e.target.value)}
                      placeholder="e.g., 5.00"
                      className="mt-2 w-full rounded-md bg-blue-100 px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700">
                      Position Size (% of Capital)
                    </label>
                    <input
                      type="number"
                      value={positionPercent}
                      onChange={e => setPositionPercent(e.target.value)}
                      className="mt-2 w-full rounded-md bg-purple-100 px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-300"
                      min="1"
                      max="100"
                      step="1"
                    />
                  </div>
                </div>
              </div>
            )}
            <div className="rounded-3xl bg-pink-200 p-6 shadow-sm">
              <Chart data={chartData} entryPrice={entryPrice} exitPrice={exitPrice} />
            </div>
          </section>
        </div>

        <section className="mt-10">
          <div className="rounded-3xl bg-pink-200 p-6 shadow-sm">
            <h2 className="mb-4 text-2xl font-semibold text-gray-800">
              Latest News for {ticker.toUpperCase()}
            </h2>
              {loading ? (
                <div className="py-8 text-center text-gray-600">
                  Loading news...
                </div>
              ) : newsError ? (
                <div className="py-4 text-center text-red-600">
                  Error: {newsError}
                </div>
              ) : news.length === 0 ? (
                <div className="py-8 text-center text-gray-600">
                  No news articles available for this ticker.
                </div>
              ) : (
              <div className="space-y-4">
                {news.slice(0, 10).map((article, index) => (
                  <div
                    key={index}
                    className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100 transition hover:shadow-md"
                  >
                    <a
                      href={article.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <h3 className="text-lg font-semibold text-gray-800 hover:text-pink-600">
                        {article.title}
                      </h3>
                        <div className="mt-2 flex items-center gap-3 text-sm text-gray-600">
                          <span className="font-medium">{article.publisher || 'Unknown source'}</span>
                          {article.publish_time && (
                            <span>
                              {new Date(article.publish_time * 1000).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {showSavedStrategies && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="max-h-[80vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-8 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-800">
                My Saved Strategies
              </h2>
              <button
                onClick={() => setShowSavedStrategies(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {loadingSavedStrategies ? (
              <div className="py-8 text-center text-gray-500">Loading...</div>
            ) : savedStrategies.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                No saved strategies yet. Create and save a strategy to see it here!
              </div>
            ) : (
              <div className="space-y-4">
                {savedStrategies.map(strategy => (
                  <div
                    key={strategy.strategy_id}
                    className="rounded-2xl bg-gray-50 p-6 shadow-sm ring-1 ring-gray-100"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {strategy.metadata?.strategy_name || `${strategy.ticker_name} ${strategy.strategy_type}`}
                        </h3>
                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                          <p>Ticker: {strategy.ticker_name}</p>
                          <p>Strategy: {strategies.find(s => s.id === strategy.strategy_type)?.name || strategy.strategy_type}</p>
                          <p>Capital: ${strategy.money_invested}</p>
                          <p>Period: {strategy.start_date} to {strategy.end_date}</p>
                          {strategy.metadata?.short_window && (
                            <p>Windows: {strategy.metadata.short_window} / {strategy.metadata.long_window}</p>
                          )}
                          {strategy.metadata?.frequency && (
                            <p>Frequency: {strategy.metadata.frequency}</p>
                          )}
                        </div>
                      </div>
                      <div className="ml-4 flex flex-col gap-2">
                        <button
                          onClick={() => handleLoadStrategy(strategy)}
                          className="rounded-full bg-lime-300 px-4 py-2 text-sm font-semibold text-gray-800 shadow transition hover:bg-lime-200"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => handleDeleteStrategy(strategy.strategy_id)}
                          className="rounded-full bg-red-300 px-4 py-2 text-sm font-semibold text-gray-800 shadow transition hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
        </div>
      </div>
  );
};

export default CreatePage;