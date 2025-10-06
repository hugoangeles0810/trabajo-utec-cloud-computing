"""
Users Change Password Handler for Gamarriando User Service
Handles password change for authenticated users
"""

import json
import logging
import os
import sys
from typing import Dict, Any

sys.path.append('/var/task')
from db_utils import get_user_by_id, update_user_password
from auth_utils import require_auth, verify_password, hash_password, validate_password_strength
from response_utils import (
    success_response, error_response, bad_request_response, not_found_response, unauthorized_response,
    cors_response, extract_request_data, validate_required_fields, get_user_id_from_path, log_request, log_response
)

logger = logging.getLogger()
logger.setLevel(logging.INFO)

@require_auth
def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    try:
        log_request(event, context, 'users_change_password')
        
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
        
        # Check permissions: users can only change their own password unless they're admin
        if current_user_id != user_id and 'admin' not in current_user_roles:
            return error_response("Access denied", 403)
        
        # Get user from database
        user = get_user_by_id(user_id)
        if not user:
            return not_found_response("User not found")
        
        # Extract request data
        body = extract_request_data(event)
        
        # Validate required fields
        required_fields = ['new_password']
        validation_errors = validate_required_fields(body, required_fields)
        
        if validation_errors:
            return bad_request_response("Validation failed", {'errors': validation_errors})
        
        new_password = body['new_password']
        
        # Validate password strength
        password_validation = validate_password_strength(new_password)
        if not password_validation['is_valid']:
            return bad_request_response("Weak password", {'errors': password_validation['errors']})
        
        # If user is changing their own password, require current password
        if current_user_id == user_id:
            if 'current_password' not in body:
                return bad_request_response("Current password is required")
            
            current_password = body['current_password']
            
            # Verify current password
            if not verify_password(current_password, user['password_hash']):
                return unauthorized_response("Current password is incorrect")
        
        # Hash new password
        new_password_hash = hash_password(new_password)
        
        # Update user password
        updated_rows = update_user_password(user_id, new_password_hash)
        
        if updated_rows == 0:
            return error_response("Failed to update password", 500)
        
        # Prepare response data
        response_data = {
            'user_id': str(user_id),
            'email': user['email'],
            'username': user['username'],
            'message': 'Password has been changed successfully'
        }
        
        response = success_response(response_data, "Password changed successfully")
        log_response(response, 'users_change_password')
        return response
        
    except ValueError as e:
        logger.error(f"Validation error in users_change_password: {str(e)}")
        return bad_request_response(str(e))
    except Exception as e:
        logger.error(f"Error in users_change_password: {str(e)}")
        return error_response("Failed to change password", 500, str(e))
