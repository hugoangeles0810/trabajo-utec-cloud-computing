import json
import logging
from typing import Dict, Any

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Products Get Lambda function - GET /api/v1/products/{product_id}
    """
    try:
        logger.info(f"Products get request: {json.dumps(event)}")
        
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
        
        # Extract product_id from path parameters
        path_parameters = event.get('pathParameters') or {}
        product_id = path_parameters.get('product_id')
        
        if not product_id:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'message': 'Product ID is required'
                })
            }
        
        # Mock product data
        product = {
            'id': product_id,
            'name': f'Producto {product_id}',
            'price': 29.99,
            'description': f'Descripción del producto {product_id}',
            'category': 'Electrónicos',
            'vendor': 'Vendor Demo',
            'status': 'active',
            'stock': 5,
            'images': ['https://example.com/image1.jpg'],
            'created_at': '2024-10-04T21:00:00Z',
            'updated_at': '2024-10-04T21:00:00Z'
        }
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(product)
        }
    
    except Exception as e:
        logger.error(f"Products get error: {str(e)}")
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
