"""
Payments Create Lambda function with RDS support
POST /api/v1/payments
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
    Payments Create Lambda function - POST /api/v1/payments
    """
    try:
        logger.info(f"Payments create request: {json.dumps(event)}")
        
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
        required_fields = ['order_id', 'amount', 'payment_method']
        for field in required_fields:
            if not body.get(field):
                return error_response(f"Field '{field}' is required", 400)
        
        # Validate order exists
        order_check_query = "SELECT id, total_amount FROM orders WHERE id = %s"
        order = execute_single_query(order_check_query, (int(body['order_id']),))
        
        if not order:
            return error_response("Order not found", 404)
        
        # Validate payment amount doesn't exceed order total
        payment_amount = float(body['amount'])
        if payment_amount > float(order['total_amount']):
            return error_response("Payment amount cannot exceed order total", 400)
        
        # Create payment in database
        query = """
            INSERT INTO payments (order_id, amount, currency, payment_method, status, 
                                gateway_response, metadata, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """
        
        now = datetime.utcnow()
        parameters = (
            int(body['order_id']),
            payment_amount,
            body.get('currency', 'USD'),
            body['payment_method'],
            body.get('status', 'pending'),
            json.dumps(body.get('gateway_response', {})),
            json.dumps(body.get('metadata', {})),
            now,
            now
        )
        
        payment_id = execute_insert(query, parameters)
        
        # Get the created payment
        get_query = """
            SELECT id, order_id, amount, currency, payment_method, status, 
                   gateway_response, metadata, created_at, updated_at
            FROM payments
            WHERE id = %s
        """
        
        payment = execute_single_query(get_query, (payment_id,))
        
        # Convert data types for JSON serialization
        payment['id'] = str(payment['id'])
        payment['order_id'] = str(payment['order_id'])
        payment['amount'] = float(payment['amount'])
        if payment['created_at']:
            payment['created_at'] = payment['created_at'].isoformat()
        if payment['updated_at']:
            payment['updated_at'] = payment['updated_at'].isoformat()
        if payment['gateway_response'] is None:
            payment['gateway_response'] = {}
        if payment['metadata'] is None:
            payment['metadata'] = {}
        
        return created_response(payment, "Payment created successfully")
        
    except json.JSONDecodeError:
        return error_response("Invalid JSON in request body", 400)
    except ValueError as e:
        return error_response("Invalid data format", 400, str(e))
    except Exception as e:
        logger.error(f"Payments create error: {str(e)}")
        return error_response("Failed to create payment", 500, str(e))

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
