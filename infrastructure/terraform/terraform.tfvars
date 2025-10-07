# Terraform variables for Gamarriando Frontend Infrastructure
# This file configures the infrastructure with the exact bucket name requested

# AWS Configuration
aws_region = "us-east-1"
environment = "prod"

# Domain Configuration
domain_name = "gamarriando.com"
www_domain_name = "www.gamarriando.com"
staging_domain_name = "staging.gamarriando.com"

# S3 Bucket Configuration - EXACT NAME AS REQUESTED
bucket_name = "gamarriando-web"
staging_bucket_name = "gamarriando-web-staging"
backup_bucket_name = "gamarriando-web-backup"

# CloudFront Configuration
price_class = "PriceClass_100"
minimum_protocol_version = "TLSv1.2_2021"

# API Configuration
api_base_url = "https://c8ydsj3r02.execute-api.us-east-1.amazonaws.com/dev"
cdn_url = ""

# Feature Flags
enable_analytics = true
enable_monitoring = true
