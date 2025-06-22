# ARTY Project - Docker Setup

This document explains how to run the ARTY project using Docker Compose.

## Prerequisites

- Docker
- Docker Compose
- Make (optional, for using Makefile commands)

## Quick Start

1. **Clone the repository and navigate to the project root:**
   ```bash
   cd ARTY
   ```

2. **Copy the environment file:**
   ```bash
   cp .env.example .env
   ```

3. **Edit the `.env` file with your configuration:**
   ```bash
   # Edit .env file with your specific values
   nano .env
   ```

4. **Build and start all services:**
   ```bash
   make build && make up
   ```
   
   Or without Make:
   ```bash
   docker-compose build
   docker-compose up -d
   ```

## Services Overview

The Docker Compose setup includes the following services:

### Core Services
- **PostgreSQL** (port 5432) - Main database
- **Redis** (port 6379) - Caching and message broker
- **Backend** (port 8000) - FastAPI application
- **Frontend** (port 3000) - React/TypeScript application

### Background Services
- **Celery Worker** - Background task processing
- **Celery Flower** (port 5555) - Task monitoring interface

### Optional Services
- **Frontend Dev** (port 8080) - Development frontend with hot reload
- **Nginx** (ports 80, 443) - Reverse proxy for production

## Available Commands

### Using Makefile (Recommended)
```bash
make help          # Show all available commands
make build         # Build all Docker images
make up            # Start all services
make down          # Stop all services
make restart       # Restart all services
make logs          # Show logs from all services
make clean         # Remove all containers, networks, and volumes
make dev           # Start development environment
make prod          # Start production environment
```

### Using Docker Compose directly
```bash
docker-compose up -d              # Start all services
docker-compose down               # Stop all services
docker-compose logs -f            # Follow logs
docker-compose restart            # Restart services
docker-compose build              # Build images
```

## Development Environment

For development with hot reload:

```bash
make dev
```

This will start:
- All core services
- Frontend development server with hot reload (port 8080)

## Production Environment

For production deployment:

```bash
make prod
```

This will start:
- All core services
- Nginx reverse proxy (ports 80, 443)

## Database Operations

```bash
make db-migrate    # Run database migrations
make db-rollback   # Rollback last migration
make db-reset      # Reset database (WARNING: deletes all data)
```

## Service Access

Once running, you can access:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Celery Flower**: http://localhost:5555
- **Frontend Dev**: http://localhost:8080 (development mode)

## Environment Variables

Key environment variables to configure in `.env`:

### Database
- `DATABASE_URL` - PostgreSQL connection string
- `DATABASE_TEST_URL` - Test database connection string

### Security
- `SECRET_KEY` - JWT secret key
- `ALGORITHM` - JWT algorithm (HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES` - JWT access token expiry
- `REFRESH_TOKEN_EXPIRE_DAYS` - JWT refresh token expiry

### Redis & Celery
- `REDIS_URL` - Redis connection string
- `CELERY_BROKER_URL` - Celery broker URL
- `CELERY_RESULT_BACKEND` - Celery result backend URL

### Email
- `SMTP_HOST` - SMTP server host
- `SMTP_PORT` - SMTP server port
- `SMTP_USER` - SMTP username
- `SMTP_PASSWORD` - SMTP password

### Payment (Stripe)
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret

## Troubleshooting

### Common Issues

1. **Port conflicts**: If ports are already in use, modify the port mappings in `docker-compose.yml`

2. **Database connection issues**: Ensure PostgreSQL is running and accessible:
   ```bash
   docker-compose logs postgres
   ```

3. **Backend startup issues**: Check backend logs:
   ```bash
   make backend-logs
   ```

4. **Frontend build issues**: Check frontend logs:
   ```bash
   make frontend-logs
   ```

### Health Checks

Check if all services are healthy:
```bash
make health
```

### Clean Start

If you encounter issues, try a clean start:
```bash
make clean
make build
make up
```

## Volumes

The following volumes are created:
- `postgres_data` - PostgreSQL database data
- `redis_data` - Redis data
- `backend_uploads` - Backend file uploads
- `backend_logs` - Backend application logs

## Networks

All services are connected through the `arty-network` bridge network.

## Security Notes

1. **Change default passwords** in production
2. **Use strong SECRET_KEY** for JWT tokens
3. **Configure proper CORS** settings
4. **Enable HTTPS** in production
5. **Use environment-specific** configurations

## Monitoring

- **Celery Flower**: Monitor background tasks at http://localhost:5555
- **Application Logs**: Use `make logs` or `docker-compose logs -f`
- **Health Checks**: Built-in health checks for all services

## Scaling

To scale specific services:
```bash
docker-compose up -d --scale celery-worker=3
```

## Backup

To backup the database:
```bash
docker-compose exec postgres pg_dump -U artizaho_user artizaho_db > backup.sql
```

To restore:
```bash
docker-compose exec -T postgres psql -U artizaho_user artizaho_db < backup.sql
``` 