import json
import logging
from typing import Dict, Any

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Categories Get Lambda function - GET /api/v1/categories/{category_id}
    """
    try:
        logger.info(f"Categories get request: {json.dumps(event)}")
        
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
        
        # Extract category_id from path parameters
        path_parameters = event.get('pathParameters') or {}
        category_id = path_parameters.get('category_id')
        
        if not category_id:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'message': 'Category ID is required'
                })
            }
        
        # Mock category data
        category = {
            'id': category_id,
            'name': f'Categoría {category_id}',
            'slug': f'categoria-{category_id}',
            'description': f'Descripción de la categoría {category_id}',
            'parent_id': None,
            'order': 1,
            'is_active': True,
            'created_at': '2024-10-04T21:00:00Z',
            'updated_at': '2024-10-04T21:00:00Z'
        }
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(category)
        }
    
    except Exception as e:
        logger.error(f"Categories get error: {str(e)}")
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
