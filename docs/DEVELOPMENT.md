# 🛠️ Guía de Desarrollo - Gamarriando

Esta guía te ayudará a configurar y desarrollar en el proyecto Gamarriando.

## 📋 Prerrequisitos

### Software Requerido
- **Node.js**: 18+ (recomendado: 20.x)
- **Python**: 3.11+
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **AWS CLI**: 2.0+
- **Git**: 2.30+

### Herramientas Recomendadas
- **VS Code** con extensiones:
  - TypeScript
  - Python
  - Docker
  - AWS Toolkit
  - Prettier
  - ESLint

## 🚀 Configuración Inicial

### 1. Clonar el Repositorio
```bash
git clone https://github.com/hugoangeles0810/trabajo-utec-cloud-computing.git
cd gamarriando
```

### 2. Configurar Variables de Entorno
```bash
# Copiar archivos de ejemplo
cp services/product-service/env.example services/product-service/.env
cp services/user-service/env.example services/user-service/.env
cp services/order-service/env.example services/order-service/.env
cp services/payment-service/env.example services/payment-service/.env
cp services/notification-service/env.example services/notification-service/.env
cp frontend/env.example frontend/.env.local
```

### 3. Instalar Dependencias
```bash
# Instalar dependencias del monorepo
npm install

# Instalar dependencias de servicios
make install:services

# Instalar dependencias del frontend
make install:frontend
```

### 4. Configurar Base de Datos Local
```bash
# Iniciar PostgreSQL con Docker
docker-compose up -d postgres

# Ejecutar migraciones
make migrate
```

## 🏗️ Estructura del Proyecto

```
gamarriando/
├── frontend/                 # Aplicación Next.js
│   ├── app/                 # App Router de Next.js
│   ├── components/          # Componentes React
│   ├── lib/                 # Utilidades y configuración
│   ├── hooks/               # Custom hooks
│   └── styles/              # Estilos CSS
├── services/                # Microservicios Python
│   ├── product-service/     # Gestión de productos
│   ├── user-service/        # Gestión de usuarios
│   ├── order-service/       # Gestión de órdenes
│   ├── payment-service/     # Procesamiento de pagos
│   └── notification-service/ # Notificaciones
├── shared/                  # Código compartido
│   ├── types/               # Tipos TypeScript
│   ├── utils/               # Utilidades comunes
│   └── config/              # Configuración compartida
├── infrastructure/          # Infraestructura como código
│   ├── terraform/           # Configuración Terraform
│   └── scripts/             # Scripts de deployment
└── docs/                    # Documentación
```

## 🛠️ Comandos de Desarrollo

### Comandos Principales
```bash
# Desarrollo completo
make dev                     # Iniciar todos los servicios
make dev:frontend           # Solo frontend
make dev:services           # Solo microservicios
make dev:product            # Solo product service
make dev:user               # Solo user service

# Testing
make test                   # Ejecutar todos los tests
make test:frontend          # Tests del frontend
make test:services          # Tests de servicios
make test:coverage          # Tests con cobertura

# Linting y Formateo
make lint                   # Ejecutar linting
make format                 # Formatear código
make type-check             # Verificar tipos TypeScript

# Base de datos
make migrate                # Ejecutar migraciones
make migrate:create         # Crear nueva migración
make migrate:reset          # Resetear base de datos
```

### Comandos de Docker
```bash
# Desarrollo con Docker
make docker:up              # Iniciar todos los servicios
make docker:down            # Detener servicios
make docker:logs            # Ver logs
make docker:build           # Construir imágenes
```

## 🔧 Configuración de Servicios

### Product Service (Puerto 8000)
```bash
cd services/product-service
python -m venv venv
source venv/bin/activate  # Linux/Mac
# o
venv\Scripts\activate     # Windows
pip install -r requirements.txt
python main.py
```

### User Service (Puerto 8001)
```bash
cd services/user-service
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

### Frontend (Puerto 3000)
```bash
cd frontend
npm install
npm run dev
```

## 🧪 Testing

### Frontend Testing
```bash
cd frontend

# Tests unitarios
npm run test

# Tests E2E
npm run test:e2e

# Tests con cobertura
npm run test:coverage
```

### Services Testing
```bash
cd services/product-service
pytest tests/ -v

