"""
Vendors Update Lambda function with RDS support
PUT /api/v1/vendors/{vendor_id}
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
    Vendors Update Lambda function - PUT /api/v1/vendors/{vendor_id}
    """
    try:
        logger.info(f"Vendors update request: {json.dumps(event)}")
        
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
        
        # Get vendor ID from path parameters
        path_parameters = event.get('pathParameters') or {}
        vendor_id = path_parameters.get('vendor_id')
        
        if not vendor_id:
            return error_response("Vendor ID is required", 400)
        
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        
        # Check if vendor exists
        check_query = "SELECT id FROM vendors WHERE id = %s"
        existing_vendor = execute_single_query(check_query, (int(vendor_id),))
        
        if not existing_vendor:
            return not_found_response("Vendor not found")
        
        # Check if email is being updated and if it already exists
        if 'email' in body:
            email_check_query = "SELECT id FROM vendors WHERE email = %s AND id != %s"
            existing_email = execute_single_query(email_check_query, (body['email'], int(vendor_id)))
            
            if existing_email:
                return error_response("Vendor with this email already exists", 409)
        
        # Build update query dynamically based on provided fields
        update_fields = []
        parameters = []
        
        if 'name' in body:
            update_fields.append("name = %s")
            parameters.append(body['name'])
        
        if 'email' in body:
            update_fields.append("email = %s")
            parameters.append(body['email'])
        
        if 'phone' in body:
            update_fields.append("phone = %s")
            parameters.append(body['phone'])
        
        if 'address' in body:
            update_fields.append("address = %s")
            parameters.append(json.dumps(body['address']))
        
        if 'description' in body:
            update_fields.append("description = %s")
            parameters.append(body['description'])
        
        if 'is_active' in body:
            update_fields.append("is_active = %s")
            parameters.append(body['is_active'])
        
        if 'is_verified' in body:
            update_fields.append("is_verified = %s")
            parameters.append(body['is_verified'])
        
        if 'rating' in body:
            update_fields.append("rating = %s")
            parameters.append(body['rating'])
        
        if 'total_products' in body:
            update_fields.append("total_products = %s")
            parameters.append(body['total_products'])
        
        if not update_fields:
            return error_response("No fields to update", 400)
        
        # Add updated_at timestamp
        update_fields.append("updated_at = %s")
        parameters.append(datetime.utcnow())
        
        # Add vendor_id for WHERE clause
        parameters.append(int(vendor_id))
        
        # Execute update
        update_query = f"""
            UPDATE vendors 
            SET {', '.join(update_fields)}
            WHERE id = %s
        """
        
        affected_rows = execute_update(update_query, tuple(parameters))
        
        if affected_rows == 0:
            return error_response("Vendor not found or no changes made", 404)
        
        # Get the updated vendor
        get_query = """
            SELECT id, name, email, phone, address, description, is_active, is_verified, rating, total_products, created_at, updated_at
            FROM vendors
            WHERE id = %s
        """
        
        updated_vendor = execute_single_query(get_query, (int(vendor_id),))
        
        # Convert data types for JSON serialization
        updated_vendor['id'] = str(updated_vendor['id'])
        # Convert Decimal fields to float for JSON serialization
        if updated_vendor.get('rating') is not None:
            updated_vendor['rating'] = float(updated_vendor['rating'])
        if updated_vendor.get('total_products') is not None:
            updated_vendor['total_products'] = int(updated_vendor['total_products'])
        if updated_vendor['created_at']:
            updated_vendor['created_at'] = updated_vendor['created_at'].isoformat()
        if updated_vendor['updated_at']:
            updated_vendor['updated_at'] = updated_vendor['updated_at'].isoformat()
        if updated_vendor['address'] is None:
            updated_vendor['address'] = {}
        
        return success_response(updated_vendor, "Vendor updated successfully")
        
    except json.JSONDecodeError:
        return error_response("Invalid JSON in request body", 400)
    except Exception as e:
        logger.error(f"Vendors update error: {str(e)}")
        return error_response("Failed to update vendor", 500, str(e))

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
