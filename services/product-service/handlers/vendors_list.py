"""
Vendors List Lambda function with RDS support
GET /api/v1/vendors
"""

import json
import logging
import os
import boto3
from typing import Dict, Any
import sys

# Add parent directory to path to import db_utils
sys.path.append('/var/task')
from db_utils import execute_query

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Vendors List Lambda function - GET /api/v1/vendors
    """
    try:
        logger.info(f"Vendors list request: {json.dumps(event)}")
        
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
        
        # Query vendors from database
        query = """
            SELECT id, name, email, phone, address, description, is_active, 
                   is_verified, rating, total_products, created_at, updated_at
            FROM vendors 
            ORDER BY name ASC
        """
        
        vendors_data = execute_query(query)
        
        # Convert data types for JSON serialization
        for vendor in vendors_data:
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
        
        return success_response({
            'vendors': vendors_data,
            'total': len(vendors_data)
        }, f"Retrieved {len(vendors_data)} vendors")
        
    except Exception as e:
        logger.error(f"Vendors list error: {str(e)}")
        return error_response("Failed to retrieve vendors", 500, str(e))

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