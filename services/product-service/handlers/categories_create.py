import json
import logging
from typing import Dict, Any

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Categories Create Lambda function - POST /api/v1/categories
    """
    try:
        logger.info(f"Categories create request: {json.dumps(event)}")
        
        # Handle OPTIONS requests for CORS
        if event.get('httpMethod') == 'OPTIONS':
            return {
                'statusCode': 200,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS'
                },
                'body': ''
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
        
        # Validate required fields
        required_fields = ['name', 'slug']
        missing_fields = [field for field in required_fields if not body.get(field)]
        
        if missing_fields:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'message': 'Missing required fields',
                    'missing_fields': missing_fields
                })
            }
        
        # Simulate category creation
        new_category_id = f"category-{len(body) + 1}"
        
        return {
            'statusCode': 201,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'message': 'Categoría creada exitosamente',
                'category_id': new_category_id,
                'category': {
                    'id': new_category_id,
                    'name': body.get('name'),
                    'slug': body.get('slug'),
                    'description': body.get('description', ''),
                    'parent_id': body.get('parent_id'),
                    'order': body.get('order', 0),
                    'is_active': body.get('is_active', True),
                    'created_at': '2024-10-04T21:00:00Z',
                    'updated_at': '2024-10-04T21:00:00Z'
                }
            })
        }
    
    except Exception as e:
        logger.error(f"Categories create error: {str(e)}")
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
