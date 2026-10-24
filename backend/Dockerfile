# Multi-stage Python FastAPI Dockerfile
FROM python:3.11-slim as builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Final runner stage
FROM python:3.11-slim

WORKDIR /app

# Install runtime libpq for PostgreSQL
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy installed Python packages from builder
COPY --from=builder /root/.local /root/.local
ENV PATH=/root/.local/bin:$PATH

# Copy backend application source
COPY . .

# Create uploads directory
RUN mkdir -p /app/uploads

EXPOSE 8000

# Run migrations and start uvicorn
CMD ["sh", "-c", "python -m alembic upgrade head && python seed.py && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
