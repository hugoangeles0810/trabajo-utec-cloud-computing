"""
Vendors Delete Lambda function with RDS support
DELETE /api/v1/vendors/{vendor_id}
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
    Vendors Delete Lambda function - DELETE /api/v1/vendors/{vendor_id}
    """
    try:
        logger.info(f"Vendors delete request: {json.dumps(event)}")
        
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
        
        # Get vendor ID from path parameters
        path_parameters = event.get('pathParameters') or {}
        vendor_id = path_parameters.get('vendor_id')
        
        if not vendor_id:
            return error_response("Vendor ID is required", 400)
        
        # Check if vendor exists
        check_query = "SELECT id, name FROM vendors WHERE id = %s"
        existing_vendor = execute_single_query(check_query, (int(vendor_id),))
        
        if not existing_vendor:
            return not_found_response("Vendor not found")
        
        # Check if vendor has products
        products_check_query = "SELECT COUNT(*) as count FROM products WHERE vendor_id = %s"
        products_result = execute_single_query(products_check_query, (int(vendor_id),))
        products_count = products_result['count'] if products_result else 0
        
        if products_count > 0:
            return error_response(f"Cannot delete vendor with {products_count} products. Please move or delete products first.", 409)
        
        # Delete vendor from database
        delete_query = "DELETE FROM vendors WHERE id = %s"
        affected_rows = execute_delete(delete_query, (int(vendor_id),))
        
        if affected_rows == 0:
            return error_response("Vendor not found or could not be deleted", 404)
        
        return success_response(None, f"Vendor '{existing_vendor['name']}' deleted successfully")
        
    except Exception as e:
        logger.error(f"Vendors delete error: {str(e)}")
        return error_response("Failed to delete vendor", 500, str(e))

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
