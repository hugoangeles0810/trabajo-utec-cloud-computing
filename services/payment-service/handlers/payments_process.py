"""
Payments Process Lambda function with RDS support
POST /api/v1/payments/{payment_id}/process
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
    Payments Process Lambda function - POST /api/v1/payments/{payment_id}/process
    """
    try:
        logger.info(f"Payments process request: {json.dumps(event)}")
        
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
        
        if payment['status'] != 'pending':
            return error_response(f"Payment is already {payment['status']}. Cannot process.", 409)
        
        # Simulate payment processing (in real implementation, integrate with Stripe/PayPal)
        processing_result = simulate_payment_processing(payment, body)
        
        # Update payment status
        update_payment_query = """
            UPDATE payments 
            SET status = %s, gateway_response = %s, updated_at = %s
            WHERE id = %s
        """
        
        now = datetime.utcnow()
        execute_update(update_payment_query, (
            processing_result['status'],
            json.dumps(processing_result['gateway_response']),
            now,
            int(payment_id)
        ))
        
        # Create transaction record
        transaction_query = """
            INSERT INTO transactions (payment_id, transaction_type, amount, currency, 
                                    status, gateway_transaction_id, gateway_response, 
                                    created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """
        
        transaction_id = execute_insert(transaction_query, (
            int(payment_id),
            'payment',
            payment['amount'],
            payment['currency'],
            processing_result['status'],
            processing_result['gateway_response'].get('transaction_id'),
            json.dumps(processing_result['gateway_response']),
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
            'transaction_id': str(transaction_id),
            'processing_result': processing_result
        }, f"Payment processed successfully with status: {processing_result['status']}")
        
    except json.JSONDecodeError:
        return error_response("Invalid JSON in request body", 400)
    except ValueError as e:
        return error_response("Invalid data format", 400, str(e))
    except Exception as e:
        logger.error(f"Payments process error: {str(e)}")
        return error_response("Failed to process payment", 500, str(e))

def simulate_payment_processing(payment: Dict[str, Any], request_body: Dict[str, Any]) -> Dict[str, Any]:
    """
    Simulate payment processing with external gateway
    In real implementation, this would integrate with Stripe, PayPal, etc.
    """
    # Simulate processing logic
    import random
    
    # 90% success rate for simulation
    is_successful = random.random() < 0.9
    
    if is_successful:
        return {
            'status': 'completed',
            'gateway_response': {
                'transaction_id': f"txn_{random.randint(100000, 999999)}",
                'gateway': payment['payment_method'],
                'processed_at': datetime.utcnow().isoformat(),
                'fee': round(float(payment['amount']) * 0.029, 2),  # 2.9% fee
                'net_amount': round(float(payment['amount']) * 0.971, 2)
            }
        }
    else:
        return {
            'status': 'failed',
            'gateway_response': {
                'error_code': 'CARD_DECLINED',
                'error_message': 'Your card was declined',
                'gateway': payment['payment_method'],
                'processed_at': datetime.utcnow().isoformat()
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
