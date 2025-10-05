import json
import logging
from typing import Dict, Any

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Vendors List Lambda function - GET /api/v1/vendors
    """
    try:
        logger.info(f"Vendors list request: {json.dumps(event)}")
        
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
        
        # Mock vendors data
        vendors = [
            {
                "id": "1",
                "name": "Vendor Demo",
                "email": "vendor@demo.com",
                "phone": "+1234567890",
                "address": {
                    "street": "123 Demo Street",
                    "city": "Demo City",
                    "state": "Demo State",
                    "zip_code": "12345",
                    "country": "Demo Country"
                },
                "description": "Vendedor de demostración para el marketplace",
                "is_active": True,
                "is_verified": True,
                "rating": 4.5,
                "total_products": 25,
                "created_at": "2024-10-04T21:00:00Z",
                "updated_at": "2024-10-04T21:00:00Z"
            },
            {
                "id": "2",
                "name": "Tech Store Pro",
                "email": "info@techstorepro.com",
                "phone": "+1987654321",
                "address": {
                    "street": "456 Tech Avenue",
                    "city": "Tech City",
                    "state": "Tech State",
                    "zip_code": "54321",
                    "country": "Tech Country"
                },
                "description": "Especialistas en productos tecnológicos",
                "is_active": True,
                "is_verified": True,
                "rating": 4.8,
                "total_products": 150,
                "created_at": "2024-10-04T21:00:00Z",
                "updated_at": "2024-10-04T21:00:00Z"
            },
            {
                "id": "3",
                "name": "Fashion Hub",
                "email": "contact@fashionhub.com",
                "phone": "+1122334455",
                "address": {
                    "street": "789 Fashion Boulevard",
                    "city": "Fashion City",
                    "state": "Fashion State",
                    "zip_code": "67890",
                    "country": "Fashion Country"
                },
                "description": "Tu tienda de moda y estilo",
                "is_active": True,
                "is_verified": False,
                "rating": 4.2,
                "total_products": 75,
                "created_at": "2024-10-04T21:00:00Z",
                "updated_at": "2024-10-04T21:00:00Z"
            }
        ]
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'vendors': vendors,
                'total': len(vendors)
            })
        }
    
    except Exception as e:
        logger.error(f"Vendors list error: {str(e)}")
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
