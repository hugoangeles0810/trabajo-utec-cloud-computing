"""
Categories List Lambda function with RDS support
GET /api/v1/categories
"""

import json
import logging
import os
import boto3
from typing import Dict, Any
import sys

# Add parent directory to path to import db_utils
sys.path.append('/var/task')
from db_utils import execute_query

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Categories List Lambda function - GET /api/v1/categories
    """
    try:
        logger.info(f"Categories list request: {json.dumps(event)}")
        
        # Handle CORS
        if event.get('httpMethod') == 'OPTIONS':
            return {
                'statusCode': 200,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, X-Amz-Date, X-Api-Key, X-Amz-Security-Token',
                    'Access-Control-Allow-Methods': 'GET, OPTIONS'
                },
                'body': ''
            }
        
        # Query categories from database
        query = """
            SELECT id, name, slug, description, parent_id, "order", is_active, created_at, updated_at
            FROM categories 
            ORDER BY "order" ASC, name ASC
        """
        
        categories_data = execute_query(query)
        
        # Convert data types for JSON serialization
        for category in categories_data:
            category['id'] = str(category['id'])
            if category['parent_id']:
                category['parent_id'] = str(category['parent_id'])
            if category['created_at']:
                category['created_at'] = category['created_at'].isoformat()
            if category['updated_at']:
                category['updated_at'] = category['updated_at'].isoformat()
        
        return success_response({
            'categories': categories_data,
            'total': len(categories_data)
        }, f"Retrieved {len(categories_data)} categories")
        
    except Exception as e:
        logger.error(f"Categories list error: {str(e)}")
        return error_response("Failed to retrieve categories", 500, str(e))

def success_response(data: Any, message: str = "Success") -> Dict[str, Any]:
    """Create success response"""
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'data': data,
            'message': message
        })
    }

def error_response(message: str, status_code: int = 500, error: str = None) -> Dict[str, Any]:
    """Create error response"""
    response_data = {'message': message}
    if error:
        response_data['error'] = str(error)
    
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(response_data)
    }