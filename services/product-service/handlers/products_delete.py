import json
import logging
from typing import Dict, Any

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Products Delete Lambda function - DELETE /api/v1/products/{product_id}
    """
    try:
        logger.info(f"Products delete request: {json.dumps(event)}")
        
        # Handle OPTIONS requests for CORS
        if event.get('httpMethod') == 'OPTIONS':
            return {
                'statusCode': 200,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                    'Access-Control-Allow-Methods': 'DELETE, OPTIONS'
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
        
        # Simulate product deletion
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'message': f'Producto {product_id} eliminado exitosamente',
                'product_id': product_id,
                'deleted_at': '2024-10-04T21:00:00Z'
            })
        }
    
    except Exception as e:
        logger.error(f"Products delete error: {str(e)}")
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
