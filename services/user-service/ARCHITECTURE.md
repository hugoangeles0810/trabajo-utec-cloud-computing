# Gamarriando User Service - Architecture

## Overview

The User Service is a microservice responsible for authentication, authorization, and user management in the Gamarriando marketplace. It follows the same architectural patterns as the product-service and payment-service.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        API Gateway                              │
│  https://[api-id].execute-api.us-east-1.amazonaws.com/dev      │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│                    Lambda Functions                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐│
│  │   Auth      │ │    Users    │ │    Roles    │ │  Sessions   ││
│  │ (6 funcs)   │ │ (8 funcs)   │ │ (4 funcs)   │ │ (3 funcs)   ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘│
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│                    VPC Configuration                           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐               │
│  │ Security    │ │   Subnet    │ │   Subnet    │               │
│  │ Group       │ │ us-east-1a  │ │ us-east-1b  │               │
│  │ sg-xxx      │ │ subnet-xxx  │ │ subnet-xxx  │               │
│  └─────────────┘ └─────────────┘ └─────────────┘               │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│                PostgreSQL Database                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐│
│  │    users    │ │ user_roles  │ │user_sessions│ │password_    ││
│  │             │ │             │ │             │ │reset_tokens ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘│
│  ┌─────────────┐                                               │
│  │email_verify │                                               │
│  │_tokens      │                                               │
│  └─────────────┘                                               │
└─────────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. API Gateway
- **Base URL**: `https://[api-id].execute-api.us-east-1.amazonaws.com/dev`
- **Endpoints**: 21 total endpoints
- **CORS**: Enabled for all origins
- **Authentication**: JWT-based

### 2. Lambda Functions (21 total)

#### Authentication Functions (6)
- `auth_register` - User registration with email verification
- `auth_login` - User login with JWT token generation
- `auth_logout` - User logout with token blacklisting
- `auth_refresh` - Refresh access token using refresh token
- `auth_forgot_password` - Generate password reset token
- `auth_reset_password` - Reset password with token validation

#### User Management Functions (8)
- `users_create` - Create new user (admin only)
- `users_get` - Get user by ID
- `users_list` - List users with filtering and pagination
- `users_update` - Update user information
- `users_delete` - Delete user account
- `users_verify_email` - Verify email address
- `users_change_password` - Change user password
- `users_get_profile` - Get current user profile

#### Role Management Functions (4)
- `roles_assign` - Assign role to user
- `roles_remove` - Remove role from user
- `roles_list` - Get user roles
- `roles_list_all` - List all available roles

#### Session Management Functions (3)
- `sessions_list` - List user sessions
- `sessions_revoke` - Revoke specific session
- `sessions_revoke_all` - Revoke all user sessions

### 3. Database Schema

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

### 4. Security Architecture

#### JWT Token Structure
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

#### Password Security
- **Hashing**: Bcrypt with 12 salt rounds
- **Validation**: Minimum 8 characters, mixed case, numbers
- **History**: Track last 5 passwords
- **Lockout**: 5 failed attempts = 30 minute lockout

#### Session Security
- **Access Token**: 15 minutes expiration
- **Refresh Token**: 7 days expiration
- **Rotation**: Refresh token rotated on use
- **Blacklisting**: Tokens blacklisted on logout

### 5. Integration Points

#### With Product Service
- User authentication for product operations
- Vendor role verification for product management
- User profile integration for product reviews

#### With Payment Service
- User authentication for payment operations
- User profile for billing information
- Role-based payment access control

#### Shared Infrastructure
- **Database**: Same PostgreSQL instance
- **VPC**: Same security groups and subnets
- **IAM**: Same Lambda execution role
- **Resource Group**: gamarriando
- **JWT Secret**: Shared across all services

### 6. Data Flow

#### User Registration Flow
1. User submits registration form
2. `auth_register` validates input
3. Password hashed with bcrypt
4. User record created in database
5. Email verification token generated
6. Verification email sent
7. User clicks verification link
8. `users_verify_email` validates token
9. User account activated

#### User Login Flow
1. User submits login credentials
2. `auth_login` validates credentials
3. Password verified with bcrypt
4. JWT access and refresh tokens generated
5. Session record created in database
6. Tokens returned to client
7. Client stores tokens securely

#### Token Validation Flow
1. Client sends request with JWT token
2. Service validates token signature
3. Service checks token expiration
4. Service verifies user is still active
5. Service checks user roles for authorization
6. Request processed if authorized

### 7. Performance Considerations

#### Database Optimization
- **Indexes**: On email, username, session_token, refresh_token
- **Connection Pooling**: psycopg2 connection pool
- **Query Optimization**: Prepared statements, proper joins

#### Caching Strategy
- **User Sessions**: In-memory cache for active sessions
- **User Roles**: Cache user roles for 5 minutes
- **JWT Validation**: Cache token validation results

#### Rate Limiting
- **Login Attempts**: 5 per minute per IP
- **Registration**: 3 per hour per IP
- **Password Reset**: 3 per hour per user
- **API Calls**: 100 per minute per user

### 8. Monitoring and Logging

#### CloudWatch Metrics
- **Authentication Success/Failure Rates**
- **Token Generation/Validation Counts**
- **Database Connection Pool Usage**
- **Lambda Function Duration and Errors**

#### Security Logging
- **Failed Login Attempts**
- **Password Reset Requests**
- **Role Assignment Changes**
- **Session Revocations**

#### Application Logging
- **User Registration/Login Events**
- **Profile Updates**
- **Role Changes**
- **System Errors**

### 9. Deployment Configuration

#### Serverless.yml Structure
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
    # Database configuration (same as other services)
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
    
    # Application settings
    DEBUG: ${env:DEBUG, 'false'}
    LOG_LEVEL: ${env:LOG_LEVEL, 'INFO'}
    
  role: arn:aws:iam::331005567943:role/GamarriandoLambdaRole
  vpc:
    securityGroupIds:
      - sg-0b7776e36a7150695
    subnetIds:
      - subnet-0d8b3798c4f2897be
      - subnet-0f56032e6c45bd02d
```

#### Dependencies
```txt
psycopg2-binary==2.9.9
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
boto3==1.34.0
python-dotenv==1.0.0
```

### 10. Security Best Practices

#### Input Validation
- **Email Format**: RFC 5322 compliant
- **Password Strength**: Minimum requirements enforced
- **Username**: Alphanumeric with underscores
- **SQL Injection**: Parameterized queries only

#### Token Security
- **Secret Key**: Strong, randomly generated
- **Token Rotation**: Refresh tokens rotated on use
- **Blacklisting**: Invalidated tokens stored
- **Expiration**: Short-lived access tokens

#### Session Management
- **Device Tracking**: IP and user agent logging
- **Session Cleanup**: Automatic expired session removal
- **Concurrent Sessions**: Configurable limit per user
- **Revocation**: Immediate session termination

This architecture provides a secure, scalable foundation for user management in the Gamarriando marketplace while maintaining consistency with the existing service architecture.
