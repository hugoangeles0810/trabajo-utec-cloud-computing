import json
import logging
from typing import Dict, Any, List

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Simple FastAPI-like app without external dependencies
class SimpleApp:
    def __init__(self):
        self.routes = {}
    
    def get(self, path: str):
        def decorator(func):
            self.routes[f"GET {path}"] = func
            return func
        return decorator
    
    def post(self, path: str):
        def decorator(func):
            self.routes[f"POST {path}"] = func
            return func
        return decorator
    
    def put(self, path: str):
        def decorator(func):
            self.routes[f"PUT {path}"] = func
            return func
        return decorator
    
    def delete(self, path: str):
        def decorator(func):
            self.routes[f"DELETE {path}"] = func
            return func
        return decorator

# Create app instance
app = SimpleApp()

# Health check endpoint
@app.get("/")
@app.get("/health")
def health_check():
    return {
        "message": "Gamarriando Product Service is running!",
        "status": "healthy",
        "version": "1.0.0",
        "docs": "/docs",
        "openapi": "/openapi.json",
        "endpoints": {
            "products": "/api/v1/products",
            "health": "/health",
            "swagger": "/docs"
        }
    }

# Swagger/OpenAPI documentation endpoint
@app.get("/docs")
def swagger_docs():
    return {
        "swagger": "2.0",
        "info": {
            "title": "Gamarriando Product Service API",
            "description": "API para gestión de productos del marketplace Gamarriando",
            "version": "1.0.0",
            "contact": {
                "name": "Gamarriando Team",
                "email": "support@gamarriando.com"
            }
        },
        "host": "h8812dj0wi.execute-api.us-east-1.amazonaws.com",
        "basePath": "/dev",
        "schemes": ["https"],
        "paths": {
            "/": {
                "get": {
                    "summary": "Health Check",
                    "description": "Verificar el estado del servicio",
                    "responses": {
                        "200": {
                            "description": "Servicio funcionando correctamente",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "message": {"type": "string"},
                                    "status": {"type": "string"},
                                    "version": {"type": "string"}
                                }
                            }
                        }
                    }
                }
            },
            "/api/v1/products": {
                "get": {
                    "summary": "Listar productos",
                    "description": "Obtener lista de todos los productos",
                    "responses": {
                        "200": {
                            "description": "Lista de productos",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "products": {
                                        "type": "array",
                                        "items": {
                                            "type": "object",
                                            "properties": {
                                                "id": {"type": "string"},
                                                "name": {"type": "string"},
                                                "price": {"type": "number"},
                                                "description": {"type": "string"},
                                                "category": {"type": "string"},
                                                "vendor": {"type": "string"},
                                                "status": {"type": "string"}
                                            }
                                        }
                                    },
                                    "total": {"type": "integer"},
                                    "page": {"type": "integer"},
                                    "limit": {"type": "integer"}
                                }
                            }
                        }
                    }
                },
                "post": {
                    "summary": "Crear producto",
                    "description": "Crear un nuevo producto",
                    "parameters": [
                        {
                            "name": "body",
                            "in": "body",
                            "required": True,
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "name": {"type": "string"},
                                    "price": {"type": "number"},
                                    "description": {"type": "string"},
                                    "category_id": {"type": "string"},
                                    "vendor_id": {"type": "string"},
                                    "stock": {"type": "integer"},
                                    "images": {
                                        "type": "array",
                                        "items": {"type": "string"}
                                    }
                                },
                                "required": ["name", "price", "category_id", "vendor_id"]
                            }
                        }
                    ],
                    "responses": {
                        "201": {
                            "description": "Producto creado exitosamente",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "message": {"type": "string"},
                                    "product_id": {"type": "string"}
                                }
                            }
                        },
                        "400": {
                            "description": "Datos de entrada inválidos"
                        }
                    }
                }
            },
            "/api/v1/products/{product_id}": {
                "get": {
                    "summary": "Obtener producto por ID",
                    "description": "Obtener detalles de un producto específico",
                    "parameters": [
                        {
                            "name": "product_id",
                            "in": "path",
                            "required": True,
                            "type": "string",
                            "description": "ID del producto"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "Detalles del producto",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "id": {"type": "string"},
                                    "name": {"type": "string"},
                                    "price": {"type": "number"},
                                    "description": {"type": "string"},
                                    "category": {"type": "string"},
                                    "vendor": {"type": "string"},
                                    "status": {"type": "string"},
                                    "stock": {"type": "integer"},
                                    "images": {
                                        "type": "array",
                                        "items": {"type": "string"}
                                    },
                                    "created_at": {"type": "string"},
                                    "updated_at": {"type": "string"}
                                }
                            }
                        },
                        "404": {
                            "description": "Producto no encontrado"
                        }
                    }
                },
                "put": {
                    "summary": "Actualizar producto",
                    "description": "Actualizar un producto existente",
                    "parameters": [
                        {
                            "name": "product_id",
                            "in": "path",
                            "required": True,
                            "type": "string",
                            "description": "ID del producto"
                        },
                        {
                            "name": "body",
                            "in": "body",
                            "required": True,
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "name": {"type": "string"},
                                    "price": {"type": "number"},
                                    "description": {"type": "string"},
                                    "stock": {"type": "integer"},
                                    "status": {"type": "string"},
                                    "images": {
                                        "type": "array",
                                        "items": {"type": "string"}
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "Producto actualizado exitosamente"
                        },
                        "404": {
                            "description": "Producto no encontrado"
                        }
                    }
                },
                "delete": {
                    "summary": "Eliminar producto",
                    "description": "Eliminar un producto",
                    "parameters": [
                        {
                            "name": "product_id",
                            "in": "path",
                            "required": True,
                            "type": "string",
                            "description": "ID del producto"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "Producto eliminado exitosamente"
                        },
                        "404": {
                            "description": "Producto no encontrado"
                        }
                    }
                }
            },
            "/api/v1/categories": {
                "get": {
                    "summary": "Listar categorías",
                    "description": "Obtener lista de todas las categorías",
                    "responses": {
                        "200": {
                            "description": "Lista de categorías",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "categories": {
                                        "type": "array",
                                        "items": {
                                            "type": "object",
                                            "properties": {
                                                "id": {"type": "string"},
                                                "name": {"type": "string"},
                                                "slug": {"type": "string"},
                                                "description": {"type": "string"},
                                                "parent_id": {"type": "string"}
                                            }
                                        }
                                    },
                                    "total": {"type": "integer"}
                                }
                            }
                        }
                    }
                }
            },
            "/api/v1/vendors": {
                "get": {
                    "summary": "Listar vendedores",
                    "description": "Obtener lista de todos los vendedores",
                    "responses": {
                        "200": {
                            "description": "Lista de vendedores",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "vendors": {
                                        "type": "array",
                                        "items": {
                                            "type": "object",
                                            "properties": {
                                                "id": {"type": "string"},
                                                "name": {"type": "string"},
                                                "email": {"type": "string"},
                                                "phone": {"type": "string"},
                                                "is_active": {"type": "boolean"},
                                                "is_verified": {"type": "boolean"}
                                            }
                                        }
                                    },
                                    "total": {"type": "integer"}
                                }
                            }
                        }
                    }
                }
            }
        }
    }

