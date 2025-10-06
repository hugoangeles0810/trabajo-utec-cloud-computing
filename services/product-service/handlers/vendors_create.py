"""
Vendors Create Lambda function with RDS support
POST /api/v1/vendors
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
    Vendors Create Lambda function - POST /api/v1/vendors
    """
    try:
        logger.info(f"Vendors create request: {json.dumps(event)}")
        
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
        required_fields = ['name', 'email']
        for field in required_fields:
            if not body.get(field):
                return error_response(f"Field '{field}' is required", 400)
        
        # Check if email already exists
        email_check_query = "SELECT id FROM vendors WHERE email = %s"
        existing_vendor = execute_single_query(email_check_query, (body['email'],))
        
        if existing_vendor:
            return error_response("Vendor with this email already exists", 409)
        
        # Create vendor in database
        query = """
            INSERT INTO vendors (name, email, phone, address, description, is_active, is_verified, rating, total_products, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """
        
        now = datetime.utcnow()
        parameters = (
            body['name'],
            body['email'],
            body.get('phone', ''),
            json.dumps(body.get('address', {})),
            body.get('description', ''),
            body.get('is_active', True),
            body.get('is_verified', False),
            body.get('rating', 0.0),
            body.get('total_products', 0),
            now,
            now
        )
        
        vendor_id = execute_insert(query, parameters)
        
        # Get the created vendor
        get_query = """
            SELECT id, name, email, phone, address, description, is_active, is_verified, rating, total_products, created_at, updated_at
            FROM vendors
            WHERE id = %s
        """
        
        new_vendor = execute_single_query(get_query, (vendor_id,))
        
        # Convert data types for JSON serialization
        new_vendor['id'] = str(new_vendor['id'])
        # Convert Decimal fields to float for JSON serialization
        if new_vendor.get('rating') is not None:
            new_vendor['rating'] = float(new_vendor['rating'])
        if new_vendor.get('total_products') is not None:
            new_vendor['total_products'] = int(new_vendor['total_products'])
        if new_vendor['created_at']:
            new_vendor['created_at'] = new_vendor['created_at'].isoformat()
        if new_vendor['updated_at']:
            new_vendor['updated_at'] = new_vendor['updated_at'].isoformat()
        if new_vendor['address'] is None:
            new_vendor['address'] = {}
        
        return created_response(new_vendor, "Vendor created successfully")
        
    except json.JSONDecodeError:
        return error_response("Invalid JSON in request body", 400)
    except Exception as e:
        logger.error(f"Vendors create error: {str(e)}")
        return error_response("Failed to create vendor", 500, str(e))

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
