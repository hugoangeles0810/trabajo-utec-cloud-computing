"""
Orders Create Lambda function with RDS support
POST /api/v1/orders
"""

import json
import logging
import os
import sys
from datetime import datetime
from typing import Dict, Any

# Add parent directory to path to import db_utils
sys.path.append('/var/task')
from db_utils import execute_insert, execute_single_query, execute_query

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Orders Create Lambda function - POST /api/v1/orders
    """
    try:
        logger.info(f"Orders create request: {json.dumps(event)}")
        
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
        required_fields = ['user_id', 'total_amount', 'order_items']
        for field in required_fields:
            if not body.get(field):
                return error_response(f"Field '{field}' is required", 400)
        
        # Validate order_items
        order_items = body.get('order_items', [])
        if not order_items or len(order_items) == 0:
            return error_response("At least one order item is required", 400)
        
        # Create order in database
        order_query = """
            INSERT INTO orders (user_id, status, total_amount, currency, shipping_address, billing_address, notes, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """
        
        now = datetime.utcnow()
        order_parameters = (
            body['user_id'],
            body.get('status', 'pending'),
            float(body['total_amount']),
            body.get('currency', 'USD'),
            json.dumps(body.get('shipping_address', {})),
            json.dumps(body.get('billing_address', {})),
            body.get('notes', ''),
            now,
            now
        )
        
        order_id = execute_insert(order_query, order_parameters)
        
        # Create order items
        for item in order_items:
            item_query = """
                INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price, created_at)
                VALUES (%s, %s, %s, %s, %s, %s)
            """
            
            item_parameters = (
                order_id,
                int(item['product_id']),
                int(item['quantity']),
                float(item['unit_price']),
                float(item['total_price']),
                now
            )
            
            execute_insert(item_query, item_parameters)
        
        # Get the created order with items
        get_order_query = """
            SELECT o.id, o.user_id, o.status, o.total_amount, o.currency, o.shipping_address, 
                   o.billing_address, o.notes, o.created_at, o.updated_at
            FROM orders o
            WHERE o.id = %s
        """
        
        order = execute_single_query(get_order_query, (order_id,))
        
        # Get order items
        get_items_query = """
            SELECT oi.id, oi.product_id, oi.quantity, oi.unit_price, oi.total_price, oi.created_at
            FROM order_items oi
            WHERE oi.order_id = %s
        """
        
        order_items_data = execute_query(get_items_query, (order_id,))
        
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
        
        # Convert order items data types
        if order_items_data:
            for item in order_items_data:
                item['id'] = str(item['id'])
                item['product_id'] = str(item['product_id'])
                item['unit_price'] = float(item['unit_price'])
                item['total_price'] = float(item['total_price'])
                if item['created_at']:
                    item['created_at'] = item['created_at'].isoformat()
        
        # Add order items to response
        order['order_items'] = order_items_data if order_items_data else []
        
        return created_response(order, "Order created successfully")
        
    except json.JSONDecodeError:
        return error_response("Invalid JSON in request body", 400)
    except ValueError as e:
        return error_response("Invalid data format", 400, str(e))
    except Exception as e:
        logger.error(f"Orders create error: {str(e)}")
        return error_response("Failed to create order", 500, str(e))

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