# OpenAPI JSON endpoint
@app.get("/openapi.json")
def openapi_json():
    return app.routes.get("GET /docs", lambda: {})()

# Products endpoints
@app.get("/api/v1/products")
def get_products():
    return {
        "products": [
            {
                "id": "1",
                "name": "Producto de Ejemplo",
                "price": 29.99,
                "description": "Un producto de ejemplo para demostración",
                "category": "Electrónicos",
                "vendor": "Vendor Demo",
                "status": "active",
                "stock": 10,
                "images": ["https://example.com/image1.jpg"],
                "created_at": "2024-10-04T21:00:00Z",
                "updated_at": "2024-10-04T21:00:00Z"
            }
        ],
        "total": 1,
        "page": 1,
        "limit": 10
    }

@app.post("/api/v1/products")
def create_product():
    return {
        "message": "Producto creado exitosamente",
        "product_id": "new-product-123"
    }

@app.get("/api/v1/products/{product_id}")
def get_product(product_id: str):
    return {
        "id": product_id,
        "name": f"Producto {product_id}",
        "price": 29.99,
        "description": f"Descripción del producto {product_id}",
        "category": "Electrónicos",
        "vendor": "Vendor Demo",
        "status": "active",
        "stock": 5,
        "images": ["https://example.com/image1.jpg"],
        "created_at": "2024-10-04T21:00:00Z",
        "updated_at": "2024-10-04T21:00:00Z"
    }

@app.put("/api/v1/products/{product_id}")
def update_product(product_id: str):
    return {
        "message": f"Producto {product_id} actualizado exitosamente"
    }

@app.delete("/api/v1/products/{product_id}")
def delete_product(product_id: str):
    return {
        "message": f"Producto {product_id} eliminado exitosamente"
    }

# Categories endpoints
@app.get("/api/v1/categories")
def get_categories():
    return {
        "categories": [
            {
                "id": "1",
                "name": "Electrónicos",
                "slug": "electronicos",
                "description": "Productos electrónicos y tecnología",
                "parent_id": None
            },
            {
                "id": "2",
                "name": "Ropa",
                "slug": "ropa",
                "description": "Ropa y accesorios",
                "parent_id": None
            }
        ],
        "total": 2
    }

# Vendors endpoints
@app.get("/api/v1/vendors")
def get_vendors():
    return {
        "vendors": [
            {
                "id": "1",
                "name": "Vendor Demo",
                "email": "vendor@demo.com",
                "phone": "+1234567890",
                "is_active": True,
                "is_verified": True
            }
        ],
        "total": 1
    }

# Lambda handler
def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Lambda handler with FastAPI-like routing and Swagger documentation
    """
    try:
        # Log the incoming event
        logger.info(f"Received event: {json.dumps(event)}")
        
        # Extract HTTP method and path
        http_method = event.get('httpMethod', 'GET')
        path = event.get('path', '/')
        
        # Handle OPTIONS requests for CORS
        if http_method == 'OPTIONS':
            return {
                'statusCode': 200,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
                },
                'body': ''
            }
        
        # Find matching route
        route_key = f"{http_method} {path}"
        
        # Handle path parameters (simple implementation)
        if route_key not in app.routes:
            # Try to match with path parameters
            for route_pattern, handler in app.routes.items():
                if route_pattern.startswith(f"{http_method} /api/v1/products/") and path.startswith("/api/v1/products/"):
                    # Extract product_id from path
                    product_id = path.split("/")[-1]
                    result = handler(product_id)
                    break
            else:
                # No route found
                return {
                    'statusCode': 404,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'message': 'Endpoint not found',
                        'path': path,
                        'method': http_method,
                        'available_routes': list(app.routes.keys())
                    })
                }
        else:
            # Direct route match
            result = app.routes[route_key]()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
            },
            'body': json.dumps(result)
        }
    
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'message': 'Internal server error',
                'error': str(e)
            })
        }