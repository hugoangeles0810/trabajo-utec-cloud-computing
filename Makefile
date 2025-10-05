# Gamarriando Monorepo Makefile

.PHONY: help install build test lint format clean setup deploy dev docker

# Default target
help:
	@echo "Gamarriando Monorepo - Available commands:"
	@echo ""
	@echo "Setup:"
	@echo "  setup          - Initial setup of the monorepo"
	@echo "  install        - Install all dependencies"
	@echo "  install:shared - Install shared packages"
	@echo "  install:services - Install service dependencies"
	@echo "  install:frontend - Install frontend dependencies"
	@echo ""
	@echo "Development:"
	@echo "  dev            - Start all services in development mode"
	@echo "  dev:services   - Start only microservices"
	@echo "  dev:frontend   - Start only frontend"
	@echo "  dev:product    - Start product service only"
	@echo "  dev:user       - Start user service only"
	@echo "  dev:order      - Start order service only"
	@echo "  dev:payment    - Start payment service only"
	@echo "  dev:notification - Start notification service only"
	@echo ""
	@echo "Building:"
	@echo "  build          - Build all packages"
	@echo "  build:shared   - Build shared packages"
	@echo "  build:services - Build all services"
	@echo "  build:frontend - Build frontend"
	@echo ""
	@echo "Testing:"
	@echo "  test           - Run all tests"
	@echo "  test:services  - Run service tests"
	@echo "  test:frontend  - Run frontend tests"
	@echo "  test:coverage  - Run tests with coverage"
	@echo ""
	@echo "Code Quality:"
	@echo "  lint           - Run linting on all packages"
	@echo "  lint:services  - Run linting on services"
	@echo "  lint:frontend  - Run linting on frontend"
	@echo "  format         - Format all code"
	@echo ""
	@echo "Database:"
	@echo "  migrate        - Run database migrations for all services"
	@echo "  migrate:create - Create new migration"
	@echo "  migrate:reset  - Reset all databases"
	@echo ""
	@echo "Docker:"
	@echo "  docker:build   - Build all Docker images"
	@echo "  docker:up      - Start all services with Docker Compose"
	@echo "  docker:down    - Stop all Docker containers"
	@echo "  docker:logs    - View Docker logs"
	@echo ""
	@echo "Deployment:"
	@echo "  deploy:dev     - Deploy all services to development"
	@echo "  deploy:prod    - Deploy all services to production"
	@echo "  deploy:services - Deploy only services"
	@echo "  deploy:frontend - Deploy only frontend"
	@echo ""
	@echo "Utilities:"
	@echo "  clean          - Clean up temporary files"
	@echo "  logs           - View service logs"
	@echo "  health         - Check service health"

# Setup
setup:
	@echo "🚀 Setting up Gamarriando Monorepo..."
	@chmod +x scripts/setup.sh
	@./scripts/setup.sh

install:
	@echo "📦 Installing all dependencies..."
	npm install
	npm run install:shared
	npm run install:services
	npm run install:frontend

install:shared:
	@echo "📦 Installing shared packages..."
	cd shared/types && npm install

install:services:
	@echo "📦 Installing service dependencies..."
	cd services/product-service && pip install -r requirements.txt
	cd services/user-service && pip install -r requirements.txt
	cd services/order-service && pip install -r requirements.txt
	cd services/payment-service && pip install -r requirements.txt
	cd services/notification-service && pip install -r requirements.txt

install:frontend:
	@echo "📦 Installing frontend dependencies..."
	cd frontend && npm install

# Development
dev:
	@echo "🚀 Starting all services in development mode..."
	docker-compose up

dev:services:
	@echo "🚀 Starting microservices..."
	concurrently \
		"cd services/product-service && python -m uvicorn app.main:app --reload --port 8000" \
		"cd services/user-service && python -m uvicorn app.main:app --reload --port 8001" \
		"cd services/order-service && python -m uvicorn app.main:app --reload --port 8002" \
		"cd services/payment-service && python -m uvicorn app.main:app --reload --port 8003" \
		"cd services/notification-service && python -m uvicorn app.main:app --reload --port 8004"

dev:frontend:
	@echo "🚀 Starting frontend..."
	cd frontend && npm run dev

dev:product:
	@echo "🚀 Starting product service..."
	cd services/product-service && python -m uvicorn app.main:app --reload --port 8000

dev:user:
	@echo "🚀 Starting user service..."
	cd services/user-service && python -m uvicorn app.main:app --reload --port 8001

dev:order:
	@echo "🚀 Starting order service..."
	cd services/order-service && python -m uvicorn app.main:app --reload --port 8002

dev:payment:
	@echo "🚀 Starting payment service..."
	cd services/payment-service && python -m uvicorn app.main:app --reload --port 8003

dev:notification:
	@echo "🚀 Starting notification service..."
	cd services/notification-service && python -m uvicorn app.main:app --reload --port 8004

