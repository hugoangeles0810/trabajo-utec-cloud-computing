"""
Products Update Lambda function with RDS support
PUT /api/v1/products/{product_id}
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
    Products Update Lambda function - PUT /api/v1/products/{product_id}
    """
    try:
        logger.info(f"Products update request: {json.dumps(event)}")
        
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
        
        # Get product ID from path parameters
        path_parameters = event.get('pathParameters') or {}
        product_id = path_parameters.get('product_id')
        
        if not product_id:
            return error_response("Product ID is required", 400)
        
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        
        # Check if product exists
        check_query = "SELECT id FROM products WHERE id = %s"
        existing_product = execute_single_query(check_query, (int(product_id),))
        
        if not existing_product:
            return not_found_response("Product not found")
        
        # Build update query dynamically based on provided fields
        update_fields = []
        parameters = []
        
        if 'name' in body:
            update_fields.append("name = %s")
            parameters.append(body['name'])
        
        if 'slug' in body:
            update_fields.append("slug = %s")
            parameters.append(body['slug'])
        
        if 'description' in body:
            update_fields.append("description = %s")
            parameters.append(body['description'])
        
        if 'price' in body:
            update_fields.append("price = %s")
            parameters.append(float(body['price']))
        
        if 'stock' in body:
            update_fields.append("stock = %s")
            parameters.append(body['stock'])
        
        if 'status' in body:
            update_fields.append("status = %s")
            parameters.append(body['status'])
        
        if 'category_id' in body:
            update_fields.append("category_id = %s")
            parameters.append(int(body['category_id']))
        
        if 'vendor_id' in body:
            update_fields.append("vendor_id = %s")
            parameters.append(int(body['vendor_id']))
        
        if 'images' in body:
            update_fields.append("images = %s")
            parameters.append(json.dumps(body['images']))
        
        if 'tags' in body:
            update_fields.append("tags = %s")
            parameters.append(json.dumps(body['tags']))
        
        if not update_fields:
            return error_response("No fields to update", 400)
        
        # Add updated_at timestamp
        update_fields.append("updated_at = %s")
        parameters.append(datetime.utcnow())
        
        # Add product_id for WHERE clause
        parameters.append(int(product_id))
        
        # Execute update
        update_query = f"""
            UPDATE products 
            SET {', '.join(update_fields)}
            WHERE id = %s
        """
        
        affected_rows = execute_update(update_query, tuple(parameters))
        
        if affected_rows == 0:
            return error_response("Product not found or no changes made", 404)
        
        # Get the updated product
        get_query = """
            SELECT id, name, slug, description, price, stock, status,
                   category_id, vendor_id, images, tags, created_at, updated_at
            FROM products
            WHERE id = %s
        """
        
        updated_product = execute_single_query(get_query, (int(product_id),))
        
        # Convert data types for JSON serialization
        updated_product['id'] = str(updated_product['id'])
        updated_product['category_id'] = str(updated_product['category_id'])
        updated_product['vendor_id'] = str(updated_product['vendor_id'])
        # Convert Decimal fields to float for JSON serialization
        if updated_product.get('price') is not None:
            updated_product['price'] = float(updated_product['price'])
        if updated_product['created_at']:
            updated_product['created_at'] = updated_product['created_at'].isoformat()
        if updated_product['updated_at']:
            updated_product['updated_at'] = updated_product['updated_at'].isoformat()
        
        return success_response(updated_product, "Product updated successfully")
        
    except json.JSONDecodeError:
        return error_response("Invalid JSON in request body", 400)
    except ValueError as e:
        return error_response("Invalid data format", 400, str(e))
    except Exception as e:
        logger.error(f"Products update error: {str(e)}")
        return error_response("Failed to update product", 500, str(e))

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
