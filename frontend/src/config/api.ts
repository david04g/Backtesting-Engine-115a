// API Configuration
// Uses environment variable REACT_APP_API_BASE in production
// Falls back to localhost:8000 for local development
export const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000';

export const getApiUrl = (endpoint: string): string => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE}/${cleanEndpoint}`;
};

