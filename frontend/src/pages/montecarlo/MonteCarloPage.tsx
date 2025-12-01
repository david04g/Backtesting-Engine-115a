import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SidebarSimple from '../../components/SidebarSimple';
import { API_ENDPOINTS } from '../../config/api';

// Tooltip component
const Tooltip: React.FC<{ text: string }> = ({ text }) => {
  const [show, setShow] = useState(false);
  
  return (
    <div className="relative inline-block ml-1">
      <button
        type="button"
        className="text-gray-400 hover:text-gray-600 focus:outline-none"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
      >
        <svg
          className="w-4 h-4"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {show && (
        <div className="absolute z-50 w-64 p-2 text-xs text-white bg-gray-800 rounded-lg shadow-lg bottom-full left-1/2 transform -translate-x-1/2 mb-2">
          {text}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
            <div className="border-4 border-transparent border-t-gray-800"></div>
          </div>
        </div>
      )}
    </div>
  );
};

interface Strategy {
  strategy_id: string;
  ticker_name: string;
  strategy_type: string;
  money_invested: number;
  start_date: string;
  end_date: string;
  metadata: {
    strategy_name?: string;
    short_window?: number;
    long_window?: number;
    frequency?: string;
    contribution?: number;
    entry_price?: number;
    exit_price?: number;
    position_percent?: number;
    commission_dollars?: number;
  };
  created_at?: string;
}

interface MonteCarloResult {
  strategy_id: string;
  strategy_type: string;
  ticker: string;
  initial_capital: number;
  mode: string;
  horizon_days: number;
  num_simulations: number;
  statistics: {
    mean_final_capital: number;
    std_final_capital: number;
    min_final_capital: number;
    max_final_capital: number;
    percentiles: {
      p10: number;
      p25: number;
      p50: number;
      p75: number;
      p90: number;
    };
    return_percentiles: {
      p10: number;
      p25: number;
      p50: number;
      p75: number;
      p90: number;
    };
    probability_of_loss: number;
  };
  distribution: {
    final_capitals: number[];
    returns: number[];
  };
}

const MonteCarloPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const strategyIdParam = searchParams.get('strategy_id');

  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [mode, setMode] = useState<'historical_bootstrap' | 'forward_sim'>('historical_bootstrap');
  const [horizonDays, setHorizonDays] = useState<number>(252);
  const [horizonYears, setHorizonYears] = useState<number>(1);
  const [numSimulations, setNumSimulations] = useState<number>(1000);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MonteCarloResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStrategies();
  }, []);

  useEffect(() => {
    if (strategyIdParam && strategies.length > 0) {
      const strategy = strategies.find(s => s.strategy_id === strategyIdParam);
      if (strategy) {
        setSelectedStrategy(strategy);
      }
    }
  }, [strategyIdParam, strategies]);

  const fetchStrategies = async () => {
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) {
        navigate('/');
        return;
      }

      const response = await fetch(API_ENDPOINTS.STRATEGIES.GET_USER_STRATEGIES(userId));
      const data = await response.json();

      if (data.status === 'success') {
        // Show all strategies (same as create tab), but we'll indicate eligibility
        setStrategies(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching strategies:', err);
      setError('Failed to load strategies');
    }
  };

  const handleRunSimulation = async () => {
    if (!selectedStrategy) {
      setError('Please select a strategy');
      return;
    }

    if (!isEligibleForMonteCarlo(selectedStrategy.strategy_type)) {
      setError('The selected strategy is not eligible for Monte Carlo simulation. Only SMA Crossover, DCA, Buy & Hold Advanced, and Value Averaging strategies are supported.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const userId = localStorage.getItem('user_id');
      const response = await fetch(API_ENDPOINTS.MONTE_CARLO.RUN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategy_id: selectedStrategy.strategy_id,
          user_id: userId,  // Include for security validation
          mode,
          horizon_days: horizonDays,
          num_simulations: numSimulations,
        }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        setResult(data.data);
      } else {
        setError(data.message || 'Simulation failed');
      }
    } catch (err) {
      console.error('Error running simulation:', err);
      setError('Failed to run simulation');
    } finally {
      setLoading(false);
    }
  };

  const handleHorizonYearsChange = (years: number) => {
    setHorizonYears(years);
    setHorizonDays(Math.round(years * 252));
  };

  const formatStrategyType = (type: string): string => {
    const map: { [key: string]: string } = {
      simple_moving_average_crossover: 'SMA Crossover',
      dca: 'Dollar Cost Averaging',
      buy_hold_markers: 'Buy & Hold Advanced',
      buy_hold: 'Buy & Hold (simple)',
      value_averaging: 'Value Averaging',
    };
    return map[type] || type;
  };

  const isEligibleForMonteCarlo = (strategyType: string): boolean => {
    return ['simple_moving_average_crossover', 'dca', 'buy_hold_markers', 'value_averaging'].includes(strategyType);
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 flex">
      <SidebarSimple active="montecarlo" />
      <div className="flex-1 flex flex-col">
        <div className="px-12 pt-10 pb-8 border-b border-black/10 bg-white">
          <div className="text-3xl font-bold">Monte Carlo Simulation</div>
          <div className="mt-2 text-sm text-gray-600">
            Simulate hypothetical future performance of your saved strategies
          </div>
        </div>

        <div className="flex-1 px-12 py-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {/* Strategy Selection */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Select Strategy</h2>
              {strategies.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  No saved strategies found. Save a strategy first.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {strategies.map((strategy) => {
                    const eligible = isEligibleForMonteCarlo(strategy.strategy_type);
                    const strategyName = strategy.metadata?.strategy_name || 
                      `${strategy.ticker_name} ${formatStrategyType(strategy.strategy_type)}`;
                    
                    return (
                      <button
                        key={strategy.strategy_id}
                        onClick={() => {
                          if (eligible) {
                            setSelectedStrategy(strategy);
                          }
                        }}
                        disabled={!eligible}
                        className={`p-4 rounded-lg border-2 transition-all text-left relative ${
                          !eligible
                            ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                            : selectedStrategy?.strategy_id === strategy.strategy_id
                            ? 'border-pink-500 bg-pink-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {!eligible && (
                          <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                            Not eligible
                          </div>
                        )}
                        <div className="font-semibold">{strategy.ticker_name}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          {formatStrategyType(strategy.strategy_type)}
                        </div>
                        {strategy.metadata?.strategy_name && (
                          <div className="text-xs text-gray-500 mt-1 italic">
                            {strategy.metadata.strategy_name}
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-2">
                          ${strategy.money_invested.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {strategy.start_date} to {strategy.end_date}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Simulation Parameters */}
            {selectedStrategy && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Simulation Parameters</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center">
                      Simulation Mode
                      <Tooltip text="How the simulation creates future price movements. Historical Bootstrap uses past market patterns, while Forward Simulation estimates future patterns from recent data." />
                    </label>
                    <div className="flex gap-4">
                      <button
                        onClick={() => setMode('historical_bootstrap')}
                        className={`px-4 py-2 rounded-lg border-2 ${
                          mode === 'historical_bootstrap'
                            ? 'border-pink-500 bg-pink-50' : 'border-gray-200'
                        }`}
                      >
                        Historical Bootstrap
                      </button>
                      <button
                        onClick={() => setMode('forward_sim')}
                        className={`px-4 py-2 rounded-lg border-2 ${
                          mode === 'forward_sim'
                            ? 'border-pink-500 bg-pink-50' : 'border-gray-200'
                        }`}
                      >
                        Forward Simulation
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {mode === 'historical_bootstrap'
                        ? 'Samples past returns with replacement'
                        : 'Uses estimated return distribution from recent data'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center">
                      Horizon: {horizonYears} year{horizonYears !== 1 ? 's' : ''} ({horizonDays} trading days)
                      <Tooltip text="How far into the future to simulate. This is the time period your strategy will be tested over in each simulation." />
                    </label>
                    <input
                      type="range"
                      min="0.25"
                      max="10"
                      step="0.25"
                      value={horizonYears}
                      onChange={(e) => handleHorizonYearsChange(parseFloat(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>3 months</span>
                      <span>10 years</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center">
                      Number of Simulations: {numSimulations}
                      <Tooltip text="How many different scenarios to test. More simulations give more accurate results but take longer to run." />
                    </label>
                    <input
                      type="range"
                      min="100"
                      max="5000"
                      step="100"
                      value={numSimulations}
                      onChange={(e) => setNumSimulations(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>100</span>
                      <span>5,000</span>
                    </div>
                  </div>

                  <button
                    onClick={handleRunSimulation}
                    disabled={loading}
                    className="w-full px-6 py-3 bg-pink-500 text-white rounded-lg font-semibold hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Running Simulation...' : 'Run Monte Carlo Simulation'}
                  </button>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="text-red-800 font-semibold">Error</div>
                <div className="text-red-600 text-sm mt-1">{error}</div>
              </div>
            )}

            {/* Results Display */}
            {result && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Simulation Results</h2>
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>⚠️ Disclaimer:</strong> These results are simulated and hypothetical. 
                    Past performance does not guarantee future results. Actual outcomes may vary significantly.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 flex items-center">
                      Initial Capital
                      <Tooltip text="The starting amount of money you invest in the strategy." />
                    </div>
                    <div className="text-2xl font-bold">${result.initial_capital.toLocaleString()}</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 flex items-center">
                      Mean Final Capital
                      <Tooltip text="The average ending value across all simulations. This shows what you might expect on average." />
                    </div>
                    <div className="text-2xl font-bold">
                      ${result.statistics.mean_final_capital.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 flex items-center">
                      Probability of Loss
                      <Tooltip text="The percentage of simulations where you end up with less money than you started with." />
                    </div>
                    <div className="text-2xl font-bold text-red-600">
                      {result.statistics.probability_of_loss.toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    Percentiles (Final Capital)
                    <Tooltip text="Shows different possible outcomes. For example, P50 means half the simulations did better and half did worse than this amount." />
                  </h3>
                  <div className="grid grid-cols-5 gap-4">
                    {Object.entries(result.statistics.percentiles).map(([key, value]) => (
                      <div key={key} className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-600">{key.toUpperCase()}</div>
                        <div className="text-lg font-semibold">${value.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    Percentiles (Return %)
                    <Tooltip text="Shows different possible percentage returns. For example, P50 means half the simulations had better returns and half had worse returns than this percentage." />
                  </h3>
                  <div className="grid grid-cols-5 gap-4">
                    {Object.entries(result.statistics.return_percentiles).map(([key, value]) => (
                      <div key={key} className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-600">{key.toUpperCase()}</div>
                        <div className={`text-lg font-semibold ${value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {value >= 0 ? '+' : ''}{value.toFixed(2)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1 flex items-center">
                      Minimum
                      <Tooltip text="The worst-case scenario - the lowest ending value from all simulations." />
                    </div>
                    <div className="text-xl font-semibold">
                      ${result.statistics.min_final_capital.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1 flex items-center">
                      Maximum
                      <Tooltip text="The best-case scenario - the highest ending value from all simulations." />
                    </div>
                    <div className="text-xl font-semibold">
                      ${result.statistics.max_final_capital.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonteCarloPage;

