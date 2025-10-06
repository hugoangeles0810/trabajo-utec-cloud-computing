"""
Categories Update Lambda function with RDS support
PUT /api/v1/categories/{category_id}
"""

import json
import logging
import os
import sys
from datetime import datetime
from typing import Dict, Any

# Add parent directory to path to import db_utils
sys.path.append('/var/task')
from db_utils import execute_single_query, execute_update

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Categories Update Lambda function - PUT /api/v1/categories/{category_id}
    """
    try:
        logger.info(f"Categories update request: {json.dumps(event)}")
        
        # Handle CORS
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
        
        # Get category ID from path parameters
        path_parameters = event.get('pathParameters') or {}
        category_id = path_parameters.get('category_id')
        
        if not category_id:
            return error_response("Category ID is required", 400)
        
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        
        # Check if category exists
        check_query = "SELECT id FROM categories WHERE id = %s"
        existing_category = execute_single_query(check_query, (int(category_id),))
        
        if not existing_category:
            return not_found_response("Category not found")
        
        # Check if slug is being updated and if it already exists
        if 'slug' in body:
            slug_check_query = "SELECT id FROM categories WHERE slug = %s AND id != %s"
            existing_slug = execute_single_query(slug_check_query, (body['slug'], int(category_id)))
            
            if existing_slug:
                return error_response("Category with this slug already exists", 409)
        
        # Build update query dynamically based on provided fields
        update_fields = []
        parameters = []
        
        if 'name' in body:
            update_fields.append("name = %s")
            parameters.append(body['name'])
        
        if 'slug' in body:
            update_fields.append("slug = %s")
            parameters.append(body['slug'])
        
        if 'description' in body:
            update_fields.append("description = %s")
            parameters.append(body['description'])
        
        if 'parent_id' in body:
            update_fields.append("parent_id = %s")
            parameters.append(int(body['parent_id']) if body['parent_id'] else None)
        
        if 'order' in body:
            update_fields.append('"order" = %s')
            parameters.append(body['order'])
        
        if 'is_active' in body:
            update_fields.append("is_active = %s")
            parameters.append(body['is_active'])
        
        if not update_fields:
            return error_response("No fields to update", 400)
        
        # Add updated_at timestamp
        update_fields.append("updated_at = %s")
        parameters.append(datetime.utcnow())
        
        # Add category_id for WHERE clause
        parameters.append(int(category_id))
        
        # Execute update
        update_query = f"""
            UPDATE categories 
            SET {', '.join(update_fields)}
            WHERE id = %s
        """
        
        affected_rows = execute_update(update_query, tuple(parameters))
        
        if affected_rows == 0:
            return error_response("Category not found or no changes made", 404)
        
        # Get the updated category
        get_query = """
            SELECT id, name, slug, description, parent_id, "order", is_active, created_at, updated_at
            FROM categories
            WHERE id = %s
        """
        
        updated_category = execute_single_query(get_query, (int(category_id),))
        
        # Convert data types for JSON serialization
        updated_category['id'] = str(updated_category['id'])
        if updated_category['parent_id']:
            updated_category['parent_id'] = str(updated_category['parent_id'])
        if updated_category['created_at']:
            updated_category['created_at'] = updated_category['created_at'].isoformat()
        if updated_category['updated_at']:
            updated_category['updated_at'] = updated_category['updated_at'].isoformat()
        
        return success_response(updated_category, "Category updated successfully")
        
    except json.JSONDecodeError:
        return error_response("Invalid JSON in request body", 400)
    except Exception as e:
        logger.error(f"Categories update error: {str(e)}")
        return error_response("Failed to update category", 500, str(e))

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

def not_found_response(message: str = "Resource not found") -> Dict[str, Any]:
    """Create not found response"""
    return {
        'statusCode': 404,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
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
