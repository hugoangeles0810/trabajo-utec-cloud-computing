#!/bin/bash

# Gamarriando Product Service - RDS Integration Testing Script
# This script tests the integration between Lambda functions and RDS Aurora PostgreSQL

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
STAGE=${1:-dev}
REGION=${2:-us-east-1}
SERVICE_NAME="gamarriando-product-service"

echo -e "${BLUE}🧪 Testing RDS Integration for Gamarriando Product Service${NC}"
echo -e "${BLUE}Stage: ${STAGE}${NC}"
echo -e "${BLUE}Region: ${REGION}${NC}"
echo ""

# Get API Gateway URL
echo -e "${YELLOW}🔍 Getting API Gateway URL...${NC}"
API_URL=$(serverless info --config serverless-rds.yml --stage $STAGE --region $REGION | grep "endpoints:" -A 1 | tail -1 | awk '{print $2}' || echo "")

if [ -z "$API_URL" ]; then
    echo -e "${RED}❌ Could not get API Gateway URL${NC}"
    exit 1
fi

echo -e "${GREEN}✅ API Gateway URL: $API_URL${NC}"
echo ""

# Test function to make HTTP requests
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local expected_status=$4
    local description=$5
    
    echo -e "${YELLOW}Testing: $description${NC}"
    echo -e "${BLUE}  $method $endpoint${NC}"
    
    if [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X $method \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$API_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X $method \
            -H "Content-Type: application/json" \
            "$API_URL$endpoint")
    fi
    
    # Split response and status code
    http_code=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" = "$expected_status" ]; then
        echo -e "${GREEN}  ✅ Status: $http_code (Expected: $expected_status)${NC}"
        echo -e "${GREEN}  ✅ Response: ${response_body:0:100}...${NC}"
        return 0
    else
        echo -e "${RED}  ❌ Status: $http_code (Expected: $expected_status)${NC}"
        echo -e "${RED}  ❌ Response: $response_body${NC}"
        return 1
    fi
    echo ""
}

# Test counters
total_tests=0
passed_tests=0
failed_tests=0

# Test Categories Endpoints
echo -e "${BLUE}📂 Testing Categories Endpoints${NC}"
echo "=================================="

# Test categories list
total_tests=$((total_tests + 1))
if test_endpoint "GET" "/api/v1/categories" "" "200" "List categories"; then
    passed_tests=$((passed_tests + 1))
else
    failed_tests=$((failed_tests + 1))
fi

# Test create category
total_tests=$((total_tests + 1))
category_data='{"name": "Test Category", "slug": "test-category", "description": "Test category for RDS integration"}'
if test_endpoint "POST" "/api/v1/categories" "$category_data" "201" "Create category"; then
    passed_tests=$((passed_tests + 1))
else
    failed_tests=$((failed_tests + 1))
fi

# Test get category
total_tests=$((total_tests + 1))
if test_endpoint "GET" "/api/v1/categories/1" "" "200" "Get category by ID"; then
    passed_tests=$((passed_tests + 1))
else
    failed_tests=$((failed_tests + 1))
fi

echo ""

# Test Vendors Endpoints
echo -e "${BLUE}🏪 Testing Vendors Endpoints${NC}"
echo "=================================="

# Test vendors list
total_tests=$((total_tests + 1))
if test_endpoint "GET" "/api/v1/vendors" "" "200" "List vendors"; then
    passed_tests=$((passed_tests + 1))
else
    failed_tests=$((failed_tests + 1))
fi

# Test create vendor
total_tests=$((total_tests + 1))
vendor_data='{"name": "Test Vendor", "email": "test@vendor.com", "phone": "+1234567890", "description": "Test vendor for RDS integration"}'
if test_endpoint "POST" "/api/v1/vendors" "$vendor_data" "201" "Create vendor"; then
    passed_tests=$((passed_tests + 1))
else
    failed_tests=$((failed_tests + 1))
fi

# Test get vendor
total_tests=$((total_tests + 1))
if test_endpoint "GET" "/api/v1/vendors/1" "" "200" "Get vendor by ID"; then
    passed_tests=$((passed_tests + 1))
else
    failed_tests=$((failed_tests + 1))
fi

echo ""

# Test Products Endpoints
echo -e "${BLUE}🛍️  Testing Products Endpoints${NC}"
echo "=================================="

# Test products list
total_tests=$((total_tests + 1))
if test_endpoint "GET" "/api/v1/products" "" "200" "List products"; then
    passed_tests=$((passed_tests + 1))
else
    failed_tests=$((failed_tests + 1))
fi

