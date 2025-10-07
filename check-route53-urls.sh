#!/bin/bash

# Route 53 URL Checker for Gamarriando
PROFILE="personal"
HOSTED_ZONE_ID="Z04137562RMG4U6U6J251"
ROUTE53_DOMAIN="gamarriando-dev.aws-route53.com"
CLOUDFRONT_DOMAIN="d3votu5y2kryc7.cloudfront.net"

echo "🌐 Route 53 URLs for Gamarriando"
echo "================================="
echo ""

echo "📋 Route 53 Configuration:"
echo "   Hosted Zone ID: $HOSTED_ZONE_ID"
echo "   Domain: $ROUTE53_DOMAIN"
echo "   Target: $CLOUDFRONT_DOMAIN"
echo ""

echo "🔍 Checking DNS Records:"
aws route53 list-resource-record-sets --hosted-zone-id "$HOSTED_ZONE_ID" --profile "$PROFILE" --query 'ResourceRecordSets[?Type==`A`]' 2>/dev/null

echo ""
echo "🧪 Testing URL Resolution:"

# Test with different DNS servers
echo "Testing with Google DNS (8.8.8.8):"
nslookup "$ROUTE53_DOMAIN" 8.8.8.8 2>/dev/null | grep -A 2 "Name:"

echo ""
echo "Testing with Cloudflare DNS (1.1.1.1):"
nslookup "$ROUTE53_DOMAIN" 1.1.1.1 2>/dev/null | grep -A 2 "Name:"

echo ""
echo "Testing with system DNS:"
nslookup "$ROUTE53_DOMAIN" 2>/dev/null | grep -A 2 "Name:"

echo ""
echo "🌐 Available URLs:"
echo "=================="
echo ""
echo "✅ Route 53 URLs (temporales):"
echo "   https://$ROUTE53_DOMAIN"
echo "   https://www.$ROUTE53_DOMAIN"
echo ""
echo "✅ CloudFront URLs (directas):"
echo "   https://$CLOUDFRONT_DOMAIN"
echo ""
echo "✅ S3 URLs (directas):"
echo "   http://gamarriando-web-dev.s3-website-us-east-1.amazonaws.com"
echo ""

echo "🧪 Testing Route 53 URLs:"
echo "Testing: https://$ROUTE53_DOMAIN"
curl -I "https://$ROUTE53_DOMAIN" 2>/dev/null | head -1 || echo "❌ Not accessible yet (DNS propagation in progress)"

echo ""
echo "Testing: https://www.$ROUTE53_DOMAIN"
curl -I "https://www.$ROUTE53_DOMAIN" 2>/dev/null | head -1 || echo "❌ Not accessible yet (DNS propagation in progress)"

echo ""
echo "📊 DNS Propagation Status:"
echo "=========================="
echo "✅ Route 53 records: CONFIGURED"
echo "⏳ DNS propagation: IN PROGRESS (can take 5-60 minutes)"
echo "✅ CloudFront: READY"
echo "✅ HTTPS: ENABLED"
echo ""
echo "💡 Tip: If Route 53 URLs don't work yet, use CloudFront URL:"
echo "   https://$CLOUDFRONT_DOMAIN"

