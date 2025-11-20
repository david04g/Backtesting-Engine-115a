# Deployment Guide

This application has been configured for deployment on Vercel and Railway.

## Environment Variables

### Backend (Railway/Vercel)

Set these environment variables in your deployment platform:

- `PORT` - Automatically set by Railway/Vercel (defaults to 8000 if not set)
- `ALLOWED_ORIGINS` - Comma-separated list of allowed CORS origins (optional)
  - Example: `https://your-frontend.vercel.app,https://your-frontend.netlify.app`
  - If not set, defaults to `*` (allows all origins) - useful for development
- `ENVIRONMENT` - Set to `development` for local dev (enables auto-reload)
- Add your database/API keys as needed (Supabase credentials, etc.)

### Frontend (Vercel)

Set this environment variable for the frontend build:

- `REACT_APP_API_BASE` - The backend API URL
  - Example: `https://your-backend.railway.app` or `https://your-backend.vercel.app`
  - If not set, defaults to `http://localhost:8000` for local development

## Deployment Steps

### Railway (Backend)

1. Connect your GitHub repository to Railway
2. Railway will detect the `Dockerfile` or `railway.json` configuration
3. Set environment variables in Railway dashboard:
   - `ALLOWED_ORIGINS` (recommended for production)
   - Your database credentials
4. Railway will automatically set `PORT` environment variable

### Vercel (Frontend)

1. Connect your GitHub repository to Vercel
2. Set the root directory to `frontend/`
3. Build settings:
   - Build Command: `npm run build`
   - Output Directory: `build`
4. Set environment variable:
   - `REACT_APP_API_BASE` = Your Railway backend URL (e.g., `https://your-app.railway.app`)
5. Deploy

### Vercel (Backend - Alternative to Railway)

1. Vercel will use `vercel.json` for configuration
2. Set environment variables in Vercel dashboard
3. Vercel will automatically handle the Python runtime

## Local Development

For local development:

1. Backend: `python main.py` (runs on port 8000 by default)
2. Frontend: `cd frontend && npm start` (runs on port 3000 by default)
3. The frontend will automatically use `http://localhost:8000` for the API

## Notes

- All hardcoded `localhost:8000` URLs have been replaced with environment-aware configuration
- The backend uses `PORT` environment variable (automatically set by deployment platforms)
- CORS is configured to work in both development and production environments

