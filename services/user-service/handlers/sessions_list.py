"""
Sessions List Handler for Gamarriando User Service
Handles listing active sessions for a user
"""

import json
import logging
import os
import sys
from typing import Dict, Any

sys.path.append('/var/task')
from db_utils import get_user_by_id, get_user_sessions
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
        log_request(event, context, 'sessions_list')
        
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
        
        # Check permissions: users can only view their own sessions unless they're admin
        if current_user_id != user_id and 'admin' not in current_user_roles:
            return error_response("Access denied", 403)
        
        # Get user from database
        user = get_user_by_id(user_id)
        if not user:
            return not_found_response("User not found")
        
        # Get user sessions
        sessions = get_user_sessions(user_id)
        
        # Format sessions for response
        formatted_sessions = []
        for session in sessions:
            formatted_session = {
                'id': str(session['id']),
                'device_info': session.get('device_info', {}),
                'ip_address': session.get('ip_address'),
                'user_agent': session.get('user_agent'),
                'expires_at': session['expires_at'].isoformat() if session['expires_at'] else None,
                'created_at': session['created_at'].isoformat() if session['created_at'] else None,
                'last_accessed_at': session['last_accessed_at'].isoformat() if session['last_accessed_at'] else None,
                'is_current': False  # This would need to be determined by comparing with current session
            }
            formatted_sessions.append(formatted_session)
        
        # Prepare response data
        response_data = {
            'user_id': str(user_id),
            'email': user['email'],
            'username': user['username'],
            'sessions': formatted_sessions,
            'total_sessions': len(formatted_sessions),
            'message': f"Found {len(formatted_sessions)} active sessions"
        }
        
        response = success_response(response_data, "User sessions retrieved successfully")
        log_response(response, 'sessions_list')
        return response
        
    except Exception as e:
        logger.error(f"Error in sessions_list: {str(e)}")
        return error_response("Failed to list user sessions", 500, str(e))
