# Payment Service - Gamarriando

Microservicio de pagos para la plataforma Gamarriando, implementado como Lambda functions individuales en AWS.

## 🏗️ Arquitectura

- **15 Lambda Functions** individuales (una por endpoint)
- **Base de datos compartida** PostgreSQL con product-service
- **API Gateway** compartido con product-service
- **Resource Group** gamarriando en AWS

## 📁 Estructura del Proyecto

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

## 🗄️ Base de Datos

### Tablas Principales:

- **orders** - Órdenes de compra
- **order_items** - Items de cada orden
- **payments** - Pagos asociados a órdenes
- **transactions** - Historial de transacciones

## 🚀 Despliegue

```bash
# Instalar dependencias
npm install

# Desplegar en desarrollo
npm run deploy:dev

# Desplegar en producción
npm run deploy:prod
```

## 🔧 Configuración

1. Copiar `.env.example` a `.env`
2. Configurar variables de entorno
3. Configurar credenciales de AWS
4. Desplegar con Serverless Framework

## 📊 Endpoints

### Orders
- `POST /api/v1/orders` - Crear orden
- `GET /api/v1/orders` - Listar órdenes
- `GET /api/v1/orders/{id}` - Obtener orden
- `PUT /api/v1/orders/{id}` - Actualizar orden
- `DELETE /api/v1/orders/{id}` - Cancelar orden

### Payments
- `POST /api/v1/payments` - Crear pago
- `GET /api/v1/payments` - Listar pagos
- `GET /api/v1/payments/{id}` - Obtener pago
- `PUT /api/v1/payments/{id}` - Actualizar pago
- `DELETE /api/v1/payments/{id}` - Eliminar pago
- `POST /api/v1/payments/{id}/process` - Procesar pago
- `POST /api/v1/payments/{id}/refund` - Reembolsar pago

### Transactions
- `POST /api/v1/transactions` - Crear transacción
- `GET /api/v1/transactions` - Listar transacciones
- `GET /api/v1/transactions/{id}` - Obtener transacción

## 🔗 Integración

- **Product Service**: Comparte base de datos PostgreSQL
- **API Gateway**: Mismo endpoint base
- **AWS Resource Group**: gamarriando
- **VPC**: Misma configuración de red
