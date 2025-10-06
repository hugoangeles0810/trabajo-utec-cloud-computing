"""
Categories Get Lambda function with RDS support
GET /api/v1/categories/{category_id}
"""

import json
import logging
import os
import boto3
from typing import Dict, Any
import sys

# Add parent directory to path to import db_utils
sys.path.append('/var/task')
from db_utils import execute_single_query, create_parameter

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Categories Get Lambda function - GET /api/v1/categories/{category_id}
    """
    try:
        logger.info(f"Categories get request: {json.dumps(event)}")
        
        # Handle CORS
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
        
        # Get category ID from path parameters
        path_parameters = event.get('pathParameters') or {}
        category_id = path_parameters.get('category_id')
        
        if not category_id:
            return error_response("Category ID is required", 400)
        
        # Query category from database using psycopg2
        query = """
            SELECT id, name, slug, description, parent_id, "order", is_active, created_at, updated_at
            FROM categories
            WHERE id = %s
        """

        parameters = (int(category_id),)
        category = execute_single_query(query, parameters)

        if not category:
            return not_found_response("Category not found")

        # Convert data types for JSON serialization
        category['id'] = str(category['id'])
        if category['parent_id']:
            category['parent_id'] = str(category['parent_id'])
        if category['created_at']:
            category['created_at'] = category['created_at'].isoformat()
        if category['updated_at']:
            category['updated_at'] = category['updated_at'].isoformat()

        return success_response(category, "Category retrieved successfully")
        
    except Exception as e:
        logger.error(f"Categories get error: {str(e)}")
        return error_response("Failed to retrieve category", 500, str(e))

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
            'message': message,
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

def not_found_response(message: str = "Resource not found") -> Dict[str, Any]:
    """Create not found response"""
    return {
        'statusCode': 404,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'message': message})
    }
