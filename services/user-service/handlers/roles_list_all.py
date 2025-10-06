"""
Roles List All Handler for Gamarriando User Service
Handles listing all available roles in the system
"""

import json
import logging
import os
import sys
from typing import Dict, Any

sys.path.append('/var/task')
from auth_utils import require_auth
from response_utils import (
    success_response, error_response,
    cors_response, log_request, log_response
)

logger = logging.getLogger()
logger.setLevel(logging.INFO)

@require_auth
def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    try:
        log_request(event, context, 'roles_list_all')
        
        # Handle CORS preflight
        if event.get('httpMethod') == 'OPTIONS':
            return cors_response()
        
        # Define available roles in the system
        available_roles = [
            {
                'name': 'admin',
                'description': 'System administrator with full access',
                'permissions': [
                    'manage_users',
                    'manage_roles',
                    'manage_sessions',
                    'view_all_data',
                    'system_configuration'
                ]
            },
            {
                'name': 'customer',
                'description': 'Regular customer with basic access',
                'permissions': [
                    'view_own_profile',
                    'update_own_profile',
                    'manage_own_orders',
                    'view_products'
                ]
            },
            {
                'name': 'vendor',
                'description': 'Product vendor with selling permissions',
                'permissions': [
                    'manage_own_products',
                    'view_own_orders',
                    'manage_own_inventory',
                    'view_analytics'
                ]
            },
            {
                'name': 'moderator',
                'description': 'Content moderator with review permissions',
                'permissions': [
                    'review_products',
                    'moderate_content',
                    'manage_reports',
                    'view_user_activity'
                ]
            }
        ]
        
        # Prepare response data
        response_data = {
            'available_roles': available_roles,
            'total_roles': len(available_roles),
            'description': 'List of all available roles in the Gamarriando system'
        }
        
        response = success_response(response_data, "Available roles retrieved successfully")
        log_response(response, 'roles_list_all')
        return response
        
    except Exception as e:
        logger.error(f"Error in roles_list_all: {str(e)}")
        return error_response("Failed to list available roles", 500, str(e))