# Test create product
total_tests=$((total_tests + 1))
product_data='{"name": "Test Product", "price": 29.99, "description": "Test product for RDS integration", "category_id": 1, "vendor_id": 1, "stock": 10}'
if test_endpoint "POST" "/api/v1/products" "$product_data" "201" "Create product"; then
    passed_tests=$((passed_tests + 1))
else
    failed_tests=$((failed_tests + 1))
fi

# Test get product
total_tests=$((total_tests + 1))
if test_endpoint "GET" "/api/v1/products/1" "" "200" "Get product by ID"; then
    passed_tests=$((passed_tests + 1))
else
    failed_tests=$((failed_tests + 1))
fi

# Test update product
total_tests=$((total_tests + 1))
update_data='{"name": "Updated Test Product", "price": 39.99}'
if test_endpoint "PUT" "/api/v1/products/1" "$update_data" "200" "Update product"; then
    passed_tests=$((passed_tests + 1))
else
    failed_tests=$((failed_tests + 1))
fi

echo ""

# Test Error Handling
echo -e "${BLUE}🚨 Testing Error Handling${NC}"
echo "============================="

# Test invalid JSON
total_tests=$((total_tests + 1))
if test_endpoint "POST" "/api/v1/products" "invalid json" "400" "Invalid JSON handling"; then
    passed_tests=$((passed_tests + 1))
else
    failed_tests=$((failed_tests + 1))
fi

# Test missing required fields
total_tests=$((total_tests + 1))
invalid_data='{"name": "Test Product"}'  # Missing required fields
if test_endpoint "POST" "/api/v1/products" "$invalid_data" "400" "Missing required fields"; then
    passed_tests=$((passed_tests + 1))
else
    failed_tests=$((failed_tests + 1))
fi

# Test non-existent resource
total_tests=$((total_tests + 1))
if test_endpoint "GET" "/api/v1/products/99999" "" "404" "Non-existent resource"; then
    passed_tests=$((passed_tests + 1))
else
    failed_tests=$((failed_tests + 1))
fi

echo ""

# Test CORS
echo -e "${BLUE}🌐 Testing CORS${NC}"
echo "=================="

# Test OPTIONS request
total_tests=$((total_tests + 1))
cors_response=$(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS \
    -H "Origin: https://example.com" \
    -H "Access-Control-Request-Method: GET" \
    -H "Access-Control-Request-Headers: Content-Type" \
    "$API_URL/api/v1/products")

if [ "$cors_response" = "200" ]; then
    echo -e "${GREEN}✅ CORS preflight request successful${NC}"
    passed_tests=$((passed_tests + 1))
else
    echo -e "${RED}❌ CORS preflight request failed (Status: $cors_response)${NC}"
    failed_tests=$((failed_tests + 1))
fi

echo ""

# Performance Test
echo -e "${BLUE}⚡ Performance Test${NC}"
echo "====================="

echo -e "${YELLOW}Testing response times for 10 requests...${NC}"

total_time=0
successful_requests=0

for i in {1..10}; do
    start_time=$(date +%s%N)
    response=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/v1/categories")
    end_time=$(date +%s%N)
    
    duration=$(( (end_time - start_time) / 1000000 ))  # Convert to milliseconds
    total_time=$((total_time + duration))
    
    if [ "$response" = "200" ]; then
        successful_requests=$((successful_requests + 1))
    fi
    
    echo -e "${BLUE}  Request $i: ${duration}ms (Status: $response)${NC}"
done

avg_time=$((total_time / 10))
echo -e "${GREEN}✅ Average response time: ${avg_time}ms${NC}"
echo -e "${GREEN}✅ Successful requests: ${successful_requests}/10${NC}"

echo ""

# Display test summary
echo -e "${BLUE}📊 Test Summary${NC}"
echo "==============="
echo -e "${BLUE}Total Tests: $total_tests${NC}"
echo -e "${GREEN}Passed: $passed_tests${NC}"
echo -e "${RED}Failed: $failed_tests${NC}"

success_rate=$(( (passed_tests * 100) / total_tests ))
echo -e "${BLUE}Success Rate: ${success_rate}%${NC}"

echo ""

if [ $failed_tests -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! RDS integration is working correctly.${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some tests failed. Please check the logs and configuration.${NC}"
    echo -e "${YELLOW}   Common issues:${NC}"
    echo -e "${YELLOW}   - Database not initialized${NC}"
    echo -e "${YELLOW}   - Lambda functions not updated with RDS endpoint${NC}"
    echo -e "${YELLOW}   - VPC configuration issues${NC}"
    echo -e "${YELLOW}   - Security group rules${NC}"
    exit 1
fi
