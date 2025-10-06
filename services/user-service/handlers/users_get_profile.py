"""
Users Get Profile Handler for Gamarriando User Service
Handles getting current user profile
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
    success_response, error_response,
    cors_response, log_request, log_response
)

logger = logging.getLogger()
logger.setLevel(logging.INFO)

@require_auth
def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    try:
        log_request(event, context, 'users_get_profile')
        
        # Handle CORS preflight
        if event.get('httpMethod') == 'OPTIONS':
            return cors_response()
        
        # Get current user from token
        current_user = event.get('user', {})
        current_user_id = current_user.get('user_id')
        
        if not current_user_id:
            return error_response("User not found in token", 401)
        
        # Get user from database
        user = get_user_by_id(current_user_id)
        if not user:
            return error_response("User not found", 404)
        
        # Get user roles
        roles = get_user_roles(user['id'])
        role_names = [role['role_name'] for role in roles]
        
        # Format user response
        response_data = format_user_response(user)
        response_data['roles'] = role_names
        
        response = success_response(response_data, "Profile retrieved successfully")
        log_response(response, 'users_get_profile')
        return response
        
    except Exception as e:
        logger.error(f"Error in users_get_profile: {str(e)}")
        return error_response("Failed to get profile", 500, str(e))
