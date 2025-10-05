import json
import logging
from typing import Dict, Any

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Products Create Lambda function - POST /api/v1/products
    """
    try:
        logger.info(f"Products create request: {json.dumps(event)}")
        
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
        required_fields = ['name', 'price', 'category_id', 'vendor_id']
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
        
        # Simulate product creation
        new_product_id = f"product-{len(body) + 1}"
        
        return {
            'statusCode': 201,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'message': 'Producto creado exitosamente',
                'product_id': new_product_id,
                'product': {
                    'id': new_product_id,
                    'name': body.get('name'),
                    'price': body.get('price'),
                    'description': body.get('description', ''),
                    'category_id': body.get('category_id'),
                    'vendor_id': body.get('vendor_id'),
                    'stock': body.get('stock', 0),
                    'status': 'active',
                    'images': body.get('images', []),
                    'created_at': '2024-10-04T21:00:00Z',
                    'updated_at': '2024-10-04T21:00:00Z'
                }
            })
        }
    
    except Exception as e:
        logger.error(f"Products create error: {str(e)}")
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
