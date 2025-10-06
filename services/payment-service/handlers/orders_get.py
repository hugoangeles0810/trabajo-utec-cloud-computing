"""
Orders Get Lambda function with RDS support
GET /api/v1/orders/{order_id}
"""

import json
import logging
import os
import sys
from typing import Dict, Any

# Add parent directory to path to import db_utils
sys.path.append('/var/task')
from db_utils import execute_single_query, execute_query

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Orders Get Lambda function - GET /api/v1/orders/{order_id}
    """
    try:
        logger.info(f"Orders get request: {json.dumps(event)}")
        
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
        
        # Get order ID from path parameters
        path_parameters = event.get('pathParameters') or {}
        order_id = path_parameters.get('order_id')
        
        if not order_id:
            return error_response("Order ID is required", 400)
        
        # Query order from database using psycopg2
        query = """
            SELECT id, user_id, status, total_amount, currency, shipping_address, 
                   billing_address, notes, created_at, updated_at
            FROM orders
            WHERE id = %s
        """
        
        parameters = (int(order_id),)
        order = execute_single_query(query, parameters)
        
        if not order:
            return not_found_response("Order not found")
        
        # Get order items
        items_query = """
            SELECT id, product_id, quantity, unit_price, total_price, created_at
            FROM order_items
            WHERE order_id = %s
        """
        
        order_items = execute_query(items_query, (int(order_id),))
        
        # Convert data types for JSON serialization
        order['id'] = str(order['id'])
        order['total_amount'] = float(order['total_amount'])
        if order['created_at']:
            order['created_at'] = order['created_at'].isoformat()
        if order['updated_at']:
            order['updated_at'] = order['updated_at'].isoformat()
        if order['shipping_address'] is None:
            order['shipping_address'] = {}
        if order['billing_address'] is None:
            order['billing_address'] = {}
        
        # Convert order items
        for item in order_items:
            item['id'] = str(item['id'])
            item['product_id'] = str(item['product_id'])
            item['unit_price'] = float(item['unit_price'])
            item['total_price'] = float(item['total_price'])
            if item['created_at']:
                item['created_at'] = item['created_at'].isoformat()
        
        order['order_items'] = order_items
        
        return success_response(order, "Order retrieved successfully")
        
    except ValueError as e:
        return error_response("Invalid order ID format", 400, str(e))
    except Exception as e:
        logger.error(f"Orders get error: {str(e)}")
        return error_response("Failed to retrieve order", 500, str(e))

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
