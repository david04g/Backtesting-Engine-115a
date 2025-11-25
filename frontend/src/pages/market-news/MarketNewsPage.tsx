import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../../config/api';

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

// example article
const mockNews: NewsArticle[] = [
  {
    id: '1',
    title: 'Apple stock rises after record quarterly earnings',
    ticker: 'AAPL',
    ticker_name: 'Apple Inc.',
    time: '2h ago',
    description: 'Apple reported record quarterly earnings, beating analyst expectations with strong iPhone sales and services growth.',
    source: 'Bloomberg',
    publisher: 'Bloomberg',
    price: '$189.87',
    change: '+2.34',
    changePercent: '(+1.25%)',
    link: '#',
    publish_time: Math.floor(Date.now() / 1000) - 7200,
    published_at: new Date(Date.now() - 7200 * 1000).toISOString(),
    type: 'news'
  },
];

const MarketNewsPage: React.FC = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNews = async () => {
    try {
        setLoading(true);
        const response = await fetch(API_ENDPOINTS.GET_MARKET_NEWS);
        if (!response.ok) throw new Error('Failed to fetch news');
        const data = await response.json();
        console.log('API Response:', data);
        setArticles(data.data || []);
    } catch (err) {
        console.error('Error details:', err);
        setError('Failed to load news. Please try again later.');
        setArticles(mockNews);
    } finally {
        setLoading(false);
    }
    };

    fetchNews();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Market News</h1>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm animate-pulse h-40" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Market News</h1>
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Market News</h1>
        
        <div className="space-y-4">
            {articles.map((article) => (
                <div 
                    key={article.id}
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
                            {new Date(article.publish_time * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        </div>
                        <h2 className="font-semibold text-gray-900 mb-2 text-lg">{article.title}</h2>
                        <p className="text-sm text-gray-600 mb-3">{article.description}</p>
                        <div className="flex items-center text-xs text-gray-500">
                        <span>{article.publisher}</span>
                        </div>
                    </div>
                    
                    {article.price && (
                        <div className="ml-6 text-right min-w-[120px]">
                        <div className="font-medium text-gray-900 text-lg">{article.price}</div>
                        {article.change && article.changePercent && (
                            <div className={`text-sm font-medium ${
                            article.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                            }`}>
                            {article.change} <span className="text-gray-500">{article.changePercent}</span>
                            </div>
                        )}
                        {/* placeholder for the dynamic svg !!! */}
                        <div className="w-24 h-10 bg-gray-100 mt-2 rounded">
                            <svg width="100%" height="100%" viewBox="0 0 100 40" className="text-green-500">
                            <path 
                                d="M0,30 Q25,20 50,25 T100,15" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                            </svg>
                        </div>
                        </div>
                    )}
                </div>
            </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default MarketNewsPage;