# Con cobertura
pytest tests/ --cov=app --cov-report=html
```

## 📝 Estándares de Código

### TypeScript/JavaScript
- **ESLint**: Configuración estricta
- **Prettier**: Formateo automático
- **TypeScript**: Modo estricto habilitado
- **Conventional Commits**: Para mensajes de commit

### Python
- **Black**: Formateo de código
- **Flake8**: Linting
- **MyPy**: Type checking
- **Pytest**: Framework de testing

### Estructura de Commits
```
feat: nueva funcionalidad
fix: corrección de bug
docs: documentación
style: formateo de código
refactor: refactorización
test: tests
chore: tareas de mantenimiento
```

## 🔌 Integración con APIs

### Configuración de Endpoints
```typescript
// frontend/lib/config/api.ts
export const API_ENDPOINTS = {
  PRODUCTS: 'http://localhost:8000/api/v1/products',
  USERS: 'http://localhost:8001/api/v1/users',
  ORDERS: 'http://localhost:8002/api/v1/orders',
  PAYMENTS: 'http://localhost:8003/api/v1/payments',
  NOTIFICATIONS: 'http://localhost:8004/api/v1/notifications',
};
```

### Uso de APIs en Frontend
```typescript
// Ejemplo de uso con React Query
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

const useProducts = (filters: ProductFilters) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => apiClient.getProducts(filters),
  });
};
```

## 🐛 Debugging

### Frontend Debugging
```bash
# Modo debug
npm run dev -- --inspect

# Herramientas de desarrollo
# - React Developer Tools
# - Redux DevTools
# - Network tab para API calls
```

### Services Debugging
```bash
# Modo debug con Python
python -m pdb main.py

# Logs detallados
export LOG_LEVEL=DEBUG
python main.py
```

### Docker Debugging
```bash
# Ver logs de servicios específicos
docker-compose logs -f product-service

# Entrar a contenedor
docker-compose exec product-service bash
```

## 📊 Monitoreo Local

### Health Checks
```bash
# Verificar estado de servicios
make health

# URLs de health check
curl http://localhost:8000/health  # Product Service
curl http://localhost:8001/health  # User Service
curl http://localhost:3000/api/health  # Frontend
```

### Logs
```bash
# Ver logs de todos los servicios
make logs

# Logs específicos
make logs:product
make logs:user
make logs:frontend
```

## 🚀 Deployment Local

### Build de Producción
```bash
# Build del frontend
cd frontend
npm run build

# Build de servicios
make build:services
```

### Testing de Producción
```bash
# Iniciar en modo producción
make start:prod

# Verificar funcionamiento
make health
```

## 🔧 Configuración Avanzada

### Variables de Entorno
```bash
# .env.local (Frontend)
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_ENV=development

# .env (Services)
DATABASE_URL=postgresql://user:pass@localhost:5432/gamarriando
JWT_SECRET_KEY=your-secret-key
AWS_REGION=us-east-1
```

### Configuración de Base de Datos
```bash
# Crear base de datos
createdb gamarriando_dev

# Ejecutar migraciones
alembic upgrade head

# Seed de datos de prueba
python scripts/seed_data.py
```

## 📚 Recursos Adicionales

### Documentación Externa
- [Next.js Documentation](https://nextjs.org/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Herramientas de Desarrollo
- [VS Code Extensions](./VSCODE_EXTENSIONS.md)
- [Git Hooks](./GIT_HOOKS.md)
- [Debugging Guide](./DEBUGGING.md)

## 🆘 Troubleshooting

### Problemas Comunes

#### Error de Puerto en Uso
```bash
# Encontrar proceso usando el puerto
lsof -i :3000
kill -9 <PID>
```

#### Error de Dependencias
```bash
# Limpiar node_modules
rm -rf node_modules package-lock.json
npm install
```

#### Error de Base de Datos
```bash
# Resetear base de datos
make migrate:reset
make migrate
```

### Obtener Ayuda
- Revisar [Troubleshooting Guide](./TROUBLESHOOTING.md)
- Crear issue en GitHub
- Contactar al equipo de desarrollo

---

**Última actualización**: Octubre 2024  
**Versión**: 1.0.0
