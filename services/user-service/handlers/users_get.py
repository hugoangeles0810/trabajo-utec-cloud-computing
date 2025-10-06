"""
Users Get Handler for Gamarriando User Service
Handles getting user by ID
"""

import json
import logging
import os
import sys
from typing import Dict, Any

sys.path.append('/var/task')
from db_utils import get_user_by_id, get_user_roles
from auth_utils import require_auth, format_user_response
from response_utils import (
    success_response, error_response, not_found_response,
    cors_response, get_user_id_from_path, log_request, log_response
)

logger = logging.getLogger()
logger.setLevel(logging.INFO)

@require_auth
def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    try:
        log_request(event, context, 'users_get')
        
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
        
        # Check permissions: users can only view their own profile unless they're admin
        if current_user_id != user_id and 'admin' not in current_user_roles:
            return error_response("Access denied", 403)
        
        # Get user from database
        user = get_user_by_id(user_id)
        if not user:
            return not_found_response("User not found")
        
        # Get user roles
        roles = get_user_roles(user['id'])
        role_names = [role['role_name'] for role in roles]
        
        # Format user response
        response_data = format_user_response(user)
        response_data['roles'] = role_names
        
        response = success_response(response_data, "User retrieved successfully")
        log_response(response, 'users_get')
        return response
        
    except Exception as e:
        logger.error(f"Error in users_get: {str(e)}")
        return error_response("Failed to get user", 500, str(e))
