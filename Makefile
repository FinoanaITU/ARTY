.PHONY: help build up down restart logs clean dev prod

# Default target
help:
	@echo "Available commands:"
	@echo "  build    - Build all Docker images"
	@echo "  up       - Start all services"
	@echo "  down     - Stop all services"
	@echo "  restart  - Restart all services"
	@echo "  logs     - Show logs from all services"
	@echo "  clean    - Remove all containers, networks, and volumes"
	@echo "  dev      - Start development environment (with frontend-dev)"
	@echo "  prod     - Start production environment (with nginx)"

# Build all images
build:
	docker-compose build

# Start all services
up:
	docker-compose up -d

# Stop all services
down:
	docker-compose down

# Restart all services
restart:
	docker-compose restart

# Show logs
logs:
	docker-compose logs -f

# Clean everything
clean:
	docker-compose down -v --remove-orphans
	docker system prune -f

# Development environment
dev:
	docker-compose --profile dev up -d

# Production environment
prod:
	docker-compose --profile production up -d

# Database operations
db-migrate:
	docker-compose exec backend alembic upgrade head

db-rollback:
	docker-compose exec backend alembic downgrade -1

db-reset:
	docker-compose down -v
	docker-compose up -d postgres
	sleep 10
	docker-compose exec backend alembic upgrade head

# Backend operations
backend-shell:
	docker-compose exec backend bash

backend-logs:
	docker-compose logs -f backend

# Frontend operations
frontend-shell:
	docker-compose exec frontend sh

frontend-logs:
	docker-compose logs -f frontend

# Celery operations
celery-logs:
	docker-compose logs -f celery-worker

flower:
	@echo "Celery Flower monitoring available at: http://localhost:5555"

# Health checks
health:
	@echo "Checking service health..."
	@curl -f http://localhost:8000/health || echo "Backend health check failed"
	@curl -f http://localhost:3000/health || echo "Frontend health check failed"
	@curl -f http://localhost:5555 || echo "Celery Flower health check failed"

# Initialize project
init:
	@echo "Initializing ARTY project..."
	@cp .env.example .env
	@echo "Please edit .env file with your configuration"
	@echo "Then run: make build && make up" 