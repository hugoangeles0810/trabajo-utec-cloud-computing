"""
Roles List Handler for Gamarriando User Service
Handles listing roles for a specific user
"""

import json
import logging
import os
import sys
from typing import Dict, Any

sys.path.append('/var/task')
from db_utils import get_user_by_id, get_user_roles
from auth_utils import require_auth
from response_utils import (
    success_response, error_response, not_found_response,
    cors_response, get_user_id_from_path, log_request, log_response
)

logger = logging.getLogger()
logger.setLevel(logging.INFO)

@require_auth
def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    try:
        log_request(event, context, 'roles_list')
        
        # Handle CORS preflight
        if event.get('httpMethod') == 'OPTIONS':
            return cors_response()
        
        # Get user ID from path parameters
        user_id = get_user_id_from_path(event)
        if not user_id:
            return error_response("User ID is required", 400)
        
        # Get current user from token
        current_user = event.get('user', {})
        current_user_id = current_user.get('user_id')
        current_user_roles = set(current_user.get('roles', []))
        
        # Check permissions: users can only view their own roles unless they're admin
        if current_user_id != user_id and 'admin' not in current_user_roles:
            return error_response("Access denied", 403)
        
        # Get user from database
        user = get_user_by_id(user_id)
        if not user:
            return not_found_response("User not found")
        
        # Get user roles
        roles = get_user_roles(user_id)
        
        # Format roles for response
        formatted_roles = []
        for role in roles:
            formatted_role = {
                'id': str(role['id']),
                'role_name': role['role_name'],
                'granted_at': role['granted_at'].isoformat() if role['granted_at'] else None,
                'expires_at': role['expires_at'].isoformat() if role['expires_at'] else None,
                'is_active': role['is_active'],
                'granted_by_email': role.get('granted_by_email')
            }
            formatted_roles.append(formatted_role)
        
        # Prepare response data
        response_data = {
            'user_id': str(user_id),
            'email': user['email'],
            'username': user['username'],
            'roles': formatted_roles,
            'total_roles': len(formatted_roles)
        }
        
        response = success_response(response_data, "User roles retrieved successfully")
        log_response(response, 'roles_list')
        return response
        
    except Exception as e:
        logger.error(f"Error in roles_list: {str(e)}")
        return error_response("Failed to list user roles", 500, str(e))
