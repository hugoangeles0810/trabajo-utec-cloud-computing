"""
Transactions Create Lambda function with RDS support
POST /api/v1/transactions
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
    Transactions Create Lambda function - POST /api/v1/transactions
    """
    try:
        logger.info(f"Transactions create request: {json.dumps(event)}")
        
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
        required_fields = ['payment_id', 'transaction_type', 'amount']
        for field in required_fields:
            if not body.get(field):
                return error_response(f"Field '{field}' is required", 400)
        
        # Validate transaction type
        valid_types = ['payment', 'refund', 'chargeback', 'adjustment']
        if body['transaction_type'] not in valid_types:
            return error_response(f"Invalid transaction type. Must be one of: {', '.join(valid_types)}", 400)
        
        # Validate payment exists
        payment_check_query = "SELECT id, amount, currency FROM payments WHERE id = %s"
        payment = execute_single_query(payment_check_query, (int(body['payment_id']),))
        
        if not payment:
            return error_response("Payment not found", 404)
        
        # Validate amount doesn't exceed payment amount for refunds
        transaction_amount = float(body['amount'])
        if body['transaction_type'] == 'refund' and transaction_amount > float(payment['amount']):
            return error_response("Transaction amount cannot exceed payment amount", 400)
        
        # Create transaction in database
        query = """
            INSERT INTO transactions (payment_id, transaction_type, amount, currency, 
                                    status, gateway_transaction_id, gateway_response, 
                                    metadata, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """
        
        now = datetime.utcnow()
        parameters = (
            int(body['payment_id']),
            body['transaction_type'],
            transaction_amount,
            body.get('currency', payment['currency']),
            body.get('status', 'pending'),
            body.get('gateway_transaction_id'),
            json.dumps(body.get('gateway_response', {})),
            json.dumps(body.get('metadata', {})),
            now,
            now
        )
        
        transaction_id = execute_insert(query, parameters)
        
        # Get the created transaction
        get_query = """
            SELECT id, payment_id, transaction_type, amount, currency, status, 
                   gateway_transaction_id, gateway_response, metadata, created_at, updated_at
            FROM transactions
            WHERE id = %s
        """
        
        transaction = execute_single_query(get_query, (transaction_id,))
        
        # Convert data types for JSON serialization
        transaction['id'] = str(transaction['id'])
        transaction['payment_id'] = str(transaction['payment_id'])
        transaction['amount'] = float(transaction['amount'])
        if transaction['created_at']:
            transaction['created_at'] = transaction['created_at'].isoformat()
        if transaction['updated_at']:
            transaction['updated_at'] = transaction['updated_at'].isoformat()
        if transaction['gateway_response'] is None:
            transaction['gateway_response'] = {}
        if transaction['metadata'] is None:
            transaction['metadata'] = {}
        
        return created_response(transaction, "Transaction created successfully")
        
    except json.JSONDecodeError:
        return error_response("Invalid JSON in request body", 400)
    except ValueError as e:
        return error_response("Invalid data format", 400, str(e))
    except Exception as e:
        logger.error(f"Transactions create error: {str(e)}")
        return error_response("Failed to create transaction", 500, str(e))

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
