"""
Authentication Logout Handler for Gamarriando User Service
Handles user logout and session cleanup
"""

import json
import logging
import os
import sys
from typing import Dict, Any

sys.path.append('/var/task')
from auth_utils import extract_token_from_header, get_user_from_token
from db_utils import revoke_all_user_sessions
from response_utils import (
    success_response, error_response, unauthorized_response,
    cors_response, extract_headers, log_request, log_response
)

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    try:
        log_request(event, context, 'auth_logout')
        
        # Handle CORS preflight
        if event.get('httpMethod') == 'OPTIONS':
            return cors_response()
        
        # Extract Authorization header
        headers = extract_headers(event)
        authorization = headers.get('Authorization') or headers.get('authorization')
        
        if not authorization:
            return unauthorized_response("Authorization header required")
        
        # Extract token from header
        token = extract_token_from_header(authorization)
        if not token:
            return unauthorized_response("Invalid authorization header format")
        
        # Get user from token
        user = get_user_from_token(token)
        if not user:
            return unauthorized_response("Invalid or expired token")
        
        # Revoke all user sessions
        revoked_count = revoke_all_user_sessions(user['user_id'])
        
        # Prepare response data
        response_data = {
            'user_id': str(user['user_id']),
            'sessions_revoked': revoked_count,
            'message': 'Logout successful. All sessions have been revoked.'
        }
        
        response = success_response(response_data, "Logout successful")
        log_response(response, 'auth_logout')
        return response
        
    except Exception as e:
        logger.error(f"Error in auth_logout: {str(e)}")
        return error_response("Failed to logout", 500, str(e))
