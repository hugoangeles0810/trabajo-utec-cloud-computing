"""
Users Update Handler for Gamarriando User Service
Handles updating user information
"""

import json
import logging
import os
import sys
from typing import Dict, Any

sys.path.append('/var/task')
from db_utils import get_user_by_id, update_user, get_user_by_email, get_user_by_username
from auth_utils import require_auth, validate_email, validate_username, format_user_response
from response_utils import (
    success_response, error_response, bad_request_response, not_found_response, conflict_response,
    cors_response, extract_request_data, get_user_id_from_path, log_request, log_response
)

logger = logging.getLogger()
logger.setLevel(logging.INFO)

@require_auth
def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    try:
        log_request(event, context, 'users_update')
        
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
        
        # Check permissions: users can only update their own profile unless they're admin
        if current_user_id != user_id and 'admin' not in current_user_roles:
            return error_response("Access denied", 403)
        
        # Get user from database
        user = get_user_by_id(user_id)
        if not user:
            return not_found_response("User not found")
        
        # Extract request data
        body = extract_request_data(event)
        
        # Prepare update data
        update_data = {}
        
        # Fields that can be updated
        updatable_fields = [
            'first_name', 'last_name', 'phone', 'date_of_birth', 
            'profile_picture_url', 'preferences'
        ]
        
        # Admin-only fields
        admin_fields = ['is_active', 'is_verified', 'is_admin']
        
        # Process updatable fields
        for field in updatable_fields:
            if field in body:
                if field in ['first_name', 'last_name', 'phone', 'profile_picture_url']:
                    value = body[field].strip() if body[field] else None
                    if value == '':
                        value = None
                    update_data[field] = value
                else:
                    update_data[field] = body[field]
        
        # Process admin-only fields
        if 'admin' in current_user_roles:
            for field in admin_fields:
                if field in body:
                    update_data[field] = body[field]
        
        # Handle email update (special case - needs validation and uniqueness check)
        if 'email' in body:
            new_email = body['email'].strip().lower()
            if not validate_email(new_email):
                return bad_request_response("Invalid email format")
            
            # Check if email is already taken by another user
            existing_user = get_user_by_email(new_email)
            if existing_user and existing_user['id'] != user_id:
                return conflict_response("Email already taken")
            
            update_data['email'] = new_email
        
        # Handle username update (special case - needs validation and uniqueness check)
        if 'username' in body:
            new_username = body['username'].strip()
            username_validation = validate_username(new_username)
            if not username_validation['is_valid']:
                return bad_request_response("Invalid username", {'errors': username_validation['errors']})
            
            # Check if username is already taken by another user
            existing_user = get_user_by_username(new_username)
            if existing_user and existing_user['id'] != user_id:
                return conflict_response("Username already taken")
            
            update_data['username'] = new_username
        
        # Check if there's anything to update
        if not update_data:
            return bad_request_response("No valid fields to update")
        
        # Update user
        updated_rows = update_user(user_id, update_data)
        
        if updated_rows == 0:
            return error_response("Failed to update user", 500)
        
        # Get updated user
        updated_user = get_user_by_id(user_id)
        
        # Format user response
        response_data = format_user_response(updated_user)
        
        response = success_response(response_data, "User updated successfully")
        log_response(response, 'users_update')
        return response
        
    except ValueError as e:
        logger.error(f"Validation error in users_update: {str(e)}")
        return bad_request_response(str(e))
    except Exception as e:
        logger.error(f"Error in users_update: {str(e)}")
        return error_response("Failed to update user", 500, str(e))
