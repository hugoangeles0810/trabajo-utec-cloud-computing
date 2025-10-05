"""
Optimized Lambda handler for Gamarriando Product Service
"""
import os
import logging
from mangum import Mangum
from app.main import app

# Configure logging for Lambda
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Create the Lambda handler with optimized settings
handler = Mangum(
    app,
    lifespan="off",  # Disable lifespan events for better performance
    api_gateway_base_path=None,  # Handle all paths
    text_mime_types=[
        "application/json",
        "application/javascript",
        "application/xml",
        "application/vnd.api+json",
        "text/plain",
        "text/html",
        "text/css",
        "text/javascript",
        "text/xml",
    ]
)

# Lambda-specific initialization
def lambda_handler(event, context):
    """
    AWS Lambda handler function
    """
    # Add Lambda context to the event
    if hasattr(context, 'aws_request_id'):
        event['lambda_context'] = {
            'request_id': context.aws_request_id,
            'function_name': context.function_name,
            'function_version': context.function_version,
            'memory_limit': context.memory_limit_in_mb,
            'remaining_time': context.get_remaining_time_in_millis()
        }
    
    # Log request info
    logger.info(f"Processing request: {event.get('httpMethod', 'UNKNOWN')} {event.get('path', '/')}")
    
    # Call the Mangum handler
    response = handler(event, context)
    
    # Log response info
    logger.info(f"Response status: {response.get('statusCode', 'UNKNOWN')}")
    
    return response
