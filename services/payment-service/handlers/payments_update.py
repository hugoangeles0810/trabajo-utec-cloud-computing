"""
Payments Update Lambda function with RDS support
PUT /api/v1/payments/{payment_id}
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
    Payments Update Lambda function - PUT /api/v1/payments/{payment_id}
    """
    try:
        logger.info(f"Payments update request: {json.dumps(event)}")
        
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
        
        # Get payment ID from path parameters
        path_parameters = event.get('pathParameters') or {}
        payment_id = path_parameters.get('payment_id')
        
        if not payment_id:
            return error_response("Payment ID is required", 400)
        
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        
        # Check if payment exists
        check_query = "SELECT id FROM payments WHERE id = %s"
        existing_payment = execute_single_query(check_query, (int(payment_id),))
        
        if not existing_payment:
            return not_found_response("Payment not found")
        
        # Build update query dynamically
        update_fields = []
        parameters = []
        
        if 'amount' in body:
            update_fields.append("amount = %s")
            parameters.append(float(body['amount']))
        
        if 'currency' in body:
            update_fields.append("currency = %s")
            parameters.append(body['currency'])
        
        if 'payment_method' in body:
            update_fields.append("payment_method = %s")
            parameters.append(body['payment_method'])
        
        if 'status' in body:
            update_fields.append("status = %s")
            parameters.append(body['status'])
        
        if 'gateway_response' in body:
            update_fields.append("gateway_response = %s")
            parameters.append(json.dumps(body['gateway_response']))
        
        if 'metadata' in body:
            update_fields.append("metadata = %s")
            parameters.append(json.dumps(body['metadata']))
        
        if not update_fields:
            return error_response("No fields to update", 400)
        
        # Add updated_at
        update_fields.append("updated_at = %s")
        parameters.append(datetime.utcnow())
        
        # Add payment_id for WHERE clause
        parameters.append(int(payment_id))
        
        # Execute update
        update_query = f"""
            UPDATE payments 
            SET {', '.join(update_fields)}
            WHERE id = %s
        """
        
        affected_rows = execute_update(update_query, tuple(parameters))
        
        if affected_rows == 0:
            return error_response("Payment not found or no changes made", 404)
        
        # Get updated payment
        get_query = """
            SELECT id, order_id, amount, currency, payment_method, status, 
                   gateway_response, metadata, created_at, updated_at
            FROM payments
            WHERE id = %s
        """
        
        updated_payment = execute_single_query(get_query, (int(payment_id),))
        
        # Convert data types for JSON serialization
        updated_payment['id'] = str(updated_payment['id'])
        updated_payment['order_id'] = str(updated_payment['order_id'])
        updated_payment['amount'] = float(updated_payment['amount'])
        if updated_payment['created_at']:
            updated_payment['created_at'] = updated_payment['created_at'].isoformat()
        if updated_payment['updated_at']:
            updated_payment['updated_at'] = updated_payment['updated_at'].isoformat()
        if updated_payment['gateway_response'] is None:
            updated_payment['gateway_response'] = {}
        if updated_payment['metadata'] is None:
            updated_payment['metadata'] = {}
        
        return success_response(updated_payment, "Payment updated successfully")
        
    except json.JSONDecodeError:
        return error_response("Invalid JSON in request body", 400)
    except ValueError as e:
        return error_response("Invalid data format", 400, str(e))
    except Exception as e:
        logger.error(f"Payments update error: {str(e)}")
        return error_response("Failed to update payment", 500, str(e))

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
