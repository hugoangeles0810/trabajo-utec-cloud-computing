import json
import logging
from typing import Dict, Any

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Products Update Lambda function - PUT /api/v1/products/{product_id}
    """
    try:
        logger.info(f"Products update request: {json.dumps(event)}")
        
        # Handle OPTIONS requests for CORS
        if event.get('httpMethod') == 'OPTIONS':
            return {
                'statusCode': 200,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                    'Access-Control-Allow-Methods': 'PUT, OPTIONS'
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
        
        # Parse request body
        try:
            body = json.loads(event.get('body', '{}'))
        except json.JSONDecodeError:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'message': 'Invalid JSON in request body'
                })
            }
        
        # Simulate product update
        updated_fields = list(body.keys())
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'message': f'Producto {product_id} actualizado exitosamente',
                'product_id': product_id,
                'updated_fields': updated_fields,
                'product': {
                    'id': product_id,
                    'name': body.get('name', f'Producto {product_id}'),
                    'price': body.get('price', 29.99),
                    'description': body.get('description', ''),
                    'stock': body.get('stock', 5),
                    'status': body.get('status', 'active'),
                    'images': body.get('images', []),
                    'updated_at': '2024-10-04T21:00:00Z'
                }
            })
        }
    
    except Exception as e:
        logger.error(f"Products update error: {str(e)}")
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
