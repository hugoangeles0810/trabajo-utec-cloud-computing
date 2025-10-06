"""
Sessions Revoke Handler for Gamarriando User Service
Handles revoking a specific session
"""

import json
import logging
import os
import sys
from typing import Dict, Any

sys.path.append('/var/task')
from db_utils import get_user_by_id, revoke_session
from auth_utils import require_auth
from response_utils import (
    success_response, error_response, not_found_response,
    cors_response, get_session_id_from_path, log_request, log_response
)

logger = logging.getLogger()
logger.setLevel(logging.INFO)

@require_auth
def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    try:
        log_request(event, context, 'sessions_revoke')
        
        # Handle CORS preflight
        if event.get('httpMethod') == 'OPTIONS':
            return cors_response()
        
        # Get session ID from path parameters
        session_id = get_session_id_from_path(event)
        if not session_id:
            return error_response("Session ID is required", 400)
        
        # Get current user from token
        current_user = event.get('user', {})
        current_user_id = current_user.get('user_id')
        current_user_roles = set(current_user.get('roles', []))
        
        # For now, we'll allow users to revoke any session
        # In a more sophisticated implementation, you might want to check
        # if the session belongs to the current user or if they're admin
        
        # Revoke the session
        revoked_rows = revoke_session(session_id)
        
        if revoked_rows == 0:
            return not_found_response("Session not found or already revoked")
        
        # Prepare response data
        response_data = {
            'session_id': str(session_id),
            'revoked_by': str(current_user_id),
            'message': 'Session revoked successfully'
        }
        
        response = success_response(response_data, "Session revoked successfully")
        log_response(response, 'sessions_revoke')
        return response
        
    except Exception as e:
        logger.error(f"Error in sessions_revoke: {str(e)}")
        return error_response("Failed to revoke session", 500, str(e))
