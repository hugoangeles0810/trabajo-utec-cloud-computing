import json
import logging
from typing import Dict, Any

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Vendors Update Lambda function - PUT /api/v1/vendors/{vendor_id}
    """
    try:
        logger.info(f"Vendors update request: {json.dumps(event)}")
        
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
        
        # Extract vendor_id from path parameters
        path_parameters = event.get('pathParameters') or {}
        vendor_id = path_parameters.get('vendor_id')
        
        if not vendor_id:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'message': 'Vendor ID is required'
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
        
        # Simulate vendor update
        updated_fields = list(body.keys())
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'message': f'Vendedor {vendor_id} actualizado exitosamente',
                'vendor_id': vendor_id,
                'updated_fields': updated_fields,
                'vendor': {
                    'id': vendor_id,
                    'name': body.get('name', f'Vendedor {vendor_id}'),
                    'email': body.get('email', f'vendor{vendor_id}@example.com'),
                    'phone': body.get('phone', '+1234567890'),
                    'address': body.get('address', {}),
                    'description': body.get('description', ''),
                    'is_active': body.get('is_active', True),
                    'is_verified': body.get('is_verified', True),
                    'rating': body.get('rating', 4.5),
                    'total_products': body.get('total_products', 25),
                    'updated_at': '2024-10-04T21:00:00Z'
                }
            })
        }
    
    except Exception as e:
        logger.error(f"Vendors update error: {str(e)}")
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
