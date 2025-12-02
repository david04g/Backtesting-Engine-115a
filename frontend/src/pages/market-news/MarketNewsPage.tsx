import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../../config/api';
import NewsStockChart from '../../components/NewsStockChart';

interface NewsArticle {
  id: string;
  title: string;
  ticker: string;
  ticker_name: string;
  time?: string;
  description: string;
  source: string;
  publisher: string;
  price?: string;
  change?: string;
  changePercent?: string;
  link: string;
  publish_time: number;
  published_at: string;
  type: string;
}

const MarketNewsPage: React.FC = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNews = async () => {
      console.log('Starting to fetch news...');
      try {
        setLoading(true);
        console.log('Loading state set to true');
        
        const response = await fetch(API_ENDPOINTS.GET_MARKET_NEWS);
        console.log('Response received:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Data received:', result);
        
        if (result.status === 'success' && Array.isArray(result.data)) {
          setArticles(result.data);
        } else {
          throw new Error('Invalid data format received');
        }
      } catch (error) {
        console.error('Error in fetchNews:', error);
        setError('Failed to load market news. Please try again later.');
      } finally {
        console.log('Setting loading to false');
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-6">
          <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Market News</h1>
          <div className="text-center py-8">
            <div className="inline-flex items-center space-x-2">
              <svg 
                className="animate-spin h-5 w-5 text-blue-500" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span className="text-gray-600">Loading latest market news...</span>
            </div>
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm animate-pulse h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Market News</h1>
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Market News</h1>
          
          {articles.length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <p className="text-gray-500">No news articles available at the moment.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {articles.map((article) => (
                <div 
                  key={`${article.ticker}-${article.publish_time}`}
                  className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100"
                  onClick={() => article.link && window.open(article.link, '_blank')}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          {article.ticker} • {article.ticker_name}
                        </span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-500">
                          {new Date(article.publish_time * 1000).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                      <h2 className="font-semibold text-gray-900 mb-2 text-lg">{article.title}</h2>
                      <p className="text-sm text-gray-600 mb-3">{article.publisher}</p>
                    </div>
                    
                    {article.price && (
                      <div className="ml-6 flex flex-col items-end min-w-[120px]">
                        <div className="text-right">
                          <div className="font-medium text-gray-900 text-lg">{article.price}</div>
                          {article.change && article.changePercent && (
                            <div className="flex items-center space-x-1 justify-end mt-1">
                              <div className={`text-sm font-medium ${
                                article.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {article.change} ({article.changePercent.replace(/[()%+]/g, '')}%)
                              </div>
                              <div className="group relative">
                                <svg 
                                  className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" 
                                  fill="none" 
                                  viewBox="0 0 24 24" 
                                  stroke="currentColor"
                                >
                                  <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                                  />
                                </svg>
                                <div className="absolute hidden group-hover:block z-10 w-48 p-2 text-xs text-gray-600 bg-white border border-gray-200 rounded shadow-lg -left-24 top-6">
                                  Price change and percentage change since previous close
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="w-24 h-10 mt-2">
                          <NewsStockChart 
                            ticker={article.ticker}
                            positive={!article.change || article.change.startsWith('+')} 
                            width={100} 
                            height={40} 
                            period="1d"
                            interval="1m"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketNewsPage;