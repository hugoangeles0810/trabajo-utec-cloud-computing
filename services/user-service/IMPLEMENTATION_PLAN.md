# Gamarriando User Service - Implementation Plan

## Overview

The User Service will handle authentication, authorization, and user management for the Gamarriando marketplace. It will use the same PostgreSQL database, VPC configuration, and infrastructure as the product-service and payment-service.

## 1. Database Schema Design

### 1.1 Users Table
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

### 1.2 User Roles Table
```sql
CREATE TABLE user_roles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role_name VARCHAR(50) NOT NULL, -- 'customer', 'vendor', 'admin', 'moderator'
    granted_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);
```

### 1.3 User Sessions Table
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

### 1.4 Password Reset Tokens Table
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

### 1.5 Email Verification Tokens Table
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

## 2. Lambda Functions Architecture

**IMPORTANTE: Cada endpoint será un Lambda function individual, siguiendo exactamente el mismo patrón que product-service y payment-service.**

### 2.1 Authentication Endpoints (6 Lambda Functions Individuales)
- `auth_register` - POST /api/v1/auth/register
- `auth_login` - POST /api/v1/auth/login
- `auth_logout` - POST /api/v1/auth/logout
- `auth_refresh` - POST /api/v1/auth/refresh
- `auth_forgot_password` - POST /api/v1/auth/forgot-password
- `auth_reset_password` - POST /api/v1/auth/reset-password

### 2.2 User Management Endpoints (8 Lambda Functions Individuales)
- `users_create` - POST /api/v1/users
- `users_get` - GET /api/v1/users/{user_id}
- `users_list` - GET /api/v1/users
- `users_update` - PUT /api/v1/users/{user_id}
- `users_delete` - DELETE /api/v1/users/{user_id}
- `users_verify_email` - POST /api/v1/users/{user_id}/verify-email
- `users_change_password` - POST /api/v1/users/{user_id}/change-password
- `users_get_profile` - GET /api/v1/users/me

### 2.3 Role Management Endpoints (4 Lambda Functions Individuales)
- `roles_assign` - POST /api/v1/users/{user_id}/roles
- `roles_remove` - DELETE /api/v1/users/{user_id}/roles/{role_id}
- `roles_list` - GET /api/v1/users/{user_id}/roles
- `roles_list_all` - GET /api/v1/roles

### 2.4 Session Management Endpoints (3 Lambda Functions Individuales)
- `sessions_list` - GET /api/v1/users/{user_id}/sessions
- `sessions_revoke` - DELETE /api/v1/sessions/{session_id}
- `sessions_revoke_all` - DELETE /api/v1/users/{user_id}/sessions

**Total: 21 Lambda Functions Individuales (1 endpoint = 1 Lambda function)**

## 3. Implementation Steps

### Step 1: Database Setup
1. Create database migration script
2. Add user-related tables to PostgreSQL
3. Create indexes for performance
4. Add sample data for testing

### Step 2: Core Infrastructure
1. Copy and adapt `db_utils.py` from payment-service
2. Create `serverless.yml` with 21 individual Lambda functions
3. Update `package.json` and `requirements.txt`
4. Add JWT and password hashing utilities
5. Create directory structure:
   ```
   services/user-service/
   ├── handlers/
   │   ├── auth_register.py
   │   ├── auth_login.py
   │   ├── auth_logout.py
   │   ├── auth_refresh.py
   │   ├── auth_forgot_password.py
   │   ├── auth_reset_password.py
   │   ├── users_create.py
   │   ├── users_get.py
   │   ├── users_list.py
   │   ├── users_update.py
   │   ├── users_delete.py
   │   ├── users_verify_email.py
   │   ├── users_change_password.py
   │   ├── users_get_profile.py
   │   ├── roles_assign.py
   │   ├── roles_remove.py
   │   ├── roles_list.py
   │   ├── roles_list_all.py
   │   ├── sessions_list.py
   │   ├── sessions_revoke.py
   │   └── sessions_revoke_all.py
   ├── migrations/
   │   └── user_tables.sql
   ├── scripts/
   │   ├── setup-db.sh
   │   └── test-endpoints.sh
   ├── db_utils.py
   ├── serverless.yml
   ├── requirements.txt
   ├── package.json
   └── README.md
   ```

### Step 3: Authentication Handlers (6 archivos individuales)
1. `handlers/auth_register.py` - Implement registration with email verification
2. `handlers/auth_login.py` - Implement login with JWT token generation
3. `handlers/auth_logout.py` - Implement logout and session management
4. `handlers/auth_refresh.py` - Implement refresh token mechanism
5. `handlers/auth_forgot_password.py` - Implement password reset request
6. `handlers/auth_reset_password.py` - Implement password reset with token

### Step 4: User Management Handlers (8 archivos individuales)
1. `handlers/users_create.py` - Implement user creation (admin only)
2. `handlers/users_get.py` - Implement get user by ID
3. `handlers/users_list.py` - Implement list users with filtering
4. `handlers/users_update.py` - Implement update user information
5. `handlers/users_delete.py` - Implement delete user account
6. `handlers/users_verify_email.py` - Implement email verification
7. `handlers/users_change_password.py` - Implement password change
8. `handlers/users_get_profile.py` - Implement get current user profile

### Step 5: Role Management Handlers (4 archivos individuales)
1. `handlers/roles_assign.py` - Implement role assignment to user
2. `handlers/roles_remove.py` - Implement role removal from user
3. `handlers/roles_list.py` - Implement get user roles
4. `handlers/roles_list_all.py` - Implement list all available roles

### Step 6: Session Management Handlers (3 archivos individuales)
1. `handlers/sessions_list.py` - Implement list user sessions
2. `handlers/sessions_revoke.py` - Implement revoke specific session
3. `handlers/sessions_revoke_all.py` - Implement revoke all user sessions

### Step 7: Security & Validation
1. Add input validation
2. Implement rate limiting
3. Add security headers
4. Implement CORS

### Step 8: Testing & Deployment
1. Create test scripts
2. Deploy to AWS
3. Test all endpoints
4. Verify integration

## 4. Security Features

### 4.1 Password Security
- Bcrypt hashing with salt rounds
- Password strength validation
- Password history tracking
- Account lockout after failed attempts

### 4.2 JWT Token Management
- Access tokens (short-lived: 15 minutes)
- Refresh tokens (long-lived: 7 days)
- Token blacklisting on logout
- Secure token storage

### 4.3 Session Security
- Session token rotation
- Device tracking
- IP address logging
- Automatic session cleanup

### 4.4 Rate Limiting
- Login attempts: 5 per minute
- Registration: 3 per hour
- Password reset: 3 per hour
- API calls: 100 per minute per user

## 5. Environment Variables

```bash
# Database Configuration (same as other services)
DB_HOST=gamarriando-product-service-dev.cgb6u24c81zq.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=gamarriando
DB_USER=gamarriando
DB_PASSWORD=Gamarriando2024!

# JWT Configuration
JWT_SECRET_KEY=your-super-secret-jwt-key
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=15
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

# Security Configuration
BCRYPT_ROUNDS=12
PASSWORD_MIN_LENGTH=8
MAX_LOGIN_ATTEMPTS=5
ACCOUNT_LOCKOUT_DURATION_MINUTES=30

# Email Configuration (for verification)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@gamarriando.com

# Application Settings
DEBUG=false
LOG_LEVEL=INFO
```

## 6. API Endpoints Summary

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password with token

### User Management
- `POST /api/v1/users` - Create user (admin only)
- `GET /api/v1/users/{user_id}` - Get user by ID
- `GET /api/v1/users` - List users (with filters)
- `PUT /api/v1/users/{user_id}` - Update user
- `DELETE /api/v1/users/{user_id}` - Delete user
- `GET /api/v1/users/me` - Get current user profile
- `POST /api/v1/users/{user_id}/verify-email` - Verify email
- `POST /api/v1/users/{user_id}/change-password` - Change password

### Role Management
- `POST /api/v1/users/{user_id}/roles` - Assign role to user
- `DELETE /api/v1/users/{user_id}/roles/{role_id}` - Remove role from user
- `GET /api/v1/users/{user_id}/roles` - Get user roles
- `GET /api/v1/roles` - List all available roles

### Session Management
- `GET /api/v1/users/{user_id}/sessions` - Get user sessions
- `DELETE /api/v1/sessions/{session_id}` - Revoke specific session
- `DELETE /api/v1/users/{user_id}/sessions` - Revoke all user sessions

## 7. Integration Points

### 7.1 With Product Service
- User authentication for product operations
- Vendor role verification for product management
- User profile integration

### 7.2 With Payment Service
- User authentication for payment operations
- User profile for billing information
- Role-based payment access

### 7.3 Shared Components
- Same database instance
- Same VPC configuration
- Same IAM role
- Same resource group
- Shared JWT secret (for token validation across services)

## 8. Testing Strategy

### 8.1 Unit Tests
- Password hashing/verification
- JWT token generation/validation
- Database operations
- Input validation

### 8.2 Integration Tests
- Authentication flow
- User registration/login
- Role management
- Session management

### 8.3 End-to-End Tests
- Complete user journey
- Cross-service authentication
- Security scenarios

## 9. Deployment Configuration

### 9.1 Serverless.yml Structure
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
    # Same database config as other services
    # JWT and security config
  role: arn:aws:iam::331005567943:role/GamarriandoLambdaRole
  vpc:
    securityGroupIds:
      - sg-0b7776e36a7150695
    subnetIds:
      - subnet-0d8b3798c4f2897be
      - subnet-0f56032e6c45bd02d

