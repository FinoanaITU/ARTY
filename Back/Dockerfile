
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        curl \
        libpq-dev \
        gcc \
        g++ \
        libmagic1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p /app/static/uploads /app/logs /docker-entrypoint.d

COPY scripts/docker-entrypoint.sh /docker-entrypoint.d/docker-entrypoint.sh
COPY scripts/check_db_connection.py /docker-entrypoint.d/check_db_connection.py

RUN adduser --disabled-password --gecos '' appuser

RUN chown -R appuser:appuser /app /docker-entrypoint.d && \
    chmod +x /docker-entrypoint.d/docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.d/check_db_connection.py

USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

ENTRYPOINT ["/docker-entrypoint.d/docker-entrypoint.sh"]

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
