"""
Transactions Get Lambda function with RDS support
GET /api/v1/transactions/{transaction_id}
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
    Transactions Get Lambda function - GET /api/v1/transactions/{transaction_id}
    """
    try:
        logger.info(f"Transactions get request: {json.dumps(event)}")
        
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
        
        # Get transaction ID from path parameters
        path_parameters = event.get('pathParameters') or {}
        transaction_id = path_parameters.get('transaction_id')
        
        if not transaction_id:
            return error_response("Transaction ID is required", 400)
        
        # Query transaction from database using psycopg2
        query = """
            SELECT id, payment_id, transaction_type, amount, currency, status, 
                   gateway_transaction_id, gateway_response, metadata, created_at, updated_at
            FROM transactions
            WHERE id = %s
        """
        
        parameters = (int(transaction_id),)
        transaction = execute_single_query(query, parameters)
        
        if not transaction:
            return not_found_response("Transaction not found")
        
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
        
        return success_response(transaction, "Transaction retrieved successfully")
        
    except ValueError as e:
        return error_response("Invalid transaction ID format", 400, str(e))
    except Exception as e:
        logger.error(f"Transactions get error: {str(e)}")
        return error_response("Failed to retrieve transaction", 500, str(e))

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