functions:
  # Authentication Functions (6 individual Lambda functions)
  auth_register:
    handler: handlers/auth_register.lambda_handler
    timeout: 30
    memorySize: 512
    events:
      - http:
          path: /api/v1/auth/register
          method: POST
          cors: true
  
  auth_login:
    handler: handlers/auth_login.lambda_handler
    timeout: 30
    memorySize: 512
    events:
      - http:
          path: /api/v1/auth/login
          method: POST
          cors: true
  
  auth_logout:
    handler: handlers/auth_logout.lambda_handler
    timeout: 20
    memorySize: 256
    events:
      - http:
          path: /api/v1/auth/logout
          method: POST
          cors: true
  
  auth_refresh:
    handler: handlers/auth_refresh.lambda_handler
    timeout: 20
    memorySize: 256
    events:
      - http:
          path: /api/v1/auth/refresh
          method: POST
          cors: true
  
  auth_forgot_password:
    handler: handlers/auth_forgot_password.lambda_handler
    timeout: 30
    memorySize: 512
    events:
      - http:
          path: /api/v1/auth/forgot-password
          method: POST
          cors: true
  
  auth_reset_password:
    handler: handlers/auth_reset_password.lambda_handler
    timeout: 30
    memorySize: 512
    events:
      - http:
          path: /api/v1/auth/reset-password
          method: POST
          cors: true
  
  # User Management Functions (8 individual Lambda functions)
  users_create:
    handler: handlers/users_create.lambda_handler
    timeout: 30
    memorySize: 512
    events:
      - http:
          path: /api/v1/users
          method: POST
          cors: true
  
  users_get:
    handler: handlers/users_get.lambda_handler
    timeout: 20
    memorySize: 256
    events:
      - http:
          path: /api/v1/users/{user_id}
          method: GET
          cors: true
  
  users_list:
    handler: handlers/users_list.lambda_handler
    timeout: 20
    memorySize: 256
    events:
      - http:
          path: /api/v1/users
          method: GET
          cors: true
  
  users_update:
    handler: handlers/users_update.lambda_handler
    timeout: 30
    memorySize: 512
    events:
      - http:
          path: /api/v1/users/{user_id}
          method: PUT
          cors: true
  
  users_delete:
    handler: handlers/users_delete.lambda_handler
    timeout: 20
    memorySize: 256
    events:
      - http:
          path: /api/v1/users/{user_id}
          method: DELETE
          cors: true
  
  users_verify_email:
    handler: handlers/users_verify_email.lambda_handler
    timeout: 30
    memorySize: 512
    events:
      - http:
          path: /api/v1/users/{user_id}/verify-email
          method: POST
          cors: true
  
  users_change_password:
    handler: handlers/users_change_password.lambda_handler
    timeout: 30
    memorySize: 512
    events:
      - http:
          path: /api/v1/users/{user_id}/change-password
          method: POST
          cors: true
  
  users_get_profile:
    handler: handlers/users_get_profile.lambda_handler
    timeout: 20
    memorySize: 256
    events:
      - http:
          path: /api/v1/users/me
          method: GET
          cors: true
  
  # Role Management Functions (4 individual Lambda functions)
  roles_assign:
    handler: handlers/roles_assign.lambda_handler
    timeout: 30
    memorySize: 512
    events:
      - http:
          path: /api/v1/users/{user_id}/roles
          method: POST
          cors: true
  
  roles_remove:
    handler: handlers/roles_remove.lambda_handler
    timeout: 20
    memorySize: 256
    events:
      - http:
          path: /api/v1/users/{user_id}/roles/{role_id}
          method: DELETE
          cors: true
  
  roles_list:
    handler: handlers/roles_list.lambda_handler
    timeout: 20
    memorySize: 256
    events:
      - http:
          path: /api/v1/users/{user_id}/roles
          method: GET
          cors: true
  
  roles_list_all:
    handler: handlers/roles_list_all.lambda_handler
    timeout: 20
    memorySize: 256
    events:
      - http:
          path: /api/v1/roles
          method: GET
          cors: true
  
  # Session Management Functions (3 individual Lambda functions)
  sessions_list:
    handler: handlers/sessions_list.lambda_handler
    timeout: 20
    memorySize: 256
    events:
      - http:
          path: /api/v1/users/{user_id}/sessions
          method: GET
          cors: true
  
  sessions_revoke:
    handler: handlers/sessions_revoke.lambda_handler
    timeout: 20
    memorySize: 256
    events:
      - http:
          path: /api/v1/sessions/{session_id}
          method: DELETE
          cors: true
  
  sessions_revoke_all:
    handler: handlers/sessions_revoke_all.lambda_handler
    timeout: 20
    memorySize: 256
    events:
      - http:
          path: /api/v1/users/{user_id}/sessions
          method: DELETE
          cors: true
