"""
Sessions Revoke All Handler for Gamarriando User Service
Handles revoking all sessions for a user
"""

import json
import logging
import os
import sys
from typing import Dict, Any

sys.path.append('/var/task')
from db_utils import get_user_by_id, revoke_all_user_sessions
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
        log_request(event, context, 'sessions_revoke_all')
        
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
        
        # Check permissions: users can only revoke their own sessions unless they're admin
        if current_user_id != user_id and 'admin' not in current_user_roles:
            return error_response("Access denied", 403)
        
        # Get user from database
        user = get_user_by_id(user_id)
        if not user:
            return not_found_response("User not found")
        
        # Revoke all user sessions
        revoked_count = revoke_all_user_sessions(user_id)
        
        # Prepare response data
        response_data = {
            'user_id': str(user_id),
            'email': user['email'],
            'username': user['username'],
            'sessions_revoked': revoked_count,
            'revoked_by': str(current_user_id),
            'message': f'All sessions revoked successfully. {revoked_count} sessions were terminated.'
        }
        
        response = success_response(response_data, "All sessions revoked successfully")
        log_response(response, 'sessions_revoke_all')
        return response
        
    except Exception as e:
        logger.error(f"Error in sessions_revoke_all: {str(e)}")
        return error_response("Failed to revoke all sessions", 500, str(e))
