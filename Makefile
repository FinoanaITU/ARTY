.PHONY: help build up down restart logs clean dev prod

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

build:
	docker-compose build

up:
	docker-compose up -d

down:
	docker-compose down

restart:
	docker-compose restart

logs:
	docker-compose logs -f

clean:
	docker-compose down -v --remove-orphans
	docker system prune -f

dev:
	docker-compose --profile dev up -d

prod:
	docker-compose --profile production up -d

db-migrate:
	docker-compose exec backend alembic upgrade head

db-rollback:
	docker-compose exec backend alembic downgrade -1

db-reset:
	docker-compose down -v
	docker-compose up -d postgres
	sleep 10
	docker-compose exec backend alembic upgrade head

backend-shell:
	docker-compose exec backend bash

backend-logs:
	docker-compose logs -f backend

frontend-shell:
	docker-compose exec frontend sh

frontend-logs:
	docker-compose logs -f frontend

celery-logs:
	docker-compose logs -f celery-worker

flower:
	@echo "Celery Flower monitoring available at: http://localhost:5555"

health:
	@echo "Checking service health..."
	@curl -f http://localhost:8000/health || echo "Backend health check failed"
	@curl -f http://localhost:3000/health || echo "Frontend health check failed"
	@curl -f http://localhost:5555 || echo "Celery Flower health check failed"

init:
	@echo "Initializing ARTIZAHO project..."
	@cp .env.example .env
	@echo "Please edit .env file with your configuration"
	@echo "Then run: make build && make up" 