```

### 9.2 Dependencies
```txt
psycopg2-binary==2.9.9
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
boto3==1.34.0
python-dotenv==1.0.0
```

## 10. Success Criteria

### 10.1 Functional Requirements
- ✅ User registration with email verification
- ✅ Secure login/logout with JWT tokens
- ✅ Password reset functionality
- ✅ Role-based access control
- ✅ Session management
- ✅ User profile management

### 10.2 Non-Functional Requirements
- ✅ Response time < 500ms for auth operations
- ✅ 99.9% uptime
- ✅ Secure password storage
- ✅ Rate limiting implemented
- ✅ CORS configured
- ✅ Comprehensive logging

### 10.3 Integration Requirements
- ✅ Same database as other services
- ✅ Same VPC and security configuration
- ✅ Same resource group
- ✅ JWT tokens work across all services
- ✅ Role-based access in other services

## 11. Timeline Estimate

- **Step 1-2**: Database setup and infrastructure (2 hours)
- **Step 3**: Authentication handlers - 6 individual Lambda functions (4 hours)
- **Step 4**: User management handlers - 8 individual Lambda functions (4 hours)
- **Step 5**: Role management handlers - 4 individual Lambda functions (2 hours)
- **Step 6**: Session management handlers - 3 individual Lambda functions (2 hours)
- **Step 7**: Security and validation (2 hours)
- **Step 8**: Testing and deployment (2 hours)

**Total Estimated Time: 18 hours**
**Total Lambda Functions: 21 individual functions**
**Total Files to Create: 21 handler files + infrastructure files**

## 12. Risk Mitigation

### 12.1 Security Risks
- **Risk**: Password breaches
- **Mitigation**: Strong hashing, rate limiting, account lockout

### 12.2 Performance Risks
- **Risk**: Database connection issues
- **Mitigation**: Connection pooling, proper indexing

### 12.3 Integration Risks
- **Risk**: JWT token validation across services
- **Mitigation**: Shared secret, proper token format

## 13. Lambda Individual Pattern Implementation

### 13.1 Pattern Consistency
**IMPORTANTE**: El user-service seguirá exactamente el mismo patrón que product-service y payment-service:

- **1 endpoint = 1 Lambda function individual**
- **1 archivo Python por Lambda function**
- **Misma estructura de directorios**: `handlers/` con archivos individuales
- **Misma configuración serverless.yml**: cada función definida individualmente
- **Misma estructura de respuesta**: JSON con statusCode, headers, body
- **Misma gestión de errores**: funciones helper para responses
- **Misma serialización**: conversión de Decimal y datetime para JSON

### 13.2 Estructura de Archivo Lambda Individual
Cada handler seguirá esta estructura estándar:

```python
import json
import logging
import os
import sys
from datetime import datetime
from typing import Dict, Any

sys.path.append('/var/task')
from db_utils import execute_query, execute_single_query, execute_insert, execute_update, execute_delete

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    try:
        logger.info(f"Request: {json.dumps(event)}")
        
        # Handle CORS preflight
        if event.get('httpMethod') == 'OPTIONS':
            return cors_response()
        
        # Extract data from event
        # Process request
        # Return response
        
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return error_response("Internal server error", 500, str(e))

def success_response(data: Any, message: str = "Success") -> Dict[str, Any]:
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'data': data,
            'message': message,
        })
    }

def error_response(message: str, status_code: int = 500, error: str = None) -> Dict[str, Any]:
    response_data = {'message': message}
    if error:
        response_data['error'] = str(error)
    
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(response_data)
    }

def cors_response() -> Dict[str, Any]:
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
        },
        'body': ''
    }
```

### 13.3 Beneficios del Patrón Individual
- **Escalabilidad**: Cada endpoint escala independientemente
- **Mantenibilidad**: Código más fácil de mantener y debuggear
- **Deployment**: Deploy individual de funciones sin afectar otras
- **Monitoreo**: Métricas individuales por endpoint
- **Costos**: Pago solo por uso real de cada función
- **Consistencia**: Mismo patrón en todos los servicios

### 13.4 Naming Convention
- **Archivos**: `{category}_{action}.py` (ej: `auth_register.py`, `users_get.py`)
- **Funciones Lambda**: `{category}_{action}` (ej: `auth_register`, `users_get`)
- **Endpoints**: `/api/v1/{category}/{action}` (ej: `/api/v1/auth/register`)

This plan provides a comprehensive roadmap for implementing a secure, scalable user service that integrates seamlessly with the existing Gamarriando infrastructure, following the exact same individual Lambda pattern used in product-service and payment-service.
