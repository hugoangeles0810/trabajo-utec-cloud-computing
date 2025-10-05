import json
import logging
from typing import Dict, Any

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Products List Lambda function - GET /api/v1/products
    """
    try:
        logger.info(f"Products list request: {json.dumps(event)}")
        
        # Handle OPTIONS requests for CORS
        if event.get('httpMethod') == 'OPTIONS':
            return {
                'statusCode': 200,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                    'Access-Control-Allow-Methods': 'GET, OPTIONS'
                },
                'body': ''
            }
        
        # Get query parameters for pagination
        query_params = event.get('queryStringParameters') or {}
        page = int(query_params.get('page', 1))
        limit = int(query_params.get('limit', 10))
        
        # Mock products data
        products = [
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
            },
            {
                "id": "2",
                "name": "Otro Producto",
                "price": 49.99,
                "description": "Otro producto de ejemplo",
                "category": "Ropa",
                "vendor": "Vendor Demo",
                "status": "active",
                "stock": 5,
                "images": ["https://example.com/image2.jpg"],
                "created_at": "2024-10-04T21:00:00Z",
                "updated_at": "2024-10-04T21:00:00Z"
            }
        ]
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'products': products,
                'total': len(products),
                'page': page,
                'limit': limit
            })
        }
    
    except Exception as e:
        logger.error(f"Products list error: {str(e)}")
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
