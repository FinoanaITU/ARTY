# Use Python 3.11 slim image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        curl \
        libpq-dev \
        gcc \
        g++ \
        libmagic1 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Create necessary directories
RUN mkdir -p /app/static/uploads /app/logs /docker-entrypoint.d

# Copy entrypoint scripts to a location that won't be overwritten by volume mounts
# These scripts are needed even when ./Back:/app volume is mounted
COPY scripts/docker-entrypoint.sh /docker-entrypoint.d/docker-entrypoint.sh
COPY scripts/check_db_connection.py /docker-entrypoint.d/check_db_connection.py

# Create non-root user
RUN adduser --disabled-password --gecos '' appuser

# Change ownership and make scripts executable (before switching user)
RUN chown -R appuser:appuser /app /docker-entrypoint.d && \
    chmod +x /docker-entrypoint.d/docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.d/check_db_connection.py

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Use entrypoint script (from docker-entrypoint.d, which won't be overwritten)
ENTRYPOINT ["/docker-entrypoint.d/docker-entrypoint.sh"]

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
