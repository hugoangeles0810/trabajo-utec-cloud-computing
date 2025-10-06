"""
Products Create Lambda function with RDS support
POST /api/v1/products
"""

import json
import logging
import os
import boto3
from typing import Dict, Any
import sys
from datetime import datetime

# Add parent directory to path to import db_utils
sys.path.append('/var/task')
from db_utils import execute_insert, execute_single_query, create_parameter

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Products Create Lambda function - POST /api/v1/products
    """
    try:
        logger.info(f"Products create request: {json.dumps(event)}")
        
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
        required_fields = ['name', 'slug', 'price', 'category_id', 'vendor_id']
        for field in required_fields:
            if not body.get(field):
                return error_response(f"Field '{field}' is required", 400)
        
        # Create product in database using psycopg2
        query = """
            INSERT INTO products (name, slug, description, price, stock, status, 
                                category_id, vendor_id, images, tags, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """
        
        now = datetime.utcnow()
        parameters = (
            body['name'],
            body['slug'],
            body.get('description', ''),
            float(body['price']),
            body.get('stock', 0),
            body.get('status', 'active'),
            int(body['category_id']),
            int(body['vendor_id']),
            json.dumps(body.get('images', [])),
            json.dumps(body.get('tags', [])),
            now,
            now
        )
        
        product_id = execute_insert(query, parameters)
        
        # Get the created product
        get_query = """
            SELECT id, name, slug, description, price, stock, status, 
                   category_id, vendor_id, images, tags, created_at, updated_at
            FROM products
            WHERE id = %s
        """
        
        get_parameters = (product_id,)
        new_product = execute_single_query(get_query, get_parameters)
        
        # Convert data types for JSON serialization
        new_product['id'] = str(new_product['id'])
        new_product['category_id'] = str(new_product['category_id'])
        new_product['vendor_id'] = str(new_product['vendor_id'])
        new_product['price'] = float(new_product['price'])
        if new_product['created_at']:
            new_product['created_at'] = new_product['created_at'].isoformat()
        if new_product['updated_at']:
            new_product['updated_at'] = new_product['updated_at'].isoformat()
        if new_product['images'] is None:
            new_product['images'] = []
        if new_product['tags'] is None:
            new_product['tags'] = []
        
        return created_response(new_product, "Product created successfully")
        
    except json.JSONDecodeError:
        return error_response("Invalid JSON in request body", 400)
    except ValueError as e:
        return error_response("Invalid data format", 400, str(e))
    except Exception as e:
        logger.error(f"Products create error: {str(e)}")
        return error_response("Failed to create product", 500, str(e))

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
