import json
import logging
from typing import Dict, Any

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Categories List Lambda function - GET /api/v1/categories
    """
    try:
        logger.info(f"Categories list request: {json.dumps(event)}")
        
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
        
        # Mock categories data
        categories = [
            {
                "id": "1",
                "name": "Electrónicos",
                "slug": "electronicos",
                "description": "Productos electrónicos y tecnología",
                "parent_id": None,
                "order": 1,
                "is_active": True,
                "created_at": "2024-10-04T21:00:00Z",
                "updated_at": "2024-10-04T21:00:00Z"
            },
            {
                "id": "2",
                "name": "Ropa",
                "slug": "ropa",
                "description": "Ropa y accesorios",
                "parent_id": None,
                "order": 2,
                "is_active": True,
                "created_at": "2024-10-04T21:00:00Z",
                "updated_at": "2024-10-04T21:00:00Z"
            },
            {
                "id": "3",
                "name": "Hogar y Jardín",
                "slug": "hogar-jardin",
                "description": "Productos para el hogar y jardín",
                "parent_id": None,
                "order": 3,
                "is_active": True,
                "created_at": "2024-10-04T21:00:00Z",
                "updated_at": "2024-10-04T21:00:00Z"
            },
            {
                "id": "4",
                "name": "Smartphones",
                "slug": "smartphones",
                "description": "Teléfonos inteligentes y accesorios",
                "parent_id": "1",
                "order": 1,
                "is_active": True,
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
                'categories': categories,
                'total': len(categories)
            })
        }
    
    except Exception as e:
        logger.error(f"Categories list error: {str(e)}")
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
