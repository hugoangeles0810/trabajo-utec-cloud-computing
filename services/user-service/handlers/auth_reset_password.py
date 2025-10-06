"""
Authentication Reset Password Handler for Gamarriando User Service
Handles password reset with token validation
"""

import json
import logging
import os
import sys
from typing import Dict, Any

sys.path.append('/var/task')
from db_utils import get_password_reset_token, mark_password_reset_token_used, update_user_password
from auth_utils import hash_password, validate_password_strength
from response_utils import (
    success_response, error_response, bad_request_response, unauthorized_response,
    cors_response, extract_request_data, validate_required_fields, log_request, log_response
)

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    try:
        log_request(event, context, 'auth_reset_password')
        
        # Handle CORS preflight
        if event.get('httpMethod') == 'OPTIONS':
            return cors_response()
        
        # Extract request data
        body = extract_request_data(event)
        
        # Validate required fields
        required_fields = ['token', 'new_password']
        validation_errors = validate_required_fields(body, required_fields)
        
        if validation_errors:
            return bad_request_response("Validation failed", {'errors': validation_errors})
        
        token = body['token'].strip()
        new_password = body['new_password']
        
        # Validate password strength
        password_validation = validate_password_strength(new_password)
        if not password_validation['is_valid']:
            return bad_request_response("Weak password", {'errors': password_validation['errors']})
        
        # Get password reset token from database
        reset_token_data = get_password_reset_token(token)
        if not reset_token_data:
            return unauthorized_response("Invalid or expired reset token")
        
        # Check if token has already been used
        if reset_token_data['used_at']:
            return unauthorized_response("Reset token has already been used")
        
        # Get user ID from token data
        user_id = reset_token_data['user_id']
        
        # Hash new password
        new_password_hash = hash_password(new_password)
        
        # Update user password
        updated_rows = update_user_password(user_id, new_password_hash)
        
        if updated_rows == 0:
            return error_response("Failed to update password", 500)
        
        # Mark token as used
        mark_password_reset_token_used(token)
        
        # Prepare response data
        response_data = {
            'user_id': str(user_id),
            'email': reset_token_data['email'],
            'message': 'Password has been reset successfully'
        }
        
        response = success_response(response_data, "Password reset successful")
        log_response(response, 'auth_reset_password')
        return response
        
    except ValueError as e:
        logger.error(f"Validation error in auth_reset_password: {str(e)}")
        return bad_request_response(str(e))
    except Exception as e:
        logger.error(f"Error in auth_reset_password: {str(e)}")
        return error_response("Failed to reset password", 500, str(e))
