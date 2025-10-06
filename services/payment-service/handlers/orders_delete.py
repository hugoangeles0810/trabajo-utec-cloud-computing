"""
Orders Delete Lambda function with RDS support
DELETE /api/v1/orders/{order_id}
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
    Orders Delete Lambda function - DELETE /api/v1/orders/{order_id}
    """
    try:
        logger.info(f"Orders delete request: {json.dumps(event)}")
        
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
        
        # Get order ID from path parameters
        path_parameters = event.get('pathParameters') or {}
        order_id = path_parameters.get('order_id')
        
        if not order_id:
            return error_response("Order ID is required", 400)
        
        # Check if order exists
        check_query = "SELECT id, user_id, status FROM orders WHERE id = %s"
        existing_order = execute_single_query(check_query, (int(order_id),))
        
        if not existing_order:
            return not_found_response("Order not found")
        
        # Check if order has payments (prevent deletion of paid orders)
        payments_check_query = "SELECT COUNT(*) as count FROM payments WHERE order_id = %s"
        payments_result = execute_single_query(payments_check_query, (int(order_id),))
        payments_count = payments_result['count'] if payments_result else 0
        
        if payments_count > 0:
            return error_response(f"Cannot delete order with {payments_count} payments. Please cancel payments first.", 409)
        
        # Delete order items first (foreign key constraint)
        delete_items_query = "DELETE FROM order_items WHERE order_id = %s"
        execute_delete(delete_items_query, (int(order_id),))
        
        # Delete order
        delete_query = "DELETE FROM orders WHERE id = %s"
        affected_rows = execute_delete(delete_query, (int(order_id),))
        
        if affected_rows == 0:
            return error_response("Order not found or could not be deleted", 404)
        
        return success_response(None, f"Order {order_id} deleted successfully")
        
    except ValueError as e:
        return error_response("Invalid order ID format", 400, str(e))
    except Exception as e:
        logger.error(f"Orders delete error: {str(e)}")
        return error_response("Failed to delete order", 500, str(e))

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
