"""
Users Delete Handler for Gamarriando User Service
Handles user deletion (soft delete)
"""

import json
import logging
import os
import sys
from typing import Dict, Any

sys.path.append('/var/task')
from db_utils import get_user_by_id, delete_user
from auth_utils import require_admin
from response_utils import (
    success_response, error_response, not_found_response,
    cors_response, get_user_id_from_path, log_request, log_response
)

logger = logging.getLogger()
logger.setLevel(logging.INFO)

@require_admin
def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    try:
        log_request(event, context, 'users_delete')
        
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
        
        # Prevent self-deletion
        if current_user_id == user_id:
            return error_response("Cannot delete your own account", 400)
        
        # Get user from database
        user = get_user_by_id(user_id)
        if not user:
            return not_found_response("User not found")
        
        # Check if user is already deactivated
        if not user['is_active']:
            return error_response("User is already deactivated", 400)
        
        # Soft delete user (set is_active = false)
        updated_rows = delete_user(user_id)
        
        if updated_rows == 0:
            return error_response("Failed to delete user", 500)
        
        # Prepare response data
        response_data = {
            'user_id': str(user_id),
            'email': user['email'],
            'username': user['username'],
            'message': 'User has been deactivated successfully'
        }
        
        response = success_response(response_data, "User deleted successfully")
        log_response(response, 'users_delete')
        return response
        
    except Exception as e:
        logger.error(f"Error in users_delete: {str(e)}")
        return error_response("Failed to delete user", 500, str(e))
