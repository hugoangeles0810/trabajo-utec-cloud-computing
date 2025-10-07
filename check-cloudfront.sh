#!/bin/bash

# CloudFront Distribution Details
DISTRIBUTION_ID="E1NHZQ2VJ5HE9D"
DOMAIN_NAME="d3votu5y2kryc7.cloudfront.net"
PROFILE="personal"

echo "🔍 Checking CloudFront Distribution Status..."
echo "Distribution ID: $DISTRIBUTION_ID"
echo "Domain: $DOMAIN_NAME"
echo ""

# Check status
STATUS=$(aws cloudfront get-distribution --id $DISTRIBUTION_ID --profile $PROFILE --query 'Distribution.Status' --output text)
echo "Status: $STATUS"

if [ "$STATUS" = "Deployed" ]; then
    echo "✅ CloudFront is ready!"
    echo ""
    echo "🌐 Testing the distribution..."
    
    # Test with curl
    echo "Testing HTTP access..."
    curl -I "https://$DOMAIN_NAME" 2>/dev/null | head -1
    
    echo ""
    echo "Testing mobile user agent..."
    curl -I -H "User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1" "https://$DOMAIN_NAME" 2>/dev/null | head -1
    
    echo ""
    echo "🎉 Your website is now available at:"
    echo "https://$DOMAIN_NAME"
    echo ""
    echo "📱 This should work much better on mobile devices!"
    
else
    echo "⏳ CloudFront is still deploying..."
    echo "This usually takes 10-15 minutes."
    echo "Run this script again in a few minutes."
fi

