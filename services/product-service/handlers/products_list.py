"""
Products List Lambda function with RDS support
GET /api/v1/products
"""

import json
import logging
import os
import boto3
from typing import Dict, Any, Optional
import sys

# Add parent directory to path to import db_utils
sys.path.append('/var/task')
from db_utils import execute_query, create_parameter

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Products List Lambda function - GET /api/v1/products
    """
    try:
        logger.info(f"Products list request: {json.dumps(event)}")
        
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
        
        # Parse query parameters
        query_params = event.get('queryStringParameters') or {}
        skip = int(query_params.get('skip', 0))
        limit = int(query_params.get('limit', 100))
        category_id = query_params.get('category_id')
        vendor_id = query_params.get('vendor_id')
        status = query_params.get('status', 'active')
        
        # Build query with filters using psycopg2 parameters
        where_conditions = ["status = %s"]
        parameters = [status]
        
        if category_id:
            where_conditions.append("category_id = %s")
            parameters.append(int(category_id))
        
        if vendor_id:
            where_conditions.append("vendor_id = %s")
            parameters.append(int(vendor_id))
        
        where_clause = " AND ".join(where_conditions)
        
        # Add pagination parameters
        parameters.extend([limit, skip])
        
        # Query products from database
        query = f"""
            SELECT id, name, slug, description, price, stock, status,
                   category_id, vendor_id, images, tags, created_at, updated_at
            FROM products
            WHERE {where_clause}
            ORDER BY created_at DESC
            LIMIT %s OFFSET %s
        """

        products_data = execute_query(query, tuple(parameters))

        # Get total count for pagination (remove limit and offset parameters)
        count_parameters = parameters[:-2]
        count_query = f"SELECT COUNT(*) as total FROM products WHERE {where_clause}"
        count_result = execute_query(count_query, tuple(count_parameters))
        total_count = int(count_result[0]['total']) if count_result else 0
        
        # Convert data types for JSON serialization
        for product in products_data:
            product['id'] = str(product['id'])
            product['category_id'] = str(product['category_id'])
            product['vendor_id'] = str(product['vendor_id'])
            product['price'] = float(product['price'])
            if product['created_at']:
                product['created_at'] = product['created_at'].isoformat()
            if product['updated_at']:
                product['updated_at'] = product['updated_at'].isoformat()
            if product['images'] is None:
                product['images'] = []
            if product['tags'] is None:
                product['tags'] = []
        
        return success_response({
            'products': products_data,
            'total': total_count,
            'pagination': {
                'skip': skip,
                'limit': limit,
                'has_more': (skip + limit) < total_count
            },
            'filters': {
                'category_id': category_id,
                'vendor_id': vendor_id,
                'status': status
            }
        }, f"Retrieved {len(products_data)} products")
        
    except ValueError as e:
        logger.error(f"Invalid parameter error: {str(e)}")
        return error_response("Invalid query parameters", 400, str(e))
    except Exception as e:
        logger.error(f"Products list error: {str(e)}")
        return error_response("Failed to retrieve products", 500, str(e))

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
