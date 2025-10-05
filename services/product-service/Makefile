# Gamarriando Product Service Makefile

.PHONY: help install test lint format clean setup deploy dev docker-build docker-run

# Default target
help:
	@echo "Gamarriando Product Service - Available commands:"
	@echo ""
	@echo "Setup:"
	@echo "  setup          - Initial setup of the project"
	@echo "  install        - Install dependencies"
	@echo ""
	@echo "Development:"
	@echo "  dev            - Start development server"
	@echo "  test           - Run tests"
	@echo "  test-cov       - Run tests with coverage"
	@echo "  lint           - Run linting"
	@echo "  format         - Format code"
	@echo ""
	@echo "Database:"
	@echo "  migrate        - Run database migrations"
	@echo "  migrate-create - Create new migration"
	@echo "  migrate-reset  - Reset database"
	@echo ""
	@echo "Docker:"
	@echo "  docker-build   - Build Docker image"
	@echo "  docker-run     - Run with Docker Compose"
	@echo "  docker-stop    - Stop Docker containers"
	@echo ""
	@echo "Deployment:"
	@echo "  deploy-dev     - Deploy to development"
	@echo "  deploy-prod    - Deploy to production"
	@echo ""
	@echo "Utilities:"
	@echo "  clean          - Clean up temporary files"
	@echo "  logs           - View Lambda logs"

# Setup
setup:
	@echo "🚀 Setting up Gamarriando Product Service..."
	@chmod +x scripts/setup.sh
	@./scripts/setup.sh

install:
	@echo "📦 Installing dependencies..."
	pip install -r requirements.txt
	npm install

# Development
dev:
	@echo "🚀 Starting development server..."
	python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

test:
	@echo "🧪 Running tests..."
	python -m pytest tests/ -v

test-cov:
	@echo "🧪 Running tests with coverage..."
	python -m pytest tests/ --cov=app --cov-report=html --cov-report=term

lint:
	@echo "🔍 Running linting..."
	python -m flake8 app/ --max-line-length=100

format:
	@echo "🎨 Formatting code..."
	python -m black app/
	python -m isort app/

# Database
migrate:
	@echo "🗄️  Running database migrations..."
	python app/db_migrations.py migrate

migrate-create:
	@echo "🗄️  Creating new migration..."
	@read -p "Enter migration message: " msg; \
	python app/db_migrations.py create "$$msg"

migrate-reset:
	@echo "🗄️  Resetting database..."
	python app/db_migrations.py reset

# Docker
docker-build:
	@echo "🐳 Building Docker image..."
	docker build -t gamarriando-product-service .

docker-run:
	@echo "🐳 Starting services with Docker Compose..."
	docker-compose up --build

docker-stop:
	@echo "🐳 Stopping Docker containers..."
	docker-compose down

# Deployment
deploy-dev:
	@echo "🚀 Deploying to development..."
	@chmod +x scripts/deploy.sh
	@./scripts/deploy.sh --stage dev

deploy-prod:
	@echo "🚀 Deploying to production..."
	@chmod +x scripts/deploy.sh
	@./scripts/deploy.sh --stage prod

# Utilities
clean:
	@echo "🧹 Cleaning up temporary files..."
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} +
	rm -rf .pytest_cache/
	rm -rf htmlcov/
	rm -rf .coverage

logs:
	@echo "📋 Viewing Lambda logs..."
	serverless logs -f api

# Database utilities
db-shell:
	@echo "🗄️  Opening database shell..."
	docker-compose exec postgres psql -U gamarriando -d gamarriando

# Health check
health:
	@echo "🏥 Checking service health..."
	curl -f http://localhost:8000/health || echo "Service is not running"
