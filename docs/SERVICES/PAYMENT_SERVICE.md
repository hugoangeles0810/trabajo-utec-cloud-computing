# 💳 Payment Service - Gamarriando

Microservicio de pagos para la plataforma Gamarriando, implementado como 15 funciones Lambda individuales en AWS.

## 🏗️ Arquitectura

### **15 Lambda Functions Individuales**

#### 📦 **Orders Functions (5 funciones)**
- `orders_create` - `POST /api/v1/orders` - Crear orden
- `orders_get` - `GET /api/v1/orders/{order_id}` - Obtener orden
- `orders_list` - `GET /api/v1/orders` - Listar órdenes
- `orders_update` - `PUT /api/v1/orders/{order_id}` - Actualizar orden
- `orders_delete` - `DELETE /api/v1/orders/{order_id}` - Cancelar orden

#### 💰 **Payments Functions (7 funciones)**
- `payments_create` - `POST /api/v1/payments` - Crear pago
- `payments_get` - `GET /api/v1/payments/{payment_id}` - Obtener pago
- `payments_list` - `GET /api/v1/payments` - Listar pagos
- `payments_update` - `PUT /api/v1/payments/{payment_id}` - Actualizar pago
- `payments_delete` - `DELETE /api/v1/payments/{payment_id}` - Eliminar pago
- `payments_process` - `POST /api/v1/payments/{payment_id}/process` - Procesar pago
- `payments_refund` - `POST /api/v1/payments/{payment_id}/refund` - Reembolsar pago

#### 🔄 **Transactions Functions (3 funciones)**
- `transactions_create` - `POST /api/v1/transactions` - Crear transacción
- `transactions_get` - `GET /api/v1/transactions/{transaction_id}` - Obtener transacción
- `transactions_list` - `GET /api/v1/transactions` - Listar transacciones

## 🗄️ Base de Datos

### **Tablas Principales**

#### Orders Table
```sql
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL,
    shipping_address JSONB NOT NULL,
    billing_address JSONB NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Order Items Table
```sql
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Payments Table
```sql
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    payment_method VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'PEN',
    status VARCHAR(20) DEFAULT 'pending',
    gateway_transaction_id VARCHAR(255),
    gateway_response JSONB,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Transactions Table
```sql
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    payment_id INTEGER REFERENCES payments(id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) NOT NULL, -- 'charge', 'refund', 'void'
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    gateway_transaction_id VARCHAR(255),
    gateway_response JSONB,
    failure_reason TEXT,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔧 Estructura del Proyecto

```
services/payment-service/
├── handlers/                     # Lambda functions individuales
│   ├── orders_create.py          # POST /api/v1/orders
│   ├── orders_get.py             # GET /api/v1/orders/{order_id}
│   ├── orders_list.py            # GET /api/v1/orders
│   ├── orders_update.py          # PUT /api/v1/orders/{order_id}
│   ├── orders_delete.py          # DELETE /api/v1/orders/{order_id}
│   ├── payments_create.py        # POST /api/v1/payments
│   ├── payments_get.py           # GET /api/v1/payments/{payment_id}
│   ├── payments_list.py          # GET /api/v1/payments
│   ├── payments_update.py        # PUT /api/v1/payments/{payment_id}
│   ├── payments_delete.py        # DELETE /api/v1/payments/{payment_id}
│   ├── payments_process.py       # POST /api/v1/payments/{payment_id}/process
│   ├── payments_refund.py        # POST /api/v1/payments/{payment_id}/refund
│   ├── transactions_create.py    # POST /api/v1/transactions
│   ├── transactions_get.py       # GET /api/v1/transactions/{transaction_id}
│   └── transactions_list.py      # GET /api/v1/transactions
├── db_utils.py                   # Utilidades de base de datos
├── serverless.yml                # Configuración Serverless
├── requirements.txt              # Dependencias Python
├── package.json                  # Dependencias Node.js
└── .env.example                  # Variables de entorno
```

## 🚀 Deployment

### **Configuración**
```bash
# Instalar dependencias
npm install

# Desplegar en desarrollo
npm run deploy:dev

# Desplegar en producción
npm run deploy:prod
```

### **Variables de Entorno**
```bash
# Database
DATABASE_URL=postgresql://user:pass@host:port/database

# Payment Gateways
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret

# JWT
JWT_SECRET_KEY=your_jwt_secret_key

# AWS
AWS_REGION=us-east-1
```

## 💳 Integración con Pasarelas de Pago

### **Stripe Integration**
```python
import stripe

stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

def process_stripe_payment(amount, currency, payment_method):
    try:
        intent = stripe.PaymentIntent.create(
            amount=int(amount * 100),  # Convert to cents
            currency=currency,
            payment_method=payment_method,
            confirmation_method='manual',
            confirm=True
        )
        return intent
    except stripe.error.CardError as e:
        raise PaymentError(f"Card error: {e.user_message}")
```

### **PayPal Integration**
```python
from paypalrestsdk import Payment

def process_paypal_payment(amount, currency, return_url, cancel_url):
    payment = Payment({
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": return_url,
            "cancel_url": cancel_url
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "Order Payment",
                    "sku": "order",
                    "price": str(amount),
                    "currency": currency,
                    "quantity": 1
                }]
            },
            "amount": {
                "total": str(amount),
                "currency": currency
            },
            "description": "Payment for order"
        }]
    })
    
    if payment.create():
        return payment
    else:
        raise PaymentError(f"PayPal error: {payment.error}")
```

