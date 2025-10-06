"""
Payments Refund Lambda function with RDS support
POST /api/v1/payments/{payment_id}/refund
"""

import json
import logging
import os
import sys
from datetime import datetime
from typing import Dict, Any

# Add parent directory to path to import db_utils
sys.path.append('/var/task')
from db_utils import execute_single_query, execute_update, execute_insert

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Payments Refund Lambda function - POST /api/v1/payments/{payment_id}/refund
    """
    try:
        logger.info(f"Payments refund request: {json.dumps(event)}")
        
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
        
        # Get payment ID from path parameters
        path_parameters = event.get('pathParameters') or {}
        payment_id = path_parameters.get('payment_id')
        
        if not payment_id:
            return error_response("Payment ID is required", 400)
        
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        refund_amount = body.get('amount')  # Optional partial refund
        reason = body.get('reason', 'Customer request')
        
        # Get payment details
        payment_query = """
            SELECT id, order_id, amount, currency, payment_method, status, 
                   gateway_response, metadata
            FROM payments
            WHERE id = %s
        """
        
        payment = execute_single_query(payment_query, (int(payment_id),))
        
        if not payment:
            return not_found_response("Payment not found")
        
        if payment['status'] != 'completed':
            return error_response(f"Payment is {payment['status']}. Only completed payments can be refunded.", 409)
        
        # Check if already refunded
        refund_check_query = """
            SELECT COUNT(*) as count FROM transactions 
            WHERE payment_id = %s AND transaction_type = 'refund' AND status = 'completed'
        """
        
        refund_result = execute_single_query(refund_check_query, (int(payment_id),))
        existing_refunds = refund_result['count'] if refund_result else 0
        
        if existing_refunds > 0:
            return error_response("Payment has already been refunded", 409)
        
        # Determine refund amount
        if refund_amount is None:
            refund_amount = payment['amount']  # Full refund
        else:
            refund_amount = float(refund_amount)
            if refund_amount > payment['amount']:
                return error_response("Refund amount cannot exceed payment amount", 400)
        
        # Simulate refund processing
        refund_result = simulate_refund_processing(payment, refund_amount, reason)
        
        # Update payment status if full refund
        if refund_amount == payment['amount']:
            update_payment_query = """
                UPDATE payments 
                SET status = 'refunded', updated_at = %s
                WHERE id = %s
            """
            
            now = datetime.utcnow()
            execute_update(update_payment_query, (now, int(payment_id)))
        
        # Create refund transaction record
        transaction_query = """
            INSERT INTO transactions (payment_id, transaction_type, amount, currency, 
                                    status, gateway_transaction_id, gateway_response, 
                                    created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """
        
        now = datetime.utcnow()
        transaction_id = execute_insert(transaction_query, (
            int(payment_id),
            'refund',
            refund_amount,
            payment['currency'],
            refund_result['status'],
            refund_result['gateway_response'].get('refund_id'),
            json.dumps(refund_result['gateway_response']),
            now,
            now
        ))
        
        # Get updated payment
        updated_payment = execute_single_query(payment_query, (int(payment_id),))
        
        # Convert data types for JSON serialization
        updated_payment['id'] = str(updated_payment['id'])
        updated_payment['order_id'] = str(updated_payment['order_id'])
        updated_payment['amount'] = float(updated_payment['amount'])
        if updated_payment['gateway_response'] is None:
            updated_payment['gateway_response'] = {}
        if updated_payment['metadata'] is None:
            updated_payment['metadata'] = {}
        
        return success_response({
            'payment': updated_payment,
            'refund_transaction_id': str(transaction_id),
            'refund_amount': refund_amount,
            'refund_result': refund_result
        }, f"Refund processed successfully for amount: {refund_amount}")
        
    except json.JSONDecodeError:
        return error_response("Invalid JSON in request body", 400)
    except ValueError as e:
        return error_response("Invalid data format", 400, str(e))
    except Exception as e:
        logger.error(f"Payments refund error: {str(e)}")
        return error_response("Failed to process refund", 500, str(e))

def simulate_refund_processing(payment: Dict[str, Any], refund_amount: float, reason: str) -> Dict[str, Any]:
    """
    Simulate refund processing with external gateway
    In real implementation, this would integrate with Stripe, PayPal, etc.
    """
    # Simulate processing logic
    import random
    
    # 95% success rate for refunds (usually higher than payments)
    is_successful = random.random() < 0.95
    
    if is_successful:
        return {
            'status': 'completed',
            'gateway_response': {
                'refund_id': f"re_{random.randint(100000, 999999)}",
                'gateway': payment['payment_method'],
                'refunded_at': datetime.utcnow().isoformat(),
                'amount': refund_amount,
                'reason': reason,
                'processing_time': '2-5 business days'
            }
        }
    else:
        return {
            'status': 'failed',
            'gateway_response': {
                'error_code': 'REFUND_FAILED',
                'error_message': 'Refund could not be processed at this time',
                'gateway': payment['payment_method'],
                'attempted_at': datetime.utcnow().isoformat()
            }
        }

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
