"""
Orders List Lambda function with RDS support
GET /api/v1/orders
"""

import json
import logging
import os
import sys
from typing import Dict, Any

# Add parent directory to path to import db_utils
sys.path.append('/var/task')
from db_utils import execute_query

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Orders List Lambda function - GET /api/v1/orders
    """
    try:
        logger.info(f"Orders list request: {json.dumps(event)}")
        
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
        
        # Get query parameters
        query_params = event.get('queryStringParameters') or {}
        user_id = query_params.get('user_id')
        status = query_params.get('status', 'active')
        limit = int(query_params.get('limit', 100))
        skip = int(query_params.get('skip', 0))
        
        # Build query with filters using psycopg2 parameters
        where_conditions = ["1=1"]  # Always true condition
        parameters = []
        
        if user_id:
            where_conditions.append("user_id = %s")
            parameters.append(user_id)
        
        if status:
            where_conditions.append("status = %s")
            parameters.append(status)
        
        where_clause = " AND ".join(where_conditions)
        
        # Add pagination parameters
        parameters.extend([limit, skip])
        
        # Query orders from database
        query = f"""
            SELECT id, user_id, status, total_amount, currency, shipping_address, 
                   billing_address, notes, created_at, updated_at
            FROM orders
            WHERE {where_clause}
            ORDER BY created_at DESC
            LIMIT %s OFFSET %s
        """
        
        orders_data = execute_query(query, tuple(parameters))
        
        # Get total count for pagination (remove limit and offset parameters)
        count_parameters = parameters[:-2]
        count_query = f"SELECT COUNT(*) as total FROM orders WHERE {where_clause}"
        count_result = execute_query(count_query, tuple(count_parameters))
        total_count = int(count_result[0]['total']) if count_result else 0
        
        # Convert data types for JSON serialization
        for order in orders_data:
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
        
        return success_response({
            'orders': orders_data,
            'total': total_count,
            'pagination': {
                'skip': skip,
                'limit': limit,
                'has_more': (skip + limit) < total_count
            },
            'filters': {
                'user_id': user_id,
                'status': status
            }
        }, f"Retrieved {len(orders_data)} orders")
        
    except ValueError as e:
        return error_response("Invalid query parameters", 400, str(e))
    except Exception as e:
        logger.error(f"Orders list error: {str(e)}")
        return error_response("Failed to retrieve orders", 500, str(e))

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
