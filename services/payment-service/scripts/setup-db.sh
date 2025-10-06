#!/bin/bash

# Gamarriando Payment Service Database Setup Script
# This script sets up the payment-related tables in the existing PostgreSQL database

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Database configuration
DB_HOST=${DB_HOST:-"gamarriando-product-service-dev.cgb6u24c81zq.us-east-1.rds.amazonaws.com"}
DB_PORT=${DB_PORT:-"5432"}
DB_NAME=${DB_NAME:-"gamarriando"}
DB_USER=${DB_USER:-"gamarriando"}
DB_PASSWORD=${DB_PASSWORD:-"Gamarriando2024!"}

echo -e "${BLUE}🚀 Setting up Gamarriando Payment Service Database${NC}"
echo -e "${BLUE}================================================${NC}"

# Check if required tools are installed
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ psql is not installed. Please install PostgreSQL client tools.${NC}"
    exit 1
fi

# Test database connection
echo -e "${YELLOW}🔍 Testing database connection...${NC}"
if ! PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" &> /dev/null; then
    echo -e "${RED}❌ Cannot connect to database. Please check your credentials and network connection.${NC}"
    echo -e "${YELLOW}Database details:${NC}"
    echo -e "  Host: $DB_HOST"
    echo -e "  Port: $DB_PORT"
    echo -e "  Database: $DB_NAME"
    echo -e "  User: $DB_USER"
    exit 1
fi

echo -e "${GREEN}✅ Database connection successful${NC}"

# Check if payment tables already exist
echo -e "${YELLOW}🔍 Checking if payment tables already exist...${NC}"
TABLE_COUNT=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('orders', 'payments', 'transactions', 'order_items');" | tr -d ' ')

if [ "$TABLE_COUNT" -eq 4 ]; then
    echo -e "${YELLOW}⚠️  Payment tables already exist. Do you want to recreate them? (y/N)${NC}"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}🗑️  Dropping existing payment tables...${NC}"
        PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "
        DROP TABLE IF EXISTS transactions CASCADE;
        DROP TABLE IF EXISTS payments CASCADE;
        DROP TABLE IF EXISTS order_items CASCADE;
        DROP TABLE IF EXISTS orders CASCADE;
        DROP VIEW IF EXISTS transaction_summary CASCADE;
        DROP VIEW IF EXISTS payment_summary CASCADE;
        DROP VIEW IF EXISTS order_summary CASCADE;
        DROP FUNCTION IF EXISTS get_user_orders(VARCHAR, INTEGER, INTEGER) CASCADE;
        DROP FUNCTION IF EXISTS calculate_order_total(INTEGER) CASCADE;
        DROP FUNCTION IF EXISTS get_payment_with_transactions(INTEGER) CASCADE;
        DROP FUNCTION IF EXISTS get_order_with_items(INTEGER) CASCADE;"
        echo -e "${GREEN}✅ Existing tables dropped${NC}"
    else
        echo -e "${YELLOW}⏭️  Skipping table creation${NC}"
        exit 0
    fi
fi

# Run the migration
echo -e "${YELLOW}📊 Running payment tables migration...${NC}"
if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$(dirname "$0")/../migrations/payment_tables.sql"; then
    echo -e "${GREEN}✅ Payment tables migration completed successfully${NC}"
else
    echo -e "${RED}❌ Migration failed. Please check the error messages above.${NC}"
    exit 1
fi

# Verify tables were created
echo -e "${YELLOW}🔍 Verifying table creation...${NC}"
TABLE_COUNT=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('orders', 'payments', 'transactions', 'order_items');" | tr -d ' ')

if [ "$TABLE_COUNT" -eq 4 ]; then
    echo -e "${GREEN}✅ All payment tables created successfully${NC}"
else
    echo -e "${RED}❌ Some tables were not created. Expected 4, found $TABLE_COUNT${NC}"
    exit 1
fi

# Show table information
echo -e "${BLUE}📋 Payment Service Tables Created:${NC}"
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name IN ('orders', 'payments', 'transactions', 'order_items')
ORDER BY table_name;"

# Show sample data
echo -e "${BLUE}📊 Sample Data:${NC}"
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "
SELECT 'Orders' as table_name, COUNT(*) as record_count FROM orders
UNION ALL
SELECT 'Order Items', COUNT(*) FROM order_items
UNION ALL
SELECT 'Payments', COUNT(*) FROM payments
UNION ALL
SELECT 'Transactions', COUNT(*) FROM transactions;"

echo -e "${GREEN}🎉 Payment Service database setup completed successfully!${NC}"
echo -e "${BLUE}================================================${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo -e "  1. Deploy the payment-service Lambda functions"
echo -e "  2. Test the API endpoints"
echo -e "  3. Verify integration with product-service"
