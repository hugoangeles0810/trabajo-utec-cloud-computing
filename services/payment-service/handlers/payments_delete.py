"""
Payments Delete Lambda function with RDS support
DELETE /api/v1/payments/{payment_id}
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
    Payments Delete Lambda function - DELETE /api/v1/payments/{payment_id}
    """
    try:
        logger.info(f"Payments delete request: {json.dumps(event)}")
        
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
        
        # Get payment ID from path parameters
        path_parameters = event.get('pathParameters') or {}
        payment_id = path_parameters.get('payment_id')
        
        if not payment_id:
            return error_response("Payment ID is required", 400)
        
        # Check if payment exists
        check_query = "SELECT id, order_id, status FROM payments WHERE id = %s"
        existing_payment = execute_single_query(check_query, (int(payment_id),))
        
        if not existing_payment:
            return not_found_response("Payment not found")
        
        # Check if payment has transactions (prevent deletion of processed payments)
        transactions_check_query = "SELECT COUNT(*) as count FROM transactions WHERE payment_id = %s"
        transactions_result = execute_single_query(transactions_check_query, (int(payment_id),))
        transactions_count = transactions_result['count'] if transactions_result else 0
        
        if transactions_count > 0:
            return error_response(f"Cannot delete payment with {transactions_count} transactions. Please cancel transactions first.", 409)
        
        # Delete payment
        delete_query = "DELETE FROM payments WHERE id = %s"
        affected_rows = execute_delete(delete_query, (int(payment_id),))
        
        if affected_rows == 0:
            return error_response("Payment not found or could not be deleted", 404)
        
        return success_response(None, f"Payment {payment_id} deleted successfully")
        
    except ValueError as e:
        return error_response("Invalid payment ID format", 400, str(e))
    except Exception as e:
        logger.error(f"Payments delete error: {str(e)}")
        return error_response("Failed to delete payment", 500, str(e))

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
