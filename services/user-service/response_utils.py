"""
Common response utilities for Gamarriando User Service Lambda functions
"""

import json
import logging
from typing import Any, Dict, Optional
from datetime import datetime, date
from decimal import Decimal

logger = logging.getLogger(__name__)

class JSONEncoder(json.JSONEncoder):
    """Custom JSON encoder to handle Decimal and datetime objects"""
    
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        elif isinstance(obj, (datetime, date)):
            return obj.isoformat()
        return super().default(obj)

def success_response(data: Any = None, message: str = "Success", status_code: int = 200) -> Dict[str, Any]:
    """Create a successful HTTP response"""
    response_data = {'message': message}
    if data is not None:
        response_data['data'] = data
    
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
        },
        'body': json.dumps(response_data, cls=JSONEncoder)
    }

def created_response(data: Any = None, message: str = "Created successfully") -> Dict[str, Any]:
    """Create a 201 Created HTTP response"""
    return success_response(data, message, 201)

def error_response(message: str, status_code: int = 500, error: str = None, details: Dict[str, Any] = None) -> Dict[str, Any]:
    """Create an error HTTP response"""
    response_data = {'message': message}
    
    if error:
        response_data['error'] = error
    
    if details:
        response_data['details'] = details
    
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
        },
        'body': json.dumps(response_data, cls=JSONEncoder)
    }

def bad_request_response(message: str, details: Dict[str, Any] = None) -> Dict[str, Any]:
    """Create a 400 Bad Request HTTP response"""
    return error_response(message, 400, details=details)

def unauthorized_response(message: str = "Unauthorized") -> Dict[str, Any]:
    """Create a 401 Unauthorized HTTP response"""
    return error_response(message, 401)

def forbidden_response(message: str = "Forbidden") -> Dict[str, Any]:
    """Create a 403 Forbidden HTTP response"""
    return error_response(message, 403)

def not_found_response(message: str = "Resource not found") -> Dict[str, Any]:
    """Create a 404 Not Found HTTP response"""
    return error_response(message, 404)

def conflict_response(message: str = "Conflict") -> Dict[str, Any]:
    """Create a 409 Conflict HTTP response"""
    return error_response(message, 409)

def validation_error_response(errors: list) -> Dict[str, Any]:
    """Create a 422 Validation Error HTTP response"""
    return error_response("Validation failed", 422, details={'errors': errors})

def cors_response() -> Dict[str, Any]:
    """Create a CORS preflight response"""
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
        },
        'body': ''
    }

def extract_request_data(event: Dict[str, Any]) -> Dict[str, Any]:
    """Extract and parse request data from Lambda event"""
    try:
        # Handle different content types
        headers = event.get('headers', {})
        # API Gateway converts headers to lowercase, so check both cases
        content_type = (headers.get('Content-Type', '') or headers.get('content-type', '')).lower()
        
        if 'application/json' in content_type:
            body = event.get('body', '{}')
            if isinstance(body, str):
                return json.loads(body)
            return body or {}
        else:
            # For form data or other types, return empty dict
            return {}
    except json.JSONDecodeError as e:
        logger.error(f"JSON decode error: {str(e)}")
        raise ValueError("Invalid JSON in request body")
    except Exception as e:
        logger.error(f"Error extracting request data: {str(e)}")
        raise ValueError("Error processing request data")

def extract_path_parameters(event: Dict[str, Any]) -> Dict[str, str]:
    """Extract path parameters from Lambda event"""
    return event.get('pathParameters', {}) or {}

def extract_query_parameters(event: Dict[str, Any]) -> Dict[str, str]:
    """Extract query parameters from Lambda event"""
    return event.get('queryStringParameters', {}) or {}

def extract_headers(event: Dict[str, Any]) -> Dict[str, str]:
    """Extract headers from Lambda event"""
    return event.get('headers', {}) or {}

def get_user_id_from_path(event: Dict[str, Any]) -> Optional[int]:
    """Extract user_id from path parameters"""
    path_params = extract_path_parameters(event)
    user_id = path_params.get('user_id')
    if user_id:
        try:
            return int(user_id)
        except ValueError:
            return None
    return None

def get_session_id_from_path(event: Dict[str, Any]) -> Optional[int]:
    """Extract session_id from path parameters"""
    path_params = extract_path_parameters(event)
    session_id = path_params.get('session_id')
    if session_id:
        try:
            return int(session_id)
        except ValueError:
            return None
    return None

def get_role_id_from_path(event: Dict[str, Any]) -> Optional[int]:
    """Extract role_id from path parameters"""
    path_params = extract_path_parameters(event)
    role_id = path_params.get('role_id')
    if role_id:
        try:
            return int(role_id)
        except ValueError:
            return None
    return None

def validate_required_fields(data: Dict[str, Any], required_fields: list) -> list:
    """Validate that required fields are present in data"""
    errors = []
    for field in required_fields:
        if field not in data or data[field] is None or data[field] == '':
            errors.append(f"Field '{field}' is required")
    return errors

def validate_field_types(data: Dict[str, Any], field_types: Dict[str, type]) -> list:
    """Validate field types in data"""
    errors = []
    for field, expected_type in field_types.items():
        if field in data and data[field] is not None:
            if not isinstance(data[field], expected_type):
                errors.append(f"Field '{field}' must be of type {expected_type.__name__}")
    return errors

def paginate_results(results: list, page: int = 1, per_page: int = 10) -> Dict[str, Any]:
    """Paginate a list of results"""
    total = len(results)
    start = (page - 1) * per_page
    end = start + per_page
    
    paginated_results = results[start:end]
    
    return {
        'items': paginated_results,
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': total,
            'pages': (total + per_page - 1) // per_page,
            'has_next': end < total,
            'has_prev': page > 1
        }
    }

def log_request(event: Dict[str, Any], context: Any, function_name: str):
    """Log request details for debugging"""
    request_data = {
        'httpMethod': event.get('httpMethod'),
        'path': event.get('path'),
        'pathParameters': event.get('pathParameters'),
        'queryStringParameters': event.get('queryStringParameters'),
        'headers': {k: v for k, v in event.get('headers', {}).items() 
                   if k.lower() not in ['authorization', 'cookie']},
        'requestId': context.aws_request_id if context else None
    }
    logger.info(f"{function_name} - Request: {json.dumps(request_data, cls=JSONEncoder)}")

def log_response(response: Dict[str, Any], function_name: str):
    """Log response details for debugging"""
    response_data = {
        'statusCode': response.get('statusCode'),
        'headers': response.get('headers'),
        'body': response.get('body')[:500] + '...' if len(response.get('body', '')) > 500 else response.get('body')
    }
    logger.info(f"{function_name} - Response: {json.dumps(response_data, cls=JSONEncoder)}")
