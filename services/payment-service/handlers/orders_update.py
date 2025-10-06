"""
Orders Update Lambda function with RDS support
PUT /api/v1/orders/{order_id}
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
    Orders Update Lambda function - PUT /api/v1/orders/{order_id}
    """
    try:
        logger.info(f"Orders update request: {json.dumps(event)}")
        
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
        
        # Get order ID from path parameters
        path_parameters = event.get('pathParameters') or {}
        order_id = path_parameters.get('order_id')
        
        if not order_id:
            return error_response("Order ID is required", 400)
        
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        
        # Check if order exists
        check_query = "SELECT id FROM orders WHERE id = %s"
        existing_order = execute_single_query(check_query, (int(order_id),))
        
        if not existing_order:
            return not_found_response("Order not found")
        
        # Build update query dynamically
        update_fields = []
        parameters = []
        
        if 'status' in body:
            update_fields.append("status = %s")
            parameters.append(body['status'])
        
        if 'total_amount' in body:
            update_fields.append("total_amount = %s")
            parameters.append(float(body['total_amount']))
        
        if 'currency' in body:
            update_fields.append("currency = %s")
            parameters.append(body['currency'])
        
        if 'shipping_address' in body:
            update_fields.append("shipping_address = %s")
            parameters.append(json.dumps(body['shipping_address']))
        
        if 'billing_address' in body:
            update_fields.append("billing_address = %s")
            parameters.append(json.dumps(body['billing_address']))
        
        if 'notes' in body:
            update_fields.append("notes = %s")
            parameters.append(body['notes'])
        
        if not update_fields:
            return error_response("No fields to update", 400)
        
        # Add updated_at
        update_fields.append("updated_at = %s")
        parameters.append(datetime.utcnow())
        
        # Add order_id for WHERE clause
        parameters.append(int(order_id))
        
        # Execute update
        update_query = f"""
            UPDATE orders 
            SET {', '.join(update_fields)}
            WHERE id = %s
        """
        
        affected_rows = execute_update(update_query, tuple(parameters))
        
        if affected_rows == 0:
            return error_response("Order not found or no changes made", 404)
        
        # Get updated order
        get_query = """
            SELECT id, user_id, status, total_amount, currency, shipping_address, 
                   billing_address, notes, created_at, updated_at
            FROM orders
            WHERE id = %s
        """
        
        updated_order = execute_single_query(get_query, (int(order_id),))
        
        # Convert data types for JSON serialization
        updated_order['id'] = str(updated_order['id'])
        updated_order['total_amount'] = float(updated_order['total_amount'])
        if updated_order['created_at']:
            updated_order['created_at'] = updated_order['created_at'].isoformat()
        if updated_order['updated_at']:
            updated_order['updated_at'] = updated_order['updated_at'].isoformat()
        if updated_order['shipping_address'] is None:
            updated_order['shipping_address'] = {}
        if updated_order['billing_address'] is None:
            updated_order['billing_address'] = {}
        
        return success_response(updated_order, "Order updated successfully")
        
    except json.JSONDecodeError:
        return error_response("Invalid JSON in request body", 400)
    except ValueError as e:
        return error_response("Invalid data format", 400, str(e))
    except Exception as e:
        logger.error(f"Orders update error: {str(e)}")
        return error_response("Failed to update order", 500, str(e))

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
