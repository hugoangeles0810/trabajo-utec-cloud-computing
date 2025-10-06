"""
Roles Assign Handler for Gamarriando User Service
Handles assigning roles to users (admin only)
"""

import json
import logging
import os
import sys
from typing import Dict, Any

sys.path.append('/var/task')
from db_utils import get_user_by_id, assign_role_to_user, get_user_roles
from auth_utils import require_admin
from response_utils import (
    success_response, error_response, bad_request_response, not_found_response, conflict_response,
    cors_response, extract_request_data, validate_required_fields, get_user_id_from_path, log_request, log_response
)

logger = logging.getLogger()
logger.setLevel(logging.INFO)

@require_admin
def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    try:
        log_request(event, context, 'roles_assign')
        
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
        
        # Prevent self-role assignment (admin should use other methods)
        if current_user_id == user_id:
            return error_response("Cannot assign roles to yourself", 400)
        
        # Get user from database
        user = get_user_by_id(user_id)
        if not user:
            return not_found_response("User not found")
        
        # Check if user is active
        if not user['is_active']:
            return error_response("Cannot assign roles to inactive user", 400)
        
        # Extract request data
        body = extract_request_data(event)
        
        # Validate required fields
        required_fields = ['role_name']
        validation_errors = validate_required_fields(body, required_fields)
        
        if validation_errors:
            return bad_request_response("Validation failed", {'errors': validation_errors})
        
        role_name = body['role_name'].strip().lower()
        
        # Validate role name
        valid_roles = ['admin', 'customer', 'vendor', 'moderator']
        if role_name not in valid_roles:
            return bad_request_response(f"Invalid role. Valid roles are: {', '.join(valid_roles)}")
        
        # Check if user already has this role
        existing_roles = get_user_roles(user_id)
        existing_role_names = [role['role_name'] for role in existing_roles]
        
        if role_name in existing_role_names:
            return conflict_response(f"User already has the '{role_name}' role")
        
        # Assign role to user
        role_id = assign_role_to_user(user_id, role_name, current_user_id)
        
        # Get updated user roles
        updated_roles = get_user_roles(user_id)
        
        # Prepare response data
        response_data = {
            'user_id': str(user_id),
            'email': user['email'],
            'username': user['username'],
            'assigned_role': role_name,
            'role_id': str(role_id),
            'all_roles': [role['role_name'] for role in updated_roles],
            'message': f"Role '{role_name}' assigned successfully"
        }
        
        response = success_response(response_data, "Role assigned successfully", 201)
        log_response(response, 'roles_assign')
        return response
        
    except ValueError as e:
        logger.error(f"Validation error in roles_assign: {str(e)}")
        return bad_request_response(str(e))
    except Exception as e:
        logger.error(f"Error in roles_assign: {str(e)}")
        return error_response("Failed to assign role", 500, str(e))
