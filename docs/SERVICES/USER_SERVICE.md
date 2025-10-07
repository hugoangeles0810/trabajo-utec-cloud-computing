# 👤 User Service - Gamarriando

Microservicio de gestión de usuarios y autenticación para el marketplace Gamarriando, implementado con 21 funciones Lambda individuales.

## 🏗️ Arquitectura

### **21 Lambda Functions Individuales**

#### 🔐 **Authentication Functions (6)**
- `auth_register` - Registro de usuarios con verificación de email
- `auth_login` - Login con generación de tokens JWT
- `auth_logout` - Logout con blacklisting de tokens
- `auth_refresh` - Renovación de access token
- `auth_forgot_password` - Generación de token de reset de contraseña
- `auth_reset_password` - Reset de contraseña con validación de token

#### 👥 **User Management Functions (8)**
- `users_create` - Crear nuevo usuario (solo admin)
- `users_get` - Obtener usuario por ID
- `users_list` - Listar usuarios con filtros y paginación
- `users_update` - Actualizar información de usuario
- `users_delete` - Eliminar cuenta de usuario
- `users_verify_email` - Verificar dirección de email
- `users_change_password` - Cambiar contraseña de usuario
- `users_get_profile` - Obtener perfil del usuario actual

#### 🎭 **Role Management Functions (4)**
- `roles_assign` - Asignar rol a usuario
- `roles_remove` - Remover rol de usuario
- `roles_list` - Obtener roles de usuario
- `roles_list_all` - Listar todos los roles disponibles

#### 🔑 **Session Management Functions (3)**
- `sessions_list` - Listar sesiones de usuario
- `sessions_revoke` - Revocar sesión específica
- `sessions_revoke_all` - Revocar todas las sesiones de usuario

## 🗄️ Base de Datos

### **Esquema de Base de Datos**

#### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    date_of_birth DATE,
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    is_admin BOOLEAN DEFAULT false,
    profile_picture_url VARCHAR(500),
    preferences JSONB DEFAULT '{}',
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### User Roles Table
```sql
CREATE TABLE user_roles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role_name VARCHAR(50) NOT NULL,
    granted_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);
```

#### User Sessions Table
```sql
CREATE TABLE user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255) UNIQUE NOT NULL,
    device_info JSONB,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Password Reset Tokens Table
```sql
CREATE TABLE password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Email Verification Tokens Table
```sql
CREATE TABLE email_verification_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔐 Seguridad

### **JWT Token Structure**
```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "username": "username",
  "roles": ["customer", "vendor"],
  "iat": 1640995200,
  "exp": 1640996100,
  "type": "access"
}
```

### **Password Security**
- **Hashing**: Bcrypt con 12 salt rounds
- **Validation**: Mínimo 8 caracteres, mayúsculas, minúsculas, números
- **History**: Rastrear últimas 5 contraseñas
- **Lockout**: 5 intentos fallidos = bloqueo de 30 minutos

### **Session Security**
- **Access Token**: Expiración de 15 minutos
- **Refresh Token**: Expiración de 7 días
- **Rotation**: Refresh token rotado en cada uso
- **Blacklisting**: Tokens invalidados en logout

## 🔄 Flujos de Datos

### **User Registration Flow**
1. Usuario envía formulario de registro
2. `auth_register` valida entrada
3. Contraseña hasheada con bcrypt
4. Registro de usuario creado en base de datos
5. Token de verificación de email generado
6. Email de verificación enviado
7. Usuario hace clic en enlace de verificación
8. `users_verify_email` valida token
9. Cuenta de usuario activada

### **User Login Flow**
1. Usuario envía credenciales de login
2. `auth_login` valida credenciales
3. Contraseña verificada con bcrypt
4. Tokens JWT access y refresh generados
5. Registro de sesión creado en base de datos
6. Tokens devueltos al cliente
7. Cliente almacena tokens de forma segura

### **Token Validation Flow**
1. Cliente envía request con token JWT
2. Servicio valida firma del token
3. Servicio verifica expiración del token
4. Servicio verifica que usuario esté activo
5. Servicio verifica roles de usuario para autorización
6. Request procesado si está autorizado

## 🚀 Deployment

### **Configuración Serverless**
```yaml
service: gamarriando-user-service
provider:
  name: aws
  runtime: python3.9
  stage: ${opt:stage, 'dev'}
  region: ${opt:region, 'us-east-1'}
  tags:
    Project: gamarriando
    Environment: ${self:provider.stage}
    Service: user-service
    ManagedBy: serverless
  environment:
    # Database configuration
    DB_HOST: ${env:DB_HOST, 'gamarriando-product-service-dev.cgb6u24c81zq.us-east-1.rds.amazonaws.com'}
    DB_PORT: ${env:DB_PORT, '5432'}
    DB_NAME: ${env:DB_NAME, 'gamarriando'}
    DB_USER: ${env:DB_USER, 'gamarriando'}
    DB_PASSWORD: ${env:DB_PASSWORD, 'Gamarriando2024!'}
    
    # JWT configuration
    JWT_SECRET_KEY: ${env:JWT_SECRET_KEY, 'gamarriando-super-secret-jwt-key-dev'}
    JWT_ALGORITHM: ${env:JWT_ALGORITHM, 'HS256'}
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: ${env:JWT_ACCESS_TOKEN_EXPIRE_MINUTES, 15}
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: ${env:JWT_REFRESH_TOKEN_EXPIRE_DAYS, 7}
    
    # Security configuration
    BCRYPT_ROUNDS: ${env:BCRYPT_ROUNDS, '12'}
    PASSWORD_MIN_LENGTH: ${env:PASSWORD_MIN_LENGTH, '8'}
    MAX_LOGIN_ATTEMPTS: ${env:MAX_LOGIN_ATTEMPTS, '5'}
    ACCOUNT_LOCKOUT_DURATION_MINUTES: ${env:ACCOUNT_LOCKOUT_DURATION_MINUTES, '30'}
