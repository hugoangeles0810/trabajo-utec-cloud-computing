"""
Tests for Lambda handler functionality
"""
import pytest
import json
from unittest.mock import Mock
from lambda_handler import lambda_handler


class TestLambdaHandler:
    """Test cases for Lambda handler"""
    
    def test_health_check_endpoint(self):
        """Test health check endpoint through Lambda handler"""
        # Mock Lambda event
        event = {
            "httpMethod": "GET",
            "path": "/health",
            "headers": {},
            "queryStringParameters": None,
            "body": None,
            "isBase64Encoded": False
        }
        
        # Mock Lambda context
        context = Mock()
        context.aws_request_id = "test-request-id"
        context.function_name = "test-function"
        context.function_version = "1"
        context.memory_limit_in_mb = 512
        context.get_remaining_time_in_millis.return_value = 30000
        
        # Call Lambda handler
        response = lambda_handler(event, context)
        
        # Assertions
        assert response["statusCode"] == 200
        assert "application/json" in response["headers"]["content-type"]
        
        body = json.loads(response["body"])
        assert body["status"] == "healthy"
        assert body["service"] == "product-service"
    
    def test_root_endpoint(self):
        """Test root endpoint through Lambda handler"""
        event = {
            "httpMethod": "GET",
            "path": "/",
            "headers": {},
            "queryStringParameters": None,
            "body": None,
            "isBase64Encoded": False
        }
        
        context = Mock()
        context.aws_request_id = "test-request-id"
        context.function_name = "test-function"
        context.function_version = "1"
        context.memory_limit_in_mb = 512
        context.get_remaining_time_in_millis.return_value = 30000
        
        response = lambda_handler(event, context)
        
        assert response["statusCode"] == 200
        body = json.loads(response["body"])
        assert body["message"] == "Gamarriando Product Service"
        assert body["version"] == "1.0.0"
    
    def test_products_endpoint(self):
        """Test products endpoint through Lambda handler"""
        event = {
            "httpMethod": "GET",
            "path": "/api/v1/products/",
            "headers": {},
            "queryStringParameters": None,
            "body": None,
            "isBase64Encoded": False
        }
        
        context = Mock()
        context.aws_request_id = "test-request-id"
        context.function_name = "test-function"
        context.function_version = "1"
        context.memory_limit_in_mb = 512
        context.get_remaining_time_in_millis.return_value = 30000
        
        response = lambda_handler(event, context)
        
        # Should return 200 with empty list (no products in test DB)
        assert response["statusCode"] == 200
        body = json.loads(response["body"])
        assert isinstance(body, list)
    
    def test_cors_headers(self):
        """Test that CORS headers are included"""
        event = {
            "httpMethod": "GET",
            "path": "/health",
            "headers": {
                "origin": "https://example.com"
            },
            "queryStringParameters": None,
            "body": None,
            "isBase64Encoded": False
        }
        
        context = Mock()
        context.aws_request_id = "test-request-id"
        context.function_name = "test-function"
        context.function_version = "1"
        context.memory_limit_in_mb = 512
        context.get_remaining_time_in_millis.return_value = 30000
        
        response = lambda_handler(event, context)
        
        # Check CORS headers
        assert "access-control-allow-origin" in response["headers"]
        assert "access-control-allow-methods" in response["headers"]
        assert "access-control-allow-headers" in response["headers"]
    
    def test_404_endpoint(self):
        """Test 404 for non-existent endpoint"""
        event = {
            "httpMethod": "GET",
            "path": "/non-existent-endpoint",
            "headers": {},
            "queryStringParameters": None,
            "body": None,
            "isBase64Encoded": False
        }
        
        context = Mock()
        context.aws_request_id = "test-request-id"
        context.function_name = "test-function"
        context.function_version = "1"
        context.memory_limit_in_mb = 512
        context.get_remaining_time_in_millis.return_value = 30000
        
        response = lambda_handler(event, context)
        
        assert response["statusCode"] == 404
    
    def test_lambda_context_injection(self):
        """Test that Lambda context is properly injected"""
        event = {
            "httpMethod": "GET",
            "path": "/health",
            "headers": {},
            "queryStringParameters": None,
            "body": None,
            "isBase64Encoded": False
        }
        
        context = Mock()
        context.aws_request_id = "test-request-id"
        context.function_name = "test-function"
        context.function_version = "1"
        context.memory_limit_in_mb = 512
        context.get_remaining_time_in_millis.return_value = 30000
        
        response = lambda_handler(event, context)
        
        # Verify Lambda context was added to event
        assert "lambda_context" in event
        assert event["lambda_context"]["request_id"] == "test-request-id"
        assert event["lambda_context"]["function_name"] == "test-function"
