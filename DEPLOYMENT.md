# Deployment Guide

This guide covers deploying the Backtesting Engine to Vercel (frontend) and Railway (backend).

## Overview

- **Frontend**: React app deployed on Vercel
- **Backend**: FastAPI app deployed on Railway
- **Database**: Supabase (configured via environment variables)

## Prerequisites

1. Vercel account
2. Railway account
3. Supabase project with database configured

## Backend Deployment (Railway)

### 1. Prepare Railway Deployment

1. Connect your GitHub repository to Railway
2. Railway will automatically detect the `Dockerfile` and `railway.json`
3. Add the following environment variables in Railway:

```
PORT=8000
ENVIRONMENT=production
ALLOWED_ORIGINS=https://your-frontend.vercel.app
SUPABASE_URL=your_supabase_url
SUPABASE_PASS=your_supabase_key
```

**Important**: Replace `ALLOWED_ORIGINS` with your actual Vercel frontend URL after deployment.

### 2. Railway Configuration

- Railway will automatically:
  - Build the Docker image
  - Run the FastAPI server on the port specified by `PORT` env var
  - Restart on failure (configured in `railway.json`)

### 3. Get Your Backend URL

After deployment, Railway will provide a URL like:
```
https://your-app.railway.app
```

Copy this URL - you'll need it for the frontend configuration.

## Frontend Deployment (Vercel)

### 1. Prepare Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Configure the following settings:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

### 2. Add Environment Variables

In Vercel project settings, add:

```
REACT_APP_API_BASE_URL=https://your-backend.railway.app
```

Replace with your actual Railway backend URL.

### 3. Vercel Configuration

The `frontend/vercel.json` file is already configured with:
- Proper routing for React Router
- Cache headers for static assets
- SPA fallback to `index.html`

### 4. Deploy

Vercel will automatically deploy on every push to your main branch.

## Environment Variables Summary

### Backend (Railway)
- `PORT`: Server port (Railway sets this automatically)
- `ENVIRONMENT`: `production` or `development`
- `ALLOWED_ORIGINS`: Comma-separated list of allowed frontend URLs
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_PASS`: Your Supabase anon/service key

### Frontend (Vercel)
- `REACT_APP_API_BASE_URL`: Your Railway backend URL

## Post-Deployment Checklist

1. ✅ Backend deployed on Railway
2. ✅ Frontend deployed on Vercel
3. ✅ `ALLOWED_ORIGINS` in Railway includes your Vercel URL
4. ✅ `REACT_APP_API_BASE_URL` in Vercel points to your Railway URL
5. ✅ Supabase credentials are set in Railway
6. ✅ Test the application end-to-end

## Troubleshooting

### CORS Errors
- Ensure `ALLOWED_ORIGINS` in Railway includes your exact Vercel URL (with https://)
- Check that there are no trailing slashes in URLs
- Verify the frontend is making requests to the correct backend URL

### API Connection Issues
- Verify `REACT_APP_API_BASE_URL` is set correctly in Vercel
- Check Railway logs for backend errors
- Ensure the backend is running and accessible

### Build Issues
- Check that all dependencies are in `package.json` and `requirements.txt`
- Verify Node.js and Python versions are compatible
- Review build logs in Vercel and Railway

## Local Development

For local development, create `.env` files:

### `frontend/.env`
```
REACT_APP_API_BASE_URL=http://localhost:8000
```

### Root `.env`
```
PORT=8000
ENVIRONMENT=development
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
SUPABASE_URL=your_supabase_url
SUPABASE_PASS=your_supabase_key
```

Then run:
- Backend: `python main.py` or `uvicorn main:app --reload`
- Frontend: `cd frontend && npm start`

