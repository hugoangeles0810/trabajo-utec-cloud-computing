"""
Products Get Lambda function with RDS support
GET /api/v1/products/{product_id}
"""

import json
import logging
import os
import boto3
from typing import Dict, Any
import sys

# Add parent directory to path to import db_utils
sys.path.append('/var/task')
from db_utils import execute_single_query, create_parameter

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Products Get Lambda function - GET /api/v1/products/{product_id}
    """
    try:
        logger.info(f"Products get request: {json.dumps(event)}")
        
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
        
        # Get product ID from path parameters
        path_parameters = event.get('pathParameters') or {}
        product_id = path_parameters.get('product_id')
        
        if not product_id:
            return error_response("Product ID is required", 400)
        
        # Query product from database using psycopg2
        query = """
            SELECT id, name, slug, description, price, stock, status,
                   category_id, vendor_id, images, tags, created_at, updated_at
            FROM products
            WHERE id = %s
        """

        parameters = (int(product_id),)
        product = execute_single_query(query, parameters)
        
        if not product:
            return not_found_response("Product not found")
        
        # Convert data types for JSON serialization
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
        
        return success_response(product, "Product retrieved successfully")
        
    except Exception as e:
        logger.error(f"Products get error: {str(e)}")
        return error_response("Failed to retrieve product", 500, str(e))

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

def not_found_response(message: str = "Resource not found") -> Dict[str, Any]:
    """Create not found response"""
    return {
        'statusCode': 404,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'message': message})
    }
