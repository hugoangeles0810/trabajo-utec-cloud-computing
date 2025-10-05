import json
import logging
from typing import Dict, Any

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Vendors Create Lambda function - POST /api/v1/vendors
    """
    try:
        logger.info(f"Vendors create request: {json.dumps(event)}")
        
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
        required_fields = ['name', 'email']
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
        
        # Simulate vendor creation
        new_vendor_id = f"vendor-{len(body) + 1}"
        
        return {
            'statusCode': 201,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'message': 'Vendedor creado exitosamente',
                'vendor_id': new_vendor_id,
                'vendor': {
                    'id': new_vendor_id,
                    'name': body.get('name'),
                    'email': body.get('email'),
                    'phone': body.get('phone', ''),
                    'address': body.get('address', {}),
                    'description': body.get('description', ''),
                    'is_active': body.get('is_active', True),
                    'is_verified': body.get('is_verified', False),
                    'rating': body.get('rating', 0.0),
                    'total_products': body.get('total_products', 0),
                    'created_at': '2024-10-04T21:00:00Z',
                    'updated_at': '2024-10-04T21:00:00Z'
                }
            })
        }
    
    except Exception as e:
        logger.error(f"Vendors create error: {str(e)}")
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
