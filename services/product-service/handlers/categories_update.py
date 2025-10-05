import json
import logging
from typing import Dict, Any

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Categories Update Lambda function - PUT /api/v1/categories/{category_id}
    """
    try:
        logger.info(f"Categories update request: {json.dumps(event)}")
        
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
        
        # Simulate category update
        updated_fields = list(body.keys())
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'message': f'Categoría {category_id} actualizada exitosamente',
                'category_id': category_id,
                'updated_fields': updated_fields,
                'category': {
                    'id': category_id,
                    'name': body.get('name', f'Categoría {category_id}'),
                    'slug': body.get('slug', f'categoria-{category_id}'),
                    'description': body.get('description', ''),
                    'parent_id': body.get('parent_id'),
                    'order': body.get('order', 1),
                    'is_active': body.get('is_active', True),
                    'updated_at': '2024-10-04T21:00:00Z'
                }
            })
        }
    
    except Exception as e:
        logger.error(f"Categories update error: {str(e)}")
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
