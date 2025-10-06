"""
Categories Create Lambda function with RDS support
POST /api/v1/categories
"""

import json
import logging
import os
import sys
from datetime import datetime
from typing import Dict, Any

# Add parent directory to path to import db_utils
sys.path.append('/var/task')
from db_utils import execute_insert, execute_single_query

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Categories Create Lambda function - POST /api/v1/categories
    """
    try:
        logger.info(f"Categories create request: {json.dumps(event)}")
        
        # Handle CORS
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
        body = json.loads(event.get('body', '{}'))
        
        # Validate required fields
        required_fields = ['name', 'slug']
        for field in required_fields:
            if not body.get(field):
                return error_response(f"Field '{field}' is required", 400)
        
        # Check if slug already exists
        slug_check_query = "SELECT id FROM categories WHERE slug = %s"
        existing_category = execute_single_query(slug_check_query, (body['slug'],))
        
        if existing_category:
            return error_response("Category with this slug already exists", 409)
        
        # Create category in database
        query = """
            INSERT INTO categories (name, slug, description, parent_id, "order", is_active, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """
        
        now = datetime.utcnow()
        parameters = (
            body['name'],
            body['slug'],
            body.get('description', ''),
            int(body['parent_id']) if body.get('parent_id') else None,
            body.get('order', 0),
            body.get('is_active', True),
            now,
            now
        )
        
        category_id = execute_insert(query, parameters)
        
        # Get the created category
        get_query = """
            SELECT id, name, slug, description, parent_id, "order", is_active, created_at, updated_at
            FROM categories
            WHERE id = %s
        """
        
        new_category = execute_single_query(get_query, (category_id,))
        
        # Convert data types for JSON serialization
        new_category['id'] = str(new_category['id'])
        if new_category['parent_id']:
            new_category['parent_id'] = str(new_category['parent_id'])
        if new_category['created_at']:
            new_category['created_at'] = new_category['created_at'].isoformat()
        if new_category['updated_at']:
            new_category['updated_at'] = new_category['updated_at'].isoformat()
        
        return created_response(new_category, "Category created successfully")
        
    except json.JSONDecodeError:
        return error_response("Invalid JSON in request body", 400)
    except Exception as e:
        logger.error(f"Categories create error: {str(e)}")
        return error_response("Failed to create category", 500, str(e))

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

def created_response(data: Any, message: str = "Created successfully") -> Dict[str, Any]:
    """Create created response"""
    return {
        'statusCode': 201,
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
