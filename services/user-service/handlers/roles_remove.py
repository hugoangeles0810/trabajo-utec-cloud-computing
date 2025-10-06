"""
Roles Remove Handler for Gamarriando User Service
Handles removing roles from users (admin only)
"""

import json
import logging
import os
import sys
from typing import Dict, Any

sys.path.append('/var/task')
from db_utils import get_user_by_id, remove_role_from_user, get_user_roles
from auth_utils import require_admin
from response_utils import (
    success_response, error_response, bad_request_response, not_found_response,
    cors_response, get_user_id_from_path, get_role_id_from_path, log_request, log_response
)

logger = logging.getLogger()
logger.setLevel(logging.INFO)

@require_admin
def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    try:
        log_request(event, context, 'roles_remove')
        
        # Handle CORS preflight
        if event.get('httpMethod') == 'OPTIONS':
            return cors_response()
        
        # Get user ID from path parameters
        user_id = get_user_id_from_path(event)
        if not user_id:
            return error_response("User ID is required", 400)
        
        # Get role ID from path parameters
        role_id = get_role_id_from_path(event)
        if not role_id:
            return error_response("Role ID is required", 400)
        
        # Get current user from token
        current_user = event.get('user', {})
        current_user_id = current_user.get('user_id')
        
        # Prevent self-role removal (admin should use other methods)
        if current_user_id == user_id:
            return error_response("Cannot remove roles from yourself", 400)
        
        # Get user from database
        user = get_user_by_id(user_id)
        if not user:
            return not_found_response("User not found")
        
        # Get user roles to find the specific role
        user_roles = get_user_roles(user_id)
        role_to_remove = None
        
        for role in user_roles:
            if role['id'] == role_id:
                role_to_remove = role
                break
        
        if not role_to_remove:
            return not_found_response("Role not found for this user")
        
        # Check if role is already inactive
        if not role_to_remove['is_active']:
            return error_response("Role is already inactive", 400)
        
        # Remove role from user (soft delete - set is_active = false)
        updated_rows = remove_role_from_user(user_id, role_id)
        
        if updated_rows == 0:
            return error_response("Failed to remove role", 500)
        
        # Get updated user roles
        updated_roles = get_user_roles(user_id)
        
        # Prepare response data
        response_data = {
            'user_id': str(user_id),
            'email': user['email'],
            'username': user['username'],
            'removed_role': role_to_remove['role_name'],
            'role_id': str(role_id),
            'all_roles': [role['role_name'] for role in updated_roles],
            'message': f"Role '{role_to_remove['role_name']}' removed successfully"
        }
        
        response = success_response(response_data, "Role removed successfully")
        log_response(response, 'roles_remove')
        return response
        
    except Exception as e:
        logger.error(f"Error in roles_remove: {str(e)}")
        return error_response("Failed to remove role", 500, str(e))
