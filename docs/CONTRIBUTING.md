# 🤝 Guía de Contribución - Gamarriando

¡Gracias por tu interés en contribuir al proyecto Gamarriando! Esta guía te ayudará a entender cómo contribuir de manera efectiva.

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [Cómo Contribuir](#cómo-contribuir)
- [Configuración del Entorno](#configuración-del-entorno)
- [Proceso de Desarrollo](#proceso-de-desarrollo)
- [Estándares de Código](#estándares-de-código)
- [Testing](#testing)
- [Pull Requests](#pull-requests)
- [Reportar Issues](#reportar-issues)

## 📜 Código de Conducta

### **Nuestros Compromisos**

- **Inclusión**: Crear un ambiente inclusivo y acogedor
- **Respeto**: Tratar a todos con respeto y dignidad
- **Colaboración**: Trabajar juntos hacia objetivos comunes
- **Profesionalismo**: Mantener estándares profesionales

### **Comportamientos Esperados**

- ✅ Usar lenguaje inclusivo y acogedor
- ✅ Respetar diferentes puntos de vista y experiencias
- ✅ Aceptar críticas constructivas con gracia
- ✅ Enfocarse en lo que es mejor para la comunidad
- ✅ Mostrar empatía hacia otros miembros

### **Comportamientos Inaceptables**

- ❌ Lenguaje o imágenes sexualizadas
- ❌ Trolling, comentarios insultantes o ataques personales
- ❌ Acoso público o privado
- ❌ Publicar información privada sin permiso
- ❌ Cualquier conducta inapropiada en un entorno profesional

## 🚀 Cómo Contribuir

### **Tipos de Contribuciones**

#### **🐛 Bug Reports**
- Reportar errores encontrados
- Proporcionar pasos para reproducir
- Incluir información del entorno

#### **✨ Feature Requests**
- Sugerir nuevas funcionalidades
- Explicar el caso de uso
- Proporcionar ejemplos si es posible

#### **📝 Documentación**
- Mejorar documentación existente
- Agregar ejemplos de código
- Traducir documentación

#### **🧪 Testing**
- Escribir tests unitarios
- Realizar testing manual
- Mejorar cobertura de tests

#### **🔧 Código**
- Corregir bugs
- Implementar features
- Refactorizar código existente

## 🛠️ Configuración del Entorno

### **Prerrequisitos**
```bash
# Software requerido
- Node.js 18+
- Python 3.11+
- Docker & Docker Compose
- Git
- AWS CLI (para deployment)
```

### **Fork y Clone**
```bash
# 1. Fork el repositorio en GitHub
# 2. Clone tu fork
git clone https://github.com/TU_USERNAME/trabajo-utec-cloud-computing.git
cd gamarriando

# 3. Agregar upstream
git remote add upstream https://github.com/hugoangeles0810/trabajo-utec-cloud-computing.git
```

### **Instalación**
```bash
# Instalar dependencias del monorepo
npm install

# Instalar dependencias de servicios
make install:services

# Instalar dependencias del frontend
make install:frontend

# Configurar variables de entorno
cp services/product-service/env.example services/product-service/.env
cp services/user-service/env.example services/user-service/.env
cp frontend/env.example frontend/.env.local
```

### **Base de Datos Local**
```bash
# Iniciar PostgreSQL con Docker
docker-compose up -d postgres

# Ejecutar migraciones
make migrate
```

## 🔄 Proceso de Desarrollo

### **1. Crear Branch**
```bash
# Actualizar main
git checkout main
git pull upstream main

# Crear feature branch
git checkout -b feature/nombre-de-la-feature
# o
git checkout -b fix/descripcion-del-bug
# o
git checkout -b docs/mejora-documentacion
```

### **2. Desarrollo**
```bash
# Hacer cambios
# ...

# Verificar cambios
git status
git diff

# Agregar cambios
git add .

# Commit con mensaje descriptivo
git commit -m "feat: agregar funcionalidad de búsqueda avanzada"
```

### **3. Testing**
```bash
# Ejecutar tests
make test

# Linting
make lint

# Type checking
make type-check
```

### **4. Push y Pull Request**
```bash
# Push a tu fork
git push origin feature/nombre-de-la-feature

# Crear Pull Request en GitHub
```

## 📝 Estándares de Código

### **Conventional Commits**
```bash
# Formato: tipo(scope): descripción

# Tipos válidos:
feat: nueva funcionalidad
fix: corrección de bug
docs: cambios en documentación
style: formateo, punto y coma faltante, etc.
refactor: refactorización de código
test: agregar o corregir tests
chore: cambios en build, dependencias, etc.

# Ejemplos:
feat(auth): agregar autenticación con JWT
fix(products): corregir error en lista de productos
docs(api): actualizar documentación de endpoints
style(frontend): formatear código con Prettier
```

### **TypeScript/JavaScript**
```typescript
// ✅ Bueno
interface User {
  id: number;
  email: string;
  name: string;
}

const getUser = async (id: number): Promise<User> => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

// ❌ Malo
const getUser = async (id) => {
  const response = await api.get('/users/' + id);
  return response.data;
};
```

### **Python**
```python
# ✅ Bueno
from typing import Dict, List, Optional
from dataclasses import dataclass

@dataclass
class User:
    id: int
    email: str
    name: str

def get_user(user_id: int) -> Optional[User]:
    """Get user by ID."""
    try:
        response = api.get(f"/users/{user_id}")
        return User(**response.json())
    except APIError:
        return None

# ❌ Malo
def get_user(id):
    response = api.get('/users/' + str(id))
    return response.json()
```

### **Naming Conventions**

#### **Variables y Funciones**
```typescript
// ✅ camelCase para JavaScript/TypeScript
const userName = 'john_doe';
const getUserProfile = () => {};

// ✅ snake_case para Python
user_name = 'john_doe'
def get_user_profile():
    pass
```

#### **Componentes React**
```typescript
// ✅ PascalCase para componentes
const UserProfile = () => {
  return <div>Profile</div>;
};

// ✅ camelCase para hooks
const useUserProfile = () => {
  // hook logic
};
```

#### **Archivos y Carpetas**
```
// ✅ kebab-case para archivos
user-profile.tsx
product-card.tsx
api-client.ts

// ✅ camelCase para carpetas
userProfile/
productCard/
apiClient/
```

## 🧪 Testing

### **Frontend Testing**
```typescript
// Test de componente
import { render, screen } from '@testing-library/react';
import { ProductCard } from './ProductCard';

describe('ProductCard', () => {
  it('should render product information', () => {
    const product = {
      id: 1,
      name: 'Test Product',
      price: 29.99,
    };

    render(<ProductCard product={product} />);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
  });
});
```

### **Backend Testing**
```python
# Test de endpoint
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_get_products():
    response = client.get("/api/v1/products")
    assert response.status_code == 200
    assert "products" in response.json()
```

### **E2E Testing**
```typescript
// Cypress test
describe('Product Purchase Flow', () => {
  it('should allow user to purchase a product', () => {
    cy.visit('/products');
    cy.get('[data-testid="product-card"]').first().click();
    cy.get('[data-testid="add-to-cart"]').click();
    cy.get('[data-testid="cart-icon"]').click();
    cy.get('[data-testid="checkout-button"]').click();
    cy.url().should('include', '/checkout');
  });
});
```

## 📋 Pull Requests

### **Antes de Crear PR**
- [ ] Código compila sin errores
- [ ] Tests pasan
- [ ] Linting pasa
- [ ] Documentación actualizada
- [ ] Commit messages siguen conventional commits

### **Template de PR**
```markdown
## 📝 Descripción
Breve descripción de los cambios realizados.

## 🔗 Tipo de Cambio
- [ ] Bug fix
- [ ] Nueva funcionalidad
- [ ] Breaking change
- [ ] Documentación

## 🧪 Testing
- [ ] Tests unitarios agregados/actualizados
- [ ] Tests de integración ejecutados
- [ ] Testing manual realizado

## 📸 Screenshots (si aplica)
Agregar screenshots para cambios de UI.

## ✅ Checklist
- [ ] Código sigue estándares del proyecto
- [ ] Self-review completado
- [ ] Documentación actualizada
- [ ] Tests agregados/actualizados
```

### **Review Process**
1. **Automated Checks**: CI/CD pipeline ejecuta tests
2. **Code Review**: Al menos 1 reviewer aprobado
3. **Testing**: Verificación manual si es necesario
4. **Merge**: Merge a main branch

## 🐛 Reportar Issues

### **Template de Bug Report**
```markdown
## 🐛 Descripción del Bug
Descripción clara y concisa del bug.

## 🔄 Pasos para Reproducir
1. Ir a '...'
2. Hacer clic en '...'
3. Scroll hasta '...'
4. Ver error

## ✅ Comportamiento Esperado
Descripción de lo que debería pasar.

## ❌ Comportamiento Actual
Descripción de lo que está pasando.

## 📸 Screenshots
Agregar screenshots si es posible.

## 🖥️ Información del Entorno
- OS: [e.g. macOS, Windows, Linux]
- Browser: [e.g. Chrome, Firefox, Safari]
- Version: [e.g. 1.0.0]

## 📋 Información Adicional
Cualquier información adicional relevante.
```

### **Template de Feature Request**
```markdown
## ✨ Descripción de la Feature
Descripción clara de la funcionalidad deseada.

## 🎯 Problema que Resuelve
¿Qué problema resuelve esta feature?

## 💡 Solución Propuesta
Descripción de cómo te gustaría que funcione.

## 🔄 Alternativas Consideradas
Otras soluciones que has considerado.

## 📋 Información Adicional
Cualquier información adicional relevante.
```

## 🏷️ Labels y Milestones

### **Labels Comunes**
- `bug`: Algo no funciona
- `enhancement`: Nueva funcionalidad
- `documentation`: Mejoras en documentación
- `good first issue`: Bueno para nuevos contribuidores
- `help wanted`: Se necesita ayuda extra
- `priority: high`: Alta prioridad
- `priority: low`: Baja prioridad

### **Milestones**
- `v1.0.0`: Primera versión estable
- `v1.1.0`: Próxima versión menor
- `v2.0.0`: Próxima versión mayor

## 🎯 Roadmap

### **Próximas Features**
- [ ] Sistema de reviews de productos
- [ ] Notificaciones push
- [ ] App móvil
- [ ] Dashboard de analytics
- [ ] Sistema de cupones

### **Mejoras Técnicas**
- [ ] Migración a GraphQL
- [ ] Implementación de Redis
- [ ] Mejoras en performance
- [ ] Testing automatizado completo

## 📞 Comunicación

### **Canales de Comunicación**
- **GitHub Issues**: Para bugs y features
- **GitHub Discussions**: Para preguntas generales
- **Email**: hugo.angeles@utec.edu.pe

### **Reuniones**
- **Weekly Sync**: Viernes 2:00 PM (opcional)
- **Code Review Sessions**: Según necesidad

## 🏆 Reconocimiento

### **Contribuidores**
Todos los contribuidores serán reconocidos en:
- README.md del proyecto
- Release notes
- Documentación de contribuidores

### **Tipos de Contribución**
- **Code**: Contribuciones de código
- **Documentation**: Mejoras en documentación
- **Testing**: Tests y QA
- **Design**: Diseño y UX
- **Community**: Moderación y soporte

## 📚 Recursos Adicionales

### **Documentación**
- [Guía de Desarrollo](./DEVELOPMENT.md)
- [Arquitectura del Sistema](./ARCHITECTURE.md)
- [API Documentation](./API.md)

### **Herramientas**
- [VS Code Extensions](./VSCODE_EXTENSIONS.md)
- [Git Hooks](./GIT_HOOKS.md)
- [Debugging Guide](./DEBUGGING.md)

---

**¡Gracias por contribuir a Gamarriando!** 🚀

Tu contribución hace que este proyecto sea mejor para todos. Si tienes preguntas, no dudes en contactarnos.
