#!/bin/bash

# Gamarriando Payment Service - Endpoint Testing Script
# This script tests all the payment service endpoints

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# API Gateway URL
API_URL="https://3abc01k7p0.execute-api.us-east-1.amazonaws.com/dev"

echo -e "${BLUE}🧪 Testing Gamarriando Payment Service Endpoints${NC}"
echo -e "${BLUE}===============================================${NC}"
echo -e "${YELLOW}API Base URL: $API_URL${NC}"
echo ""

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0
TOTAL_TESTS=0

# Function to make HTTP requests and check response
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local expected_status=$4
    local test_name=$5
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -e "${YELLOW}Testing: $test_name${NC}"
    echo -e "  ${BLUE}$method $endpoint${NC}"
    
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
    
    if [ "$http_code" -eq "$expected_status" ]; then
        echo -e "  ${GREEN}✅ PASS${NC} (Status: $http_code)"
        echo -e "  ${GREEN}Response:${NC} $response_body"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "  ${RED}❌ FAIL${NC} (Expected: $expected_status, Got: $http_code)"
        echo -e "  ${RED}Response:${NC} $response_body"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    echo ""
}

# Test 1: Create Order
echo -e "${BLUE}📦 Testing Orders Endpoints${NC}"
echo -e "${BLUE}===========================${NC}"

test_endpoint "POST" "/api/v1/orders" '{
    "user_id": "test_user_123",
    "total_amount": 199.98,
    "currency": "USD",
    "shipping_address": {
        "street": "123 Test St",
        "city": "Test City",
        "state": "TS",
        "zip_code": "12345",
        "country": "USA"
    },
    "billing_address": {
        "street": "123 Test St",
        "city": "Test City",
        "state": "TS",
        "zip_code": "12345",
        "country": "USA"
    },
    "notes": "Test order for endpoint testing",
    "order_items": [
        {
            "product_id": 1,
            "quantity": 1,
            "unit_price": 999.99,
            "total_price": 999.99
        },
        {
            "product_id": 4,
            "quantity": 2,
            "unit_price": 19.99,
            "total_price": 39.98
        }
    ]
}' 201 "Create Order"

# Extract order ID from response (we'll use a fixed ID for subsequent tests)
ORDER_ID=1

# Test 2: Get Order
test_endpoint "GET" "/api/v1/orders/$ORDER_ID" "" 200 "Get Order by ID"

# Test 3: List Orders
test_endpoint "GET" "/api/v1/orders" "" 200 "List Orders"

# Test 4: List Orders with filters
test_endpoint "GET" "/api/v1/orders?user_id=test_user_123&status=pending" "" 200 "List Orders with Filters"

# Test 5: Update Order
test_endpoint "PUT" "/api/v1/orders/$ORDER_ID" '{
    "status": "processing",
    "notes": "Updated order status for testing"
}' 200 "Update Order"

echo -e "${BLUE}💳 Testing Payments Endpoints${NC}"
echo -e "${BLUE}=============================${NC}"

# Test 6: Create Payment
test_endpoint "POST" "/api/v1/payments" '{
    "order_id": 1,
    "amount": 199.98,
    "currency": "USD",
    "payment_method": "credit_card",
    "status": "pending",
    "metadata": {
        "card_last4": "4242",
        "card_brand": "visa"
    }
}' 201 "Create Payment"

# Extract payment ID from response (we'll use a fixed ID for subsequent tests)
PAYMENT_ID=1

# Test 7: Get Payment
test_endpoint "GET" "/api/v1/payments/$PAYMENT_ID" "" 200 "Get Payment by ID"

# Test 8: List Payments
test_endpoint "GET" "/api/v1/payments" "" 200 "List Payments"

# Test 9: List Payments with filters
test_endpoint "GET" "/api/v1/payments?order_id=1&status=pending" "" 200 "List Payments with Filters"

# Test 10: Update Payment
test_endpoint "PUT" "/api/v1/payments/$PAYMENT_ID" '{
    "status": "processing",
    "metadata": {
        "card_last4": "4242",
        "card_brand": "visa",
        "updated": true
    }
}' 200 "Update Payment"

# Test 11: Process Payment
test_endpoint "POST" "/api/v1/payments/$PAYMENT_ID/process" '{
    "gateway": "stripe",
    "card_token": "tok_test_123"
}' 200 "Process Payment"

# Test 12: Refund Payment
test_endpoint "POST" "/api/v1/payments/$PAYMENT_ID/refund" '{
    "amount": 50.00,
    "reason": "Customer request"
}' 200 "Refund Payment"

echo -e "${BLUE}🔄 Testing Transactions Endpoints${NC}"
echo -e "${BLUE}=================================${NC}"

# Test 13: Create Transaction
test_endpoint "POST" "/api/v1/transactions" '{
    "payment_id": 1,
    "transaction_type": "payment",
    "amount": 199.98,
    "currency": "USD",
    "status": "completed",
    "gateway_transaction_id": "txn_test_123456",
    "gateway_response": {
        "transaction_id": "txn_test_123456",
        "gateway": "stripe",
        "processed_at": "2024-01-15T10:30:00Z"
    },
    "metadata": {
        "test": true
    }
}' 201 "Create Transaction"

# Extract transaction ID from response (we'll use a fixed ID for subsequent tests)
TRANSACTION_ID=1

# Test 14: Get Transaction
test_endpoint "GET" "/api/v1/transactions/$TRANSACTION_ID" "" 200 "Get Transaction by ID"

# Test 15: List Transactions
test_endpoint "GET" "/api/v1/transactions" "" 200 "List Transactions"

# Test 16: List Transactions with filters
test_endpoint "GET" "/api/v1/transactions?payment_id=1&transaction_type=payment" "" 200 "List Transactions with Filters"

# Test 17: Test CORS (OPTIONS request)
echo -e "${BLUE}🌐 Testing CORS${NC}"
echo -e "${BLUE}===============${NC}"

test_endpoint "OPTIONS" "/api/v1/orders" "" 200 "CORS Preflight Request"

# Test 18: Test Error Handling
echo -e "${BLUE}⚠️  Testing Error Handling${NC}"
echo -e "${BLUE}===========================${NC}"

test_endpoint "GET" "/api/v1/orders/99999" "" 404 "Get Non-existent Order"
test_endpoint "GET" "/api/v1/payments/99999" "" 404 "Get Non-existent Payment"
test_endpoint "GET" "/api/v1/transactions/99999" "" 404 "Get Non-existent Transaction"

# Test 19: Test Invalid Data
test_endpoint "POST" "/api/v1/orders" '{
    "invalid": "data"
}' 400 "Create Order with Invalid Data"

# Test 20: Test Database Integration
echo -e "${BLUE}🗄️  Testing Database Integration${NC}"
echo -e "${BLUE}===============================${NC}"

# Test that we can retrieve the sample data we created during migration
test_endpoint "GET" "/api/v1/orders/1" "" 200 "Get Sample Order from Database"
test_endpoint "GET" "/api/v1/payments/1" "" 200 "Get Sample Payment from Database"
test_endpoint "GET" "/api/v1/transactions/1" "" 200 "Get Sample Transaction from Database"

# Summary
echo -e "${BLUE}📊 Test Summary${NC}"
echo -e "${BLUE}===============${NC}"
echo -e "${GREEN}Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Tests Failed: $TESTS_FAILED${NC}"
echo -e "${BLUE}Total Tests: $TOTAL_TESTS${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! Payment service is working correctly.${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Please check the errors above.${NC}"
    exit 1
fi
