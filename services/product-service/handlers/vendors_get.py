"""
Vendors Get Lambda function with RDS support
GET /api/v1/vendors/{vendor_id}
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
    Vendors Get Lambda function - GET /api/v1/vendors/{vendor_id}
    """
    try:
        logger.info(f"Vendors get request: {json.dumps(event)}")
        
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
        
        # Get vendor ID from path parameters
        path_parameters = event.get('pathParameters') or {}
        vendor_id = path_parameters.get('vendor_id')
        
        if not vendor_id:
            return error_response("Vendor ID is required", 400)
        
        # Query vendor from database using psycopg2
        query = """
            SELECT id, name, email, phone, address, description, is_active, is_verified, rating, total_products, created_at, updated_at
            FROM vendors
            WHERE id = %s
        """

        parameters = (int(vendor_id),)
        vendor = execute_single_query(query, parameters)

        if not vendor:
            return not_found_response("Vendor not found")

        # Convert data types for JSON serialization
        vendor['id'] = str(vendor['id'])
        # Convert Decimal fields to float for JSON serialization
        if vendor.get('rating') is not None:
            vendor['rating'] = float(vendor['rating'])
        if vendor.get('total_products') is not None:
            vendor['total_products'] = int(vendor['total_products'])
        if vendor['created_at']:
            vendor['created_at'] = vendor['created_at'].isoformat()
        if vendor['updated_at']:
            vendor['updated_at'] = vendor['updated_at'].isoformat()
        if vendor['address'] is None:
            vendor['address'] = {}

        return success_response(vendor, "Vendor retrieved successfully")
        
    except Exception as e:
        logger.error(f"Vendors get error: {str(e)}")
        return error_response("Failed to retrieve vendor", 500, str(e))

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