## 🔄 Flujos de Pago

### **Order Creation Flow**
1. Usuario selecciona productos y procede al checkout
2. `orders_create` valida productos y calcula totales
3. Orden creada con estado 'pending'
4. Items de orden guardados en `order_items`
5. Orden devuelta con ID para procesamiento de pago

### **Payment Processing Flow**
1. Usuario selecciona método de pago
2. `payments_create` crea registro de pago
3. `payments_process` procesa pago con pasarela
4. Transacción creada en `transactions`
5. Estado de pago actualizado
6. Orden actualizada con estado de pago

### **Refund Flow**
1. Usuario solicita reembolso
2. `payments_refund` valida elegibilidad
3. Reembolso procesado con pasarela original
4. Nueva transacción de tipo 'refund' creada
5. Estados de pago y orden actualizados

## 📊 Estados de Orden y Pago

### **Order Statuses**
- `pending` - Orden creada, esperando pago
- `paid` - Pago confirmado
- `processing` - Orden siendo procesada
- `shipped` - Orden enviada
- `delivered` - Orden entregada
- `cancelled` - Orden cancelada
- `refunded` - Orden reembolsada

### **Payment Statuses**
- `pending` - Pago creado, esperando procesamiento
- `processing` - Pago siendo procesado
- `completed` - Pago exitoso
- `failed` - Pago fallido
- `cancelled` - Pago cancelado
- `refunded` - Pago reembolsado

### **Transaction Types**
- `charge` - Cargo inicial
- `refund` - Reembolso parcial o total
- `void` - Cancelación antes del procesamiento

## 🧪 Testing

### **Ejemplos de Uso**

#### **Crear Orden**
```bash
curl -X POST "https://api-dev.gamarriando.com/api/v1/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "items": [
      {
        "product_id": 1,
        "quantity": 2,
        "unit_price": 29.99
      }
    ],
    "shipping_address": {
      "street": "Av. Principal 123",
      "city": "Lima",
      "state": "Lima",
      "postal_code": "15001",
      "country": "Peru"
    },
    "billing_address": {
      "street": "Av. Principal 123",
      "city": "Lima",
      "state": "Lima",
      "postal_code": "15001",
      "country": "Peru"
    }
  }'
```

#### **Crear Pago**
```bash
curl -X POST "https://api-dev.gamarriando.com/api/v1/payments" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "order_id": 1,
    "payment_method": "stripe",
    "amount": 59.98,
    "currency": "PEN"
  }'
```

#### **Procesar Pago**
```bash
curl -X POST "https://api-dev.gamarriando.com/api/v1/payments/1/process" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "payment_method_id": "pm_1234567890",
    "confirmation_method": "manual"
  }'
```

#### **Reembolsar Pago**
```bash
curl -X POST "https://api-dev.gamarriando.com/api/v1/payments/1/refund" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "amount": 29.99,
    "reason": "Product defect"
  }'
```

## 🔐 Seguridad

### **Validaciones de Seguridad**
- **Autenticación JWT**: Todos los endpoints requieren token válido
- **Autorización**: Solo usuarios pueden acceder a sus órdenes
- **Validación de Montos**: Verificación de montos contra órdenes
- **Rate Limiting**: Límites en creación de órdenes y pagos
- **PCI Compliance**: No almacenamiento de datos de tarjeta

### **Encriptación**
- **Datos Sensibles**: Encriptación de información de pago
- **Comunicación**: HTTPS para todas las comunicaciones
- **Base de Datos**: Encriptación en reposo
- **Logs**: No logging de información sensible

## 📈 Monitoreo

### **Métricas Clave**
- **Order Creation Rate**: Órdenes creadas por minuto
- **Payment Success Rate**: Tasa de éxito de pagos
- **Average Payment Time**: Tiempo promedio de procesamiento
- **Refund Rate**: Tasa de reembolsos
- **Gateway Response Time**: Tiempo de respuesta de pasarelas

### **Alertas**
- **High Failure Rate**: Tasa de fallos > 5%
- **Slow Processing**: Tiempo de procesamiento > 30s
- **Gateway Errors**: Errores de pasarelas de pago
- **Unusual Activity**: Actividad inusual en pagos

## 🔗 Integración

### **Con Product Service**
- Validación de productos y precios
- Verificación de stock disponible
- Actualización de inventario post-pago

### **Con User Service**
- Autenticación de usuarios
- Validación de permisos
- Historial de órdenes por usuario

### **Con Notification Service**
- Notificaciones de confirmación de pago
- Alertas de fallos de pago
- Notificaciones de reembolsos

### **Infraestructura Compartida**
- **Database**: Misma instancia PostgreSQL
- **VPC**: Mismos security groups y subnets
- **IAM**: Mismo rol de ejecución Lambda
- **Resource Group**: gamarriando

## 🚀 Próximos Pasos

1. **🔧 Implementar Webhooks**: Para notificaciones de pasarelas
2. **💳 Más Pasarelas**: Integrar más métodos de pago
3. **📊 Analytics**: Dashboard de métricas de pagos
4. **🔄 Recurring Payments**: Pagos recurrentes para suscripciones
5. **🌍 Multi-currency**: Soporte para múltiples monedas
6. **📱 Mobile Payments**: Integración con Apple Pay/Google Pay

---

**Gamarriando Payment Service** - Procesamiento Seguro de Pagos 💳

