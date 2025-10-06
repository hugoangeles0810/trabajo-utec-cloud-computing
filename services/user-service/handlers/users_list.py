"""
Users List Handler for Gamarriando User Service
Handles listing users with pagination and filtering
"""

import json
import logging
import os
import sys
from typing import Dict, Any

sys.path.append('/var/task')
from db_utils import get_users_with_pagination, count_users
from auth_utils import require_admin, format_user_response
from response_utils import (
    success_response, error_response, bad_request_response,
    cors_response, extract_query_parameters, paginate_results, log_request, log_response
)

logger = logging.getLogger()
logger.setLevel(logging.INFO)

@require_admin
def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    try:
        log_request(event, context, 'users_list')
        
        # Handle CORS preflight
        if event.get('httpMethod') == 'OPTIONS':
            return cors_response()
        
        # Extract query parameters
        query_params = extract_query_parameters(event)
        
        # Parse pagination parameters
        try:
            page = int(query_params.get('page', '1'))
            per_page = int(query_params.get('per_page', '10'))
            
            # Validate pagination parameters
            if page < 1:
                page = 1
            if per_page < 1 or per_page > 100:
                per_page = 10
                
        except ValueError:
            return bad_request_response("Invalid pagination parameters")
        
        # Parse filter parameters
        filters = {}
        
        # Boolean filters
        if query_params.get('is_verified') is not None:
            filters['is_verified'] = query_params['is_verified'].lower() == 'true'
        
        if query_params.get('is_admin') is not None:
            filters['is_admin'] = query_params['is_admin'].lower() == 'true'
        
        # Search filter
        if query_params.get('search'):
            filters['search'] = query_params['search'].strip()
        
        # Calculate offset
        offset = (page - 1) * per_page
        
        # Get users with pagination
        users = get_users_with_pagination(per_page, offset, filters)
        
        # Get total count for pagination
        total_count = count_users(filters)
        
        # Format user responses
        formatted_users = []
        for user in users:
            formatted_user = format_user_response(user)
            formatted_users.append(formatted_user)
        
        # Create paginated response
        paginated_data = {
            'users': formatted_users,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': total_count,
                'pages': (total_count + per_page - 1) // per_page,
                'has_next': (page * per_page) < total_count,
                'has_prev': page > 1
            }
        }
        
        response = success_response(paginated_data, "Users retrieved successfully")
        log_response(response, 'users_list')
        return response
        
    except ValueError as e:
        logger.error(f"Validation error in users_list: {str(e)}")
        return bad_request_response(str(e))
    except Exception as e:
        logger.error(f"Error in users_list: {str(e)}")
        return error_response("Failed to list users", 500, str(e))