```

### **Dependencias**
```txt
psycopg2-binary==2.9.9
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
boto3==1.34.0
python-dotenv==1.0.0
```

## 📊 Performance y Optimización

### **Database Optimization**
- **Indexes**: En email, username, session_token, refresh_token
- **Connection Pooling**: Pool de conexiones psycopg2
- **Query Optimization**: Prepared statements, joins apropiados

### **Caching Strategy**
- **User Sessions**: Cache en memoria para sesiones activas
- **User Roles**: Cache de roles de usuario por 5 minutos
- **JWT Validation**: Cache de resultados de validación de tokens

### **Rate Limiting**
- **Login Attempts**: 5 por minuto por IP
- **Registration**: 3 por hora por IP
- **Password Reset**: 3 por hora por usuario
- **API Calls**: 100 por minuto por usuario

## 📈 Monitoreo y Logging

### **CloudWatch Metrics**
- **Authentication Success/Failure Rates**
- **Token Generation/Validation Counts**
- **Database Connection Pool Usage**
- **Lambda Function Duration and Errors**

### **Security Logging**
- **Failed Login Attempts**
- **Password Reset Requests**
- **Role Assignment Changes**
- **Session Revocations**

### **Application Logging**
- **User Registration/Login Events**
- **Profile Updates**
- **Role Changes**
- **System Errors**

## 🔗 Integración

### **Con Product Service**
- Autenticación de usuario para operaciones de productos
- Verificación de rol de vendedor para gestión de productos
- Integración de perfil de usuario para reviews de productos

### **Con Payment Service**
- Autenticación de usuario para operaciones de pago
- Perfil de usuario para información de facturación
- Control de acceso basado en roles para pagos

### **Infraestructura Compartida**
- **Database**: Misma instancia PostgreSQL
- **VPC**: Mismos security groups y subnets
- **IAM**: Mismo rol de ejecución Lambda
- **Resource Group**: gamarriando
- **JWT Secret**: Compartido entre todos los servicios

## 🧪 Testing

### **Endpoints de Testing**
```bash
# Registro de usuario
curl -X POST "https://api-dev.gamarriando.com/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "SecurePass123!",
    "first_name": "Test",
    "last_name": "User"
  }'

# Login
curl -X POST "https://api-dev.gamarriando.com/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'

# Obtener perfil
curl -X GET "https://api-dev.gamarriando.com/api/v1/users/profile" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔧 Desarrollo Local

### **Estructura del Proyecto**
```
services/user-service/
├── handlers/                     # Lambda functions individuales
│   ├── auth_register.py         # POST /api/v1/auth/register
│   ├── auth_login.py            # POST /api/v1/auth/login
│   ├── auth_logout.py           # POST /api/v1/auth/logout
│   ├── auth_refresh.py          # POST /api/v1/auth/refresh
│   ├── auth_forgot_password.py  # POST /api/v1/auth/forgot-password
│   ├── auth_reset_password.py   # POST /api/v1/auth/reset-password
│   ├── users_create.py          # POST /api/v1/users
│   ├── users_get.py             # GET /api/v1/users/{id}
│   ├── users_list.py            # GET /api/v1/users
│   ├── users_update.py          # PUT /api/v1/users/{id}
│   ├── users_delete.py          # DELETE /api/v1/users/{id}
│   ├── users_verify_email.py    # POST /api/v1/users/verify-email
│   ├── users_change_password.py # PUT /api/v1/users/change-password
│   ├── users_get_profile.py     # GET /api/v1/users/profile
│   ├── roles_assign.py          # POST /api/v1/roles/assign
│   ├── roles_remove.py          # DELETE /api/v1/roles/remove
│   ├── roles_list.py            # GET /api/v1/roles
│   ├── roles_list_all.py        # GET /api/v1/roles/all
│   ├── sessions_list.py         # GET /api/v1/sessions
│   ├── sessions_revoke.py       # DELETE /api/v1/sessions/{id}
│   └── sessions_revoke_all.py   # DELETE /api/v1/sessions/all
├── auth_utils.py                # Utilidades de autenticación
├── db_utils.py                  # Utilidades de base de datos
├── response_utils.py            # Utilidades de respuesta
├── serverless.yml               # Configuración Serverless
├── requirements.txt             # Dependencias Python
└── README.md                    # Documentación
```

### **Testing Local**
```bash
# Test individual de función
serverless invoke local --function auth_login

# Test con datos específicos
serverless invoke local --function auth_register --data '{
  "email": "test@example.com",
  "username": "testuser",
  "password": "SecurePass123!"
}'
```

## 🔒 Mejores Prácticas de Seguridad

### **Input Validation**
- **Email Format**: Cumple con RFC 5322
- **Password Strength**: Requisitos mínimos aplicados
- **Username**: Alfanumérico con guiones bajos
- **SQL Injection**: Solo queries parametrizadas

### **Token Security**
- **Secret Key**: Fuerte, generado aleatoriamente
- **Token Rotation**: Refresh tokens rotados en uso
- **Blacklisting**: Tokens invalidados almacenados
- **Expiration**: Access tokens de corta duración

### **Session Management**
- **Device Tracking**: Logging de IP y user agent
- **Session Cleanup**: Remoción automática de sesiones expiradas
- **Concurrent Sessions**: Límite configurable por usuario
- **Revocation**: Terminación inmediata de sesión

---

**Gamarriando User Service** - Gestión Segura de Usuarios y Autenticación 🔐

