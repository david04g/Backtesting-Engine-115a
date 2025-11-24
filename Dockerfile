FROM python:3.12-slim
WORKDIR /app

# Install system dependencies if needed
RUN apt-get update && apt-get install -y --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir --upgrade pip && pip install -r requirements.txt

# Copy application code
COPY . /app

# Expose port (Railway will set PORT env var)
EXPOSE ${PORT:-8000}

# Use uvicorn directly for production
# Railway sets PORT environment variable automatically via startCommand in railway.toml
# This is a fallback if railway.toml is not used
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
