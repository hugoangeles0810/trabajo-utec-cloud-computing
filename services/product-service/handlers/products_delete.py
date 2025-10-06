"""
Products Delete Lambda function with RDS support
DELETE /api/v1/products/{product_id}
"""

import json
import logging
import os
import sys
from typing import Dict, Any

# Add parent directory to path to import db_utils
sys.path.append('/var/task')
from db_utils import execute_single_query, execute_delete

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Products Delete Lambda function - DELETE /api/v1/products/{product_id}
    """
    try:
        logger.info(f"Products delete request: {json.dumps(event)}")
        
        # Handle CORS
        if event.get('httpMethod') == 'OPTIONS':
            return {
                'statusCode': 200,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                    'Access-Control-Allow-Methods': 'DELETE, OPTIONS'
                },
                'body': ''
            }
        
        # Get product ID from path parameters
        path_parameters = event.get('pathParameters') or {}
        product_id = path_parameters.get('product_id')
        
        if not product_id:
            return error_response("Product ID is required", 400)
        
        # Check if product exists
        check_query = "SELECT id, name FROM products WHERE id = %s"
        existing_product = execute_single_query(check_query, (int(product_id),))
        
        if not existing_product:
            return not_found_response("Product not found")
        
        # Delete product from database
        delete_query = "DELETE FROM products WHERE id = %s"
        affected_rows = execute_delete(delete_query, (int(product_id),))
        
        if affected_rows == 0:
            return error_response("Product not found or could not be deleted", 404)
        
        return success_response(None, f"Product '{existing_product['name']}' deleted successfully")
        
    except Exception as e:
        logger.error(f"Products delete error: {str(e)}")
        return error_response("Failed to delete product", 500, str(e))

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
