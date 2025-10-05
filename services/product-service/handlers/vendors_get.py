import json
import logging
from typing import Dict, Any

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Vendors Get Lambda function - GET /api/v1/vendors/{vendor_id}
    """
    try:
        logger.info(f"Vendors get request: {json.dumps(event)}")
        
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
        
        # Mock vendor data
        vendor = {
            'id': vendor_id,
            'name': f'Vendedor {vendor_id}',
            'email': f'vendor{vendor_id}@example.com',
            'phone': '+1234567890',
            'address': {
                'street': '123 Main Street',
                'city': 'Demo City',
                'state': 'Demo State',
                'zip_code': '12345',
                'country': 'Demo Country'
            },
            'description': f'Descripción del vendedor {vendor_id}',
            'is_active': True,
            'is_verified': True,
            'rating': 4.5,
            'total_products': 25,
            'created_at': '2024-10-04T21:00:00Z',
            'updated_at': '2024-10-04T21:00:00Z'
        }
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(vendor)
        }
    
    except Exception as e:
        logger.error(f"Vendors get error: {str(e)}")
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