# Building
build:
	@echo "🔨 Building all packages..."
	npm run build:shared
	npm run build:services
	npm run build:frontend

build:shared:
	@echo "🔨 Building shared packages..."
	cd shared/types && npm run build

build:services:
	@echo "🔨 Building services..."
	@echo "Services are built during deployment"

build:frontend:
	@echo "🔨 Building frontend..."
	cd frontend && npm run build

# Testing
test:
	@echo "🧪 Running all tests..."
	npm run test:services
	npm run test:frontend

test:services:
	@echo "🧪 Running service tests..."
	cd services/product-service && python -m pytest tests/ -v
	cd services/user-service && python -m pytest tests/ -v
	cd services/order-service && python -m pytest tests/ -v
	cd services/payment-service && python -m pytest tests/ -v
	cd services/notification-service && python -m pytest tests/ -v

test:frontend:
	@echo "🧪 Running frontend tests..."
	cd frontend && npm run test

test:coverage:
	@echo "🧪 Running tests with coverage..."
	cd services/product-service && python -m pytest tests/ --cov=app --cov-report=html
	cd frontend && npm run test:coverage

# Code Quality
lint:
	@echo "🔍 Running linting on all packages..."
	npm run lint:services
	npm run lint:frontend

lint:services:
	@echo "🔍 Running linting on services..."
	cd services/product-service && python -m flake8 app/
	cd services/user-service && python -m flake8 app/
	cd services/order-service && python -m flake8 app/
	cd services/payment-service && python -m flake8 app/
	cd services/notification-service && python -m flake8 app/

lint:frontend:
	@echo "🔍 Running linting on frontend..."
	cd frontend && npm run lint

format:
	@echo "🎨 Formatting all code..."
	cd services/product-service && python -m black app/
	cd services/user-service && python -m black app/
	cd services/order-service && python -m black app/
	cd services/payment-service && python -m black app/
	cd services/notification-service && python -m black app/
	cd frontend && npm run format

# Database
migrate:
	@echo "🗄️  Running database migrations..."
	cd services/product-service && python app/db_migrations.py migrate
	cd services/user-service && python app/db_migrations.py migrate
	cd services/order-service && python app/db_migrations.py migrate
	cd services/payment-service && python app/db_migrations.py migrate
	cd services/notification-service && python app/db_migrations.py migrate

migrate:create:
	@echo "🗄️  Creating new migration..."
	@read -p "Enter service name (product, user, order, payment, notification): " service; \
	@read -p "Enter migration message: " msg; \
	cd services/$$service-service && python app/db_migrations.py create "$$msg"

migrate:reset:
	@echo "🗄️  Resetting all databases..."
	cd services/product-service && python app/db_migrations.py reset
	cd services/user-service && python app/db_migrations.py reset
	cd services/order-service && python app/db_migrations.py reset
	cd services/payment-service && python app/db_migrations.py reset
	cd services/notification-service && python app/db_migrations.py reset

# Docker
docker:build:
	@echo "🐳 Building all Docker images..."
	docker-compose build

docker:up:
	@echo "🐳 Starting all services with Docker Compose..."
	docker-compose up -d

docker:down:
	@echo "🐳 Stopping all Docker containers..."
	docker-compose down

docker:logs:
	@echo "🐳 Viewing Docker logs..."
	docker-compose logs -f

# Deployment
deploy:dev:
	@echo "🚀 Deploying to development..."
	@chmod +x scripts/deploy-all.sh
	@./scripts/deploy-all.sh --stage dev

deploy:prod:
	@echo "🚀 Deploying to production..."
	@chmod +x scripts/deploy-all.sh
	@./scripts/deploy-all.sh --stage prod

deploy:services:
	@echo "🚀 Deploying services only..."
	@chmod +x scripts/deploy-all.sh
	@./scripts/deploy-all.sh --services services

deploy:frontend:
	@echo "🚀 Deploying frontend only..."
	@chmod +x scripts/deploy-all.sh
	@./scripts/deploy-all.sh --services frontend

# Utilities
clean:
	@echo "🧹 Cleaning up temporary files..."
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} +
	find . -type d -name "node_modules" -exec rm -rf {} +
	rm -rf .pytest_cache/
	rm -rf coverage/
	rm -rf dist/
	rm -rf .next/

logs:
	@echo "📋 Viewing service logs..."
	docker-compose logs -f

health:
	@echo "🏥 Checking service health..."
	@curl -f http://localhost:8000/health || echo "Product service is not running"
	@curl -f http://localhost:8001/health || echo "User service is not running"
	@curl -f http://localhost:8002/health || echo "Order service is not running"
	@curl -f http://localhost:8003/health || echo "Payment service is not running"
	@curl -f http://localhost:8004/health || echo "Notification service is not running"
	@curl -f http://localhost:3000 || echo "Frontend is not running"