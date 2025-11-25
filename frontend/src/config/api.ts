// Central API configuration
// This file manages all API endpoint URLs
const getApiBaseUrl = (): string => {
  // For Create React App, use REACT_APP_ prefix
  // Check if we're in production or have an environment variable set
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }
  
  // Fallback to localhost for development
  return 'http://localhost:8000';
};

export const API_BASE_URL = getApiBaseUrl();

// Helper function to build full API endpoint URLs
export const getApiEndpoint = (path: string): string => {
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${API_BASE_URL}/${cleanPath}`;
};

// Export commonly used endpoints
export const API_ENDPOINTS = {
  // User endpoints
  GET_USER_ID: getApiEndpoint('api/get_user_id'),
  ADD_USER: getApiEndpoint('api/add_user'),
  LOGIN_USER: getApiEndpoint('api/login_user'),
  GET_USER: (userId: string) => getApiEndpoint(`api/user/${userId}`),
  UPDATE_PROFILE: getApiEndpoint('api/update_profile'),
  
  // Learning endpoints
  ADD_LEARNING_USER: getApiEndpoint('api/add_learning_user'),
  GET_USER_LEARNING_PROGRESS: getApiEndpoint('api/get_user_learning_progress'),
  SET_USER_LEARNING_PROGRESS: getApiEndpoint('api/set_user_learning_progress'),
  SET_USER_COMPLETED_LESSONS: getApiEndpoint('api/set_user_completed_lessons'),
  GET_LESSONS_BY_LEVEL: (level: number) => getApiEndpoint(`api/lessons/${level}`),
  GET_LESSON: getApiEndpoint('api/get_lesson'),
  
  // Verification endpoints
  IS_USER_VERIFIED: getApiEndpoint('api/is_user_verified'),
  SEND_VERIFICATION_EMAIL: getApiEndpoint('api/send_verification_email'),
  VERIFY_EMAIL: getApiEndpoint('api/verify_email'),
  
  // Strategy endpoints
  STRATEGIES: {
    BUY_HOLD: getApiEndpoint('api/strategies/buy_hold'),
    SIMPLE_MOVING_AVERAGE_CROSSOVER: getApiEndpoint('api/strategies/simple_moving_average_crossover'),
    DCA: getApiEndpoint('api/strategies/dca'),
    SAVE: getApiEndpoint('api/strategies/save'),
    GET_USER_STRATEGIES: (userId: string) => getApiEndpoint(`api/strategies/user/${userId}`),
    DELETE: (strategyId: string) => getApiEndpoint(`api/strategies/${strategyId}`),
  },
  
  // Ticker endpoints
  GET_TICKER_NEWS: (ticker: string) => getApiEndpoint(`api/ticker/${ticker}/news`),
  GET_MARKET_NEWS: getApiEndpoint('api/market-news/latest'),

};

