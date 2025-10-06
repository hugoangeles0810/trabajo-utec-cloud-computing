#!/bin/bash

# Gamarriando User Service - Database Setup Script
# This script creates the user service database schema in the existing PostgreSQL instance

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Load environment variables from .env file if it exists
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/../.env"

if [ -f "$ENV_FILE" ]; then
    echo -e "${BLUE}📄 Loading environment variables from .env file...${NC}"
    # Export variables from .env file (skip comments and empty lines)
    export $(grep -v '^#' "$ENV_FILE" | grep -v '^$' | xargs)
fi

# Database configuration (same as product-service and payment-service)
# IMPORTANT: Set these environment variables or use .env file
# Do not use default values with real credentials for security
DB_HOST="${DB_HOST}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME}"
DB_USER="${DB_USER}"
DB_PASSWORD="${DB_PASSWORD}"

# Validate required environment variables
if [ -z "$DB_HOST" ] || [ -z "$DB_NAME" ] || [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ]; then
    echo -e "${RED}❌ Error: Required database environment variables are not set.${NC}"
    echo -e "${YELLOW}Please set the following environment variables:${NC}"
    echo -e "  DB_HOST - Database host"
    echo -e "  DB_NAME - Database name"
    echo -e "  DB_USER - Database user"
    echo -e "  DB_PASSWORD - Database password"
    echo -e ""
    echo -e "${YELLOW}You can either:${NC}"
    echo -e "  1. Set them as environment variables"
    echo -e "  2. Create a .env file in the user-service directory"
    echo -e "  3. Export them in your shell"
    echo -e ""
    echo -e "${YELLOW}Example:${NC}"
    echo -e "  export DB_HOST=your-db-host"
    echo -e "  export DB_NAME=your-db-name"
    echo -e "  export DB_USER=your-db-user"
    echo -e "  export DB_PASSWORD=your-db-password"
    exit 1
fi

echo -e "${BLUE}🚀 Setting up User Service Database Schema${NC}"
echo -e "${BLUE}==========================================${NC}"

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ Error: psql command not found. Please install PostgreSQL client tools.${NC}"
    exit 1
fi

# Test database connection
echo -e "${YELLOW}🔍 Testing database connection...${NC}"
if ! PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Cannot connect to database. Please check your credentials and network connection.${NC}"
    echo -e "${YELLOW}Database details:${NC}"
    echo -e "  Host: $DB_HOST"
    echo -e "  Port: $DB_PORT"
    echo -e "  Database: $DB_NAME"
    echo -e "  User: $DB_USER"
    exit 1
fi

echo -e "${GREEN}✅ Database connection successful${NC}"

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MIGRATION_FILE="$SCRIPT_DIR/../migrations/user_tables.sql"

# Check if migration file exists
if [ ! -f "$MIGRATION_FILE" ]; then
    echo -e "${RED}❌ Error: Migration file not found at $MIGRATION_FILE${NC}"
    exit 1
fi

echo -e "${YELLOW}📄 Found migration file: $MIGRATION_FILE${NC}"

# Execute the migration
echo -e "${YELLOW}🔄 Executing database migration...${NC}"
if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$MIGRATION_FILE"; then
    echo -e "${GREEN}✅ Database migration completed successfully!${NC}"
else
    echo -e "${RED}❌ Error: Database migration failed${NC}"
    exit 1
fi

# Verify the tables were created
echo -e "${YELLOW}🔍 Verifying table creation...${NC}"
TABLES=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'user_roles', 'user_sessions', 'password_reset_tokens', 'email_verification_tokens')
ORDER BY table_name;
")

if [ -n "$TABLES" ]; then
    echo -e "${GREEN}✅ User service tables created successfully:${NC}"
    echo "$TABLES" | while read -r table; do
        if [ -n "$table" ]; then
            echo -e "  📋 $table"
        fi
    done
else
    echo -e "${RED}❌ Error: Tables were not created properly${NC}"
    exit 1
fi

# Check sample data
echo -e "${YELLOW}🔍 Checking sample data...${NC}"
USER_COUNT=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM users;")
ROLE_COUNT=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM user_roles;")

echo -e "${GREEN}✅ Sample data inserted:${NC}"
echo -e "  👥 Users: $USER_COUNT"
echo -e "  🎭 Roles: $ROLE_COUNT"

# Test the views and functions
echo -e "${YELLOW}🔍 Testing views and functions...${NC}"
if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT COUNT(*) FROM user_profiles;" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Views created successfully${NC}"
else
    echo -e "${RED}❌ Error: Views were not created properly${NC}"
    exit 1
fi

if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT cleanup_expired_sessions();" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Functions created successfully${NC}"
else
    echo -e "${RED}❌ Error: Functions were not created properly${NC}"
    exit 1
fi

echo -e "${BLUE}==========================================${NC}"
echo -e "${GREEN}🎉 User Service Database Setup Complete!${NC}"
echo -e "${BLUE}==========================================${NC}"
echo -e "${YELLOW}📋 Summary:${NC}"
echo -e "  🗄️  Database: $DB_NAME"
echo -e "  🏠 Host: $DB_HOST:$DB_PORT"
echo -e "  📊 Tables: 5 (users, user_roles, user_sessions, password_reset_tokens, email_verification_tokens)"
echo -e "  👁️  Views: 2 (user_profiles, active_sessions)"
echo -e "  ⚙️  Functions: 4 (cleanup_expired_sessions, cleanup_expired_tokens, get_user_with_roles, validate_user_credentials)"
echo -e "  👥 Sample Users: $USER_COUNT"
echo -e "  🎭 Sample Roles: $ROLE_COUNT"
echo -e ""
echo -e "${YELLOW}🔐 Sample Users Created:${NC}"
echo -e "  👤 admin@gamarriando.com (admin user)"
echo -e "  👤 john.doe@example.com (customer)"
echo -e "  👤 jane.smith@example.com (customer, unverified)"
echo -e "  👤 vendor@example.com (vendor)"
echo -e ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo -e "  1. Configure user-service infrastructure"
echo -e "  2. Create Lambda functions"
echo -e "  3. Deploy to AWS"
echo -e "  4. Test endpoints"
echo -e ""
echo -e "${GREEN}✅ Ready for user-service implementation!${NC}"
