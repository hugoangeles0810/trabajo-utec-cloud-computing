"""
Payments Get Lambda function with RDS support
GET /api/v1/payments/{payment_id}
"""

import json
import logging
import os
import sys
from typing import Dict, Any

# Add parent directory to path to import db_utils
sys.path.append('/var/task')
from db_utils import execute_single_query

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Payments Get Lambda function - GET /api/v1/payments/{payment_id}
    """
    try:
        logger.info(f"Payments get request: {json.dumps(event)}")
        
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
        
        # Get payment ID from path parameters
        path_parameters = event.get('pathParameters') or {}
        payment_id = path_parameters.get('payment_id')
        
        if not payment_id:
            return error_response("Payment ID is required", 400)
        
        # Query payment from database using psycopg2
        query = """
            SELECT id, order_id, amount, currency, payment_method, status, 
                   gateway_response, metadata, created_at, updated_at
            FROM payments
            WHERE id = %s
        """
        
        parameters = (int(payment_id),)
        payment = execute_single_query(query, parameters)
        
        if not payment:
            return not_found_response("Payment not found")
        
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
        
        return success_response(payment, "Payment retrieved successfully")
        
    except ValueError as e:
        return error_response("Invalid payment ID format", 400, str(e))
    except Exception as e:
        logger.error(f"Payments get error: {str(e)}")
        return error_response("Failed to retrieve payment", 500, str(e))

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